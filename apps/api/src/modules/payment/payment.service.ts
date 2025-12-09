import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentStatusDto,
  PaymentMethod,
} from './dto/create-payment.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'success' | 'failed' | 'expired';
  createdAt: Date;
  expireAt: Date;
  paidAt?: Date;
}

@Injectable()
export class PaymentService {
  // In-memory storage for mock payments (use Redis/DB in production)
  private payments = new Map<string, PaymentRecord>();

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
    const existingPayment = Array.from(this.payments.values()).find(
      (p) => p.orderId === dto.orderId && p.status === 'pending',
    );

    if (existingPayment && existingPayment.expireAt > new Date()) {
      return {
        paymentId: existingPayment.id,
        orderId: existingPayment.orderId,
        amount: existingPayment.amount,
        method: existingPayment.method,
        paymentUrl: this.generatePaymentUrl(existingPayment.id, existingPayment.method),
        expireAt: existingPayment.expireAt,
      };
    }

    // Create new payment record
    const paymentId = this.generatePaymentId();
    const expireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const payment: PaymentRecord = {
      id: paymentId,
      orderId: order.id,
      userId,
      amount: Number(order.payAmount),
      method: dto.method,
      status: 'pending',
      createdAt: new Date(),
      expireAt,
    };

    this.payments.set(paymentId, payment);

    return {
      paymentId,
      orderId: order.id,
      amount: payment.amount,
      method: dto.method,
      paymentUrl: this.generatePaymentUrl(paymentId, dto.method),
      expireAt,
    };
  }

  async getPaymentStatus(
    userId: string,
    paymentId: string,
  ): Promise<PaymentStatusDto> {
    const payment = this.payments.get(paymentId);

    if (!payment || payment.userId !== userId) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Payment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if expired
    if (payment.status === 'pending' && payment.expireAt < new Date()) {
      payment.status = 'expired';
    }

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      paidAt: payment.paidAt,
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentStatusDto> {
    const payment = this.payments.get(paymentId);

    if (!payment) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Payment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payment.status !== 'pending') {
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        'Payment is not pending',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payment.expireAt < new Date()) {
      payment.status = 'expired';
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        'Payment has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update payment status
    payment.status = 'success';
    payment.paidAt = new Date();

    // Update order status
    await this.orderRepository.update(payment.orderId, {
      status: OrderStatus.PENDING_CONFIRM,
      paidAt: payment.paidAt,
    });

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      paidAt: payment.paidAt,
    };
  }

  // Mock: Simulate payment callback from payment provider
  async mockPaymentCallback(paymentId: string, success: boolean): Promise<void> {
    const payment = this.payments.get(paymentId);

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
      payment.status = 'failed';
    }
  }

  private generatePaymentId(): string {
    return `PAY${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  private generatePaymentUrl(paymentId: string, method: PaymentMethod): string {
    // Mock payment URL - in production this would be a real payment gateway URL
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/v1/payments/${paymentId}/mock-pay?method=${method}`;
  }
}
