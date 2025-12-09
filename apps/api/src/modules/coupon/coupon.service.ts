import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon, CouponStatus, DiscountType } from './entities/coupon.entity';
import { UserCoupon } from './entities/user-coupon.entity';
import {
  CreateCouponDto,
  ApplyCouponDto,
  ApplyCouponResponseDto,
  CouponResponseDto,
} from './dto/create-coupon.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';
import { PaginatedResult } from '@/common/dto/pagination.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    // Check if code already exists
    const existing = await this.couponRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_FAILED,
        'Coupon code already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const coupon = this.couponRepository.create({
      ...dto,
      status: CouponStatus.ACTIVE,
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    status?: CouponStatus,
  ): Promise<PaginatedResult<Coupon>> {
    const qb = this.couponRepository.createQueryBuilder('coupon');

    if (status) {
      qb.where('coupon.status = :status', { status });
    }

    qb.orderBy('coupon.createdAt', 'DESC');

    const total = await qb.getCount();
    const coupons = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResult(coupons, page, pageSize, total);
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Coupon not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.couponRepository.findOne({ where: { code } });
  }

  async validateCoupon(
    userId: string,
    dto: ApplyCouponDto,
  ): Promise<ApplyCouponResponseDto> {
    const coupon = await this.findByCode(dto.code);

    if (!coupon) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Invalid coupon code',
      };
    }

    // Check status
    if (coupon.status !== CouponStatus.ACTIVE) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon is not active',
      };
    }

    // Check date range
    const now = new Date();
    if (now < coupon.startDate) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon is not yet valid',
      };
    }

    if (now > coupon.endDate) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon has expired',
      };
    }

    // Check minimum order amount
    if (dto.orderAmount < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order amount is ${coupon.minOrderAmount}`,
      };
    }

    // Check merchant restriction
    if (coupon.merchantId && coupon.merchantId !== dto.merchantId) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon is not valid for this merchant',
      };
    }

    // Check total usage limit
    if (coupon.totalLimit > 0 && coupon.usageCount >= coupon.totalLimit) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Coupon usage limit reached',
      };
    }

    // Check per-user usage limit
    const userUsageCount = await this.userCouponRepository.count({
      where: { userId, couponId: coupon.id },
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'You have already used this coupon',
      };
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (dto.orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Discount cannot exceed order amount
    if (discountAmount > dto.orderAmount) {
      discountAmount = dto.orderAmount;
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      coupon: this.formatCoupon(coupon),
    };
  }

  async applyCoupon(
    userId: string,
    couponCode: string,
    orderId: string,
    merchantId: string,
    orderAmount: number,
  ): Promise<number> {
    const validation = await this.validateCoupon(userId, {
      code: couponCode,
      merchantId,
      orderAmount,
    });

    if (!validation.valid) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_FAILED,
        validation.message || 'Invalid coupon',
        HttpStatus.BAD_REQUEST,
      );
    }

    const coupon = await this.findByCode(couponCode);
    if (!coupon) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Coupon not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Record usage
    const userCoupon = this.userCouponRepository.create({
      userId,
      couponId: coupon.id,
      orderId,
      usedAt: new Date(),
    });
    await this.userCouponRepository.save(userCoupon);

    // Increment usage count
    await this.couponRepository.increment({ id: coupon.id }, 'usageCount', 1);

    return validation.discountAmount;
  }

  async update(id: string, dto: Partial<CreateCouponDto>): Promise<Coupon> {
    const coupon = await this.findById(id);
    Object.assign(coupon, dto);
    return this.couponRepository.save(coupon);
  }

  async disable(id: string): Promise<Coupon> {
    const coupon = await this.findById(id);
    coupon.status = CouponStatus.DISABLED;
    return this.couponRepository.save(coupon);
  }

  async getAvailableCoupons(
    userId: string,
    merchantId?: string,
    orderAmount?: number,
  ): Promise<CouponResponseDto[]> {
    const now = new Date();

    const qb = this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.status = :status', { status: CouponStatus.ACTIVE })
      .andWhere('coupon.startDate <= :now', { now })
      .andWhere('coupon.endDate >= :now', { now });

    if (merchantId) {
      qb.andWhere('(coupon.merchantId IS NULL OR coupon.merchantId = :merchantId)', {
        merchantId,
      });
    }

    if (orderAmount !== undefined) {
      qb.andWhere('coupon.minOrderAmount <= :orderAmount', { orderAmount });
    }

    const coupons = await qb.getMany();

    // Filter by user usage
    const result: CouponResponseDto[] = [];
    for (const coupon of coupons) {
      // Check total limit
      if (coupon.totalLimit > 0 && coupon.usageCount >= coupon.totalLimit) {
        continue;
      }

      // Check per-user limit
      const userUsageCount = await this.userCouponRepository.count({
        where: { userId, couponId: coupon.id },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        continue;
      }

      result.push(this.formatCoupon(coupon));
    }

    return result;
  }

  private formatCoupon(coupon: Coupon): CouponResponseDto {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderAmount: Number(coupon.minOrderAmount),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : 0,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
    };
  }
}
