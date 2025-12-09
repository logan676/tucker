import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '@/modules/merchant/entities/merchant.entity';
import { UserRole } from '@/modules/user/entities/user.entity';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

@Injectable()
export class MerchantOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BusinessException(
        ErrorCodes.UNAUTHORIZED,
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Admin can access everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // User must have merchant role
    if (user.role !== UserRole.MERCHANT) {
      throw new BusinessException(
        ErrorCodes.FORBIDDEN,
        'Access denied. Merchant role required.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Find the merchant owned by this user
    const merchant = await this.merchantRepository.findOne({
      where: { ownerId: user.id },
    });

    if (!merchant) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'You do not own any merchant',
        HttpStatus.FORBIDDEN,
      );
    }

    // Attach merchant to request for use in controllers
    request.merchant = merchant;

    return true;
  }
}
