import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendSmsDto, SendSmsResponseDto } from './dto/send-sms.dto';
import { PhoneLoginDto, LoginResponseDto } from './dto/phone-login.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { AdminLoginDto, AdminLoginResponseDto } from './dto/admin-login.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sms/send')
  @ApiOperation({ summary: 'Send SMS verification code' })
  @ApiResponse({ status: 200, type: SendSmsResponseDto })
  async sendSms(@Body() dto: SendSmsDto): Promise<SendSmsResponseDto> {
    return this.authService.sendSms(dto);
  }

  @Public()
  @Post('login/phone')
  @ApiOperation({ summary: 'Login or register with phone number' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async phoneLogin(@Body() dto: PhoneLoginDto): Promise<LoginResponseDto> {
    return this.authService.phoneLogin(dto);
  }

  @Public()
  @Post('login/admin')
  @ApiOperation({ summary: 'Admin login with email and password' })
  @ApiResponse({ status: 200, type: AdminLoginResponseDto })
  async adminLogin(@Body() dto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return this.authService.adminLogin(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(dto);
  }
}
