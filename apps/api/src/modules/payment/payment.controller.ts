import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentStatusDto,
  PaymentCallbackDto,
} from './dto/create-payment.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create payment for order' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async createPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(userId, dto);
  }

  @Get(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, type: PaymentStatusDto })
  async getPaymentStatus(
    @CurrentUser('id') userId: string,
    @Param('id') paymentId: string,
  ): Promise<PaymentStatusDto> {
    return this.paymentService.getPaymentStatus(userId, paymentId);
  }

  // Mock payment endpoint - simulates user completing payment
  @Get(':id/mock-pay')
  @Public()
  @ApiOperation({ summary: 'Mock payment completion (for testing)' })
  @ApiResponse({ status: 200 })
  async mockPay(
    @Param('id') paymentId: string,
    @Query('success') success: string = 'true',
  ): Promise<{ message: string; status: string }> {
    const isSuccess = success !== 'false';
    await this.paymentService.mockPaymentCallback(paymentId, isSuccess);
    return {
      message: isSuccess ? 'Payment successful' : 'Payment failed',
      status: isSuccess ? 'success' : 'failed',
    };
  }

  // Webhook endpoint for payment provider callbacks
  @Post('callback')
  @Public()
  @ApiOperation({ summary: 'Payment callback webhook' })
  @ApiResponse({ status: 200 })
  async paymentCallback(@Body() dto: PaymentCallbackDto): Promise<{ received: boolean }> {
    await this.paymentService.mockPaymentCallback(dto.paymentId, dto.success);
    return { received: true };
  }
}
