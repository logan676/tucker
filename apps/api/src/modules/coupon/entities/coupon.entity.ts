import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CouponStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED,
  })
  discountType: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'min_order_amount', default: 0 })
  minOrderAmount: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'max_discount', nullable: true })
  maxDiscount: number;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'total_limit', default: 0 })
  totalLimit: number; // 0 = unlimited

  @Column({ name: 'per_user_limit', default: 1 })
  perUserLimit: number;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId: string; // null = all merchants

  @Column('simple-array', { nullable: true })
  categoryIds: string[]; // null = all categories

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
