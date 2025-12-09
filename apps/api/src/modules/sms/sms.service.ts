import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService implements OnModuleInit {
  private client: Twilio | null = null;
  private fromNumber: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const accountSid = this.configService.get<string>('sms.twilioAccountSid');
    const authToken = this.configService.get<string>('sms.twilioAuthToken');
    this.fromNumber = this.configService.get<string>('sms.twilioFromNumber') || '';

    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
      console.log('Twilio SMS client initialized');
    } else {
      console.warn('Twilio credentials not configured, SMS sending disabled');
    }
  }

  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    if (!this.client) {
      console.warn(`[SMS Mock] Would send code ${code} to ${phone}`);
      return true;
    }

    try {
      const message = await this.client.messages.create({
        body: `Your Tucker verification code is: ${code}. Valid for 5 minutes.`,
        from: this.fromNumber,
        to: phone,
      });

      console.log(`[SMS] Sent verification code to ${phone}, SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error(`[SMS] Failed to send to ${phone}:`, error);
      return false;
    }
  }

  async sendOrderNotification(phone: string, orderNo: string, message: string): Promise<boolean> {
    if (!this.client) {
      console.warn(`[SMS Mock] Would send order notification to ${phone}: ${message}`);
      return true;
    }

    try {
      const result = await this.client.messages.create({
        body: `[Tucker] Order #${orderNo}: ${message}`,
        from: this.fromNumber,
        to: phone,
      });

      console.log(`[SMS] Sent order notification to ${phone}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error(`[SMS] Failed to send order notification to ${phone}:`, error);
      return false;
    }
  }
}
