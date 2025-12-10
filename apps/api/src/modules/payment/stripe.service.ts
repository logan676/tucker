import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency?: string;
  orderId: string;
  userId: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: Stripe.PaymentIntent.Status;
}

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const secretKey = this.configService.get<string>('stripe.secretKey');

    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia',
      });
      console.log('Stripe client initialized');
    } else {
      console.warn('Stripe secret key not configured, payment processing disabled');
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'cny',
      metadata: {
        orderId: params.orderId,
        userId: params.userId,
        ...params.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status,
    };
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    return this.stripe.refunds.create(refundParams);
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
