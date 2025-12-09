import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController, AdminCouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { Coupon } from './entities/coupon.entity';
import { UserCoupon } from './entities/user-coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, UserCoupon])],
  controllers: [CouponController, AdminCouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
