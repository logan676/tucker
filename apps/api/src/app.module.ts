import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminModule } from './modules/admin/admin.module';
import { RedisModule } from './modules/redis/redis.module';
import { SmsModule } from './modules/sms/sms.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { MerchantOwnerModule } from './modules/merchant-owner/merchant-owner.module';
import { NotificationModule } from './modules/notification/notification.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import smsConfig from './config/sms.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, redisConfig, smsConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
    }),

    // Core modules
    RedisModule,
    SmsModule,

    // Feature modules
    AuthModule,
    UserModule,
    MerchantModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    AdminModule,
    CouponModule,
    MerchantOwnerModule,
    NotificationModule,
  ],
})
export class AppModule {}
