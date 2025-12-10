import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../user/entities/user.entity';
import { SendSmsDto, SendSmsResponseDto } from './dto/send-sms.dto';
import { PhoneLoginDto, LoginResponseDto, UserDto } from './dto/phone-login.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { AdminLoginDto, AdminLoginResponseDto, AdminUserDto } from './dto/admin-login.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';
import { RedisService } from '@/modules/redis/redis.service';
import { SmsService } from '@/modules/sms/sms.service';

interface SmsCodeEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly SMS_CODE_PREFIX = 'sms:code:';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly smsService: SmsService,
  ) {}

  async sendSms(dto: SendSmsDto): Promise<SendSmsResponseDto> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireSeconds = this.configService.get<number>('app.smsCodeExpireSeconds') || 300;
    const expiresAt = Date.now() + expireSeconds * 1000;

    // Store code in Redis with TTL
    const redisKey = `${this.SMS_CODE_PREFIX}${dto.phone}`;
    await this.redisService.setJson<SmsCodeEntry>(redisKey, { code, expiresAt }, expireSeconds);

    // In development, log the code
    if (this.configService.get('app.nodeEnv') !== 'production') {
      console.log(`[SMS] Code for ${dto.phone}: ${code}`);
    }

    // Send SMS via Twilio (in production)
    if (this.configService.get('app.nodeEnv') === 'production') {
      await this.smsService.sendVerificationCode(dto.phone, code);
    }

    return { expireIn: 60 };
  }

  async phoneLogin(dto: PhoneLoginDto): Promise<LoginResponseDto> {
    // Verify SMS code from Redis
    const redisKey = `${this.SMS_CODE_PREFIX}${dto.phone}`;
    const storedEntry = await this.redisService.getJson<SmsCodeEntry>(redisKey);

    if (!storedEntry) {
      throw new BusinessException(
        ErrorCodes.INVALID_VERIFICATION_CODE,
        'Verification code not found or expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (Date.now() > storedEntry.expiresAt) {
      await this.redisService.del(redisKey);
      throw new BusinessException(
        ErrorCodes.INVALID_VERIFICATION_CODE,
        'Verification code expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // In development, accept '123456' as universal code
    const isValidCode =
      storedEntry.code === dto.code ||
      (this.configService.get('app.nodeEnv') !== 'production' && dto.code === '123456');

    if (!isValidCode) {
      throw new BusinessException(
        ErrorCodes.INVALID_VERIFICATION_CODE,
        'Invalid verification code',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Clear used code from Redis
    await this.redisService.del(redisKey);

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      user = this.userRepository.create({
        phone: dto.phone,
        name: `User${dto.phone.slice(-4)}`,
      });
      await this.userRepository.save(user);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.formatUser(user),
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('jwt.secret'),
      });

      if (payload.type !== 'refresh') {
        throw new BusinessException(
          ErrorCodes.INVALID_TOKEN,
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new BusinessException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        ErrorCodes.TOKEN_EXPIRED,
        'Token expired or invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const accessTokenExpiresIn = this.configService.get('jwt.accessTokenExpiresIn') || '15m';
    const refreshTokenExpiresIn = this.configService.get('jwt.refreshTokenExpiresIn') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, phone: user.phone, type: 'access' },
        { expiresIn: accessTokenExpiresIn },
      ),
      this.jwtService.signAsync(
        { sub: user.id, type: 'refresh' },
        { expiresIn: refreshTokenExpiresIn },
      ),
    ]);

    // Parse expiry time to seconds
    const expiresIn = this.parseExpiryToSeconds(accessTokenExpiresIn);

    return { accessToken, refreshToken, expiresIn };
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  private formatUser(user: User): UserDto {
    return {
      id: user.id,
      phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      name: user.name,
      avatar: user.avatar,
    };
  }

  // Admin login with email and password
  async adminLogin(dto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    // Find user by email with password field
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if user is admin
    if (user.role !== UserRole.ADMIN) {
      throw new BusinessException(
        ErrorCodes.FORBIDDEN,
        'Access denied. Admin privileges required.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check password
    if (!user.password) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Password not set for this account',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.formatAdminUser(user),
    };
  }

  private formatAdminUser(user: User): AdminUserDto {
    return {
      id: user.id,
      email: user.email || '',
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    };
  }

  // Hash password utility
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
