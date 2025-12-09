import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantOwnerController } from './merchant-owner.controller';
import { MerchantOwnerService } from './merchant-owner.service';
import { Order } from '@/modules/order/entities/order.entity';
import { Product } from '@/modules/product/entities/product.entity';
import { Merchant } from '@/modules/merchant/entities/merchant.entity';
import { MerchantOwnerGuard } from '@/common/guards/merchant-owner.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Merchant])],
  controllers: [MerchantOwnerController],
  providers: [MerchantOwnerService, MerchantOwnerGuard],
  exports: [MerchantOwnerService],
})
export class MerchantOwnerModule {}
