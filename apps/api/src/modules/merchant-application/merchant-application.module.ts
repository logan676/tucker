import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantApplication } from './entities/merchant-application.entity';
import { ApplicationReviewLog } from './entities/application-review-log.entity';
import { Merchant } from '../merchant/entities/merchant.entity';
import { User } from '../user/entities/user.entity';
import { MerchantApplicationService } from './merchant-application.service';
import { MerchantApplicationController } from './merchant-application.controller';
import { MerchantApplicationAdminController } from './merchant-application-admin.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantApplication,
      ApplicationReviewLog,
      Merchant,
      User,
    ]),
    NotificationModule,
  ],
  controllers: [
    MerchantApplicationController,
    MerchantApplicationAdminController,
  ],
  providers: [MerchantApplicationService],
  exports: [MerchantApplicationService],
})
export class MerchantApplicationModule {}
