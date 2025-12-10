import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerType {
  HOME = 'home',
  CATEGORY = 'category',
  MERCHANT = 'merchant',
  PROMOTION = 'promotion',
}

export enum BannerActionType {
  NONE = 'none',
  MERCHANT = 'merchant',
  CATEGORY = 'category',
  PRODUCT = 'product',
  URL = 'url',
  COUPON = 'coupon',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: BannerType,
    default: BannerType.HOME,
  })
  type: BannerType;

  @Column({
    name: 'action_type',
    type: 'enum',
    enum: BannerActionType,
    default: BannerActionType.NONE,
  })
  actionType: BannerActionType;

  @Column({ name: 'action_value', nullable: true })
  actionValue: string; // merchant_id, category_id, product_id, url, or coupon_code

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
