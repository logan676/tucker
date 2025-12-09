import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { StripeService } from './stripe.service';
import { RedisService } from '@/modules/redis/redis.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentStatusDto,
} from './dto/create-payment.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

@Injectable()
export class PaymentService {
  private readonly PAYMENT_CACHE_PREFIX = 'payment:';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly redisService: RedisService,
  ) {}

  async createPayment(
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    // Validate order
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, userId },
    });

    if (!order) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        'Order is not pending payment',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if payment already exists for this order
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        orderId: dto.orderId,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment && existingPayment.expireAt > new Date()) {
      return {
        paymentId: existingPayment.id,
        orderId: existingPayment.orderId,
        amount: Number(existingPayment.amount),
        method: dto.method as any,
        paymentUrl: this.generatePaymentUrl(existingPayment),
        expireAt: existingPayment.expireAt,
      };
    }

    const expireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const amount = Number(order.payAmount);

    // Create payment record
    const payment = this.paymentRepository.create({
      orderId: order.id,
      userId,
      amount,
      method: dto.method as PaymentMethod,
      status: PaymentStatus.PENDING,
      expireAt,
    });

    // If Stripe is configured, create a PaymentIntent
    if (this.stripeService.isConfigured() && dto.method === 'card') {
      try {
        const paymentIntent = await this.stripeService.createPaymentIntent({
          amount: Math.round(amount * 100), // Convert to cents
          orderId: order.id,
          userId,
          currency: 'cny',
        });

        payment.stripePaymentIntentId = paymentIntent.paymentIntentId;
        payment.stripeClientSecret = paymentIntent.clientSecret;
      } catch (error) {
        console.error('Failed to create Stripe PaymentIntent:', error);
        // Fall back to mock payment
      }
    }

    await this.paymentRepository.save(payment);

    // Cache payment for quick lookup
    await this.redisService.setJson(
      `${this.PAYMENT_CACHE_PREFIX}${payment.id}`,
      {
        id: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
        status: payment.status,
      },
      900, // 15 minutes
    );

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount,
      method: dto.method as any,
      paymentUrl: this.generatePaymentUrl(payment),
      expireAt,
    };
  }

  async getPaymentStatus(
    userId: string,
    paymentId: string,
  ): Promise<PaymentStatusDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Payment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if expired
    if (payment.status === PaymentStatus.PENDING && payment.expireAt < new Date()) {
      payment.status = PaymentStatus.EXPIRED;
      await this.paymentRepository.save(payment);
    }

    // If Stripe payment, check latest status
    if (payment.stripePaymentIntentId && payment.status === PaymentStatus.PENDING) {
      try {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(
          payment.stripePaymentIntentId,
        );

        if (paymentIntent.status === 'succeeded') {
          await this.confirmPayment(paymentId);
          payment.status = PaymentStatus.SUCCESS;
        } else if (paymentIntent.status === 'canceled') {
          payment.status = PaymentStatus.FAILED;
          await this.paymentRepository.save(payment);
        }
      } catch (error) {
        console.error('Failed to retrieve Stripe PaymentIntent:', error);
      }
    }

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status as any,
      paidAt: payment.paidAt,
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentStatusDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Payment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        'Payment is not pending',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payment.expireAt < new Date()) {
      payment.status = PaymentStatus.EXPIRED;
      await this.paymentRepository.save(payment);
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        'Payment has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update payment status
    payment.status = PaymentStatus.SUCCESS;
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    // Update order status
    await this.orderRepository.update(payment.orderId, {
      status: OrderStatus.PENDING_CONFIRM,
      paidAt: payment.paidAt,
    });

    // Clear cache
    await this.redisService.del(`${this.PAYMENT_CACHE_PREFIX}${paymentId}`);

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status as any,
      paidAt: payment.paidAt,
    };
  }

  // Handle Stripe webhook
  async handleStripeWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const payment = await this.paymentRepository.findOne({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment && payment.status === PaymentStatus.PENDING) {
          await this.confirmPayment(payment.id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const payment = await this.paymentRepository.findOne({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment && payment.status === PaymentStatus.PENDING) {
          payment.status = PaymentStatus.FAILED;
          payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
          await this.paymentRepository.save(payment);
        }
        break;
      }
    }
  }

  // Mock: Simulate payment callback from payment provider
  async mockPaymentCallback(paymentId: string, success: boolean): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Payment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (success) {
      await this.confirmPayment(paymentId);
    } else {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
    }
  }

  private generatePaymentUrl(payment: Payment): string {
    // If Stripe client secret is available, return it for frontend Stripe.js
    if (payment.stripeClientSecret) {
      return payment.stripeClientSecret;
    }

    // Mock payment URL for testing
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/v1/payments/${payment.id}/mock-pay?method=${payment.method}`;
  }
}
