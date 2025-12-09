import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/entities/user.entity';
import { Merchant } from '../merchant/entities/merchant.entity';
import { Category } from '../merchant/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { ProductCategory } from '../product/entities/product-category.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Merchant,
      Category,
      Product,
      ProductCategory,
      Order,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
