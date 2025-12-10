import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchant/entities/merchant.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  images: string[];

  @Column({ name: 'taste_rating', type: 'int', default: 5 })
  tasteRating: number; // 1-5

  @Column({ name: 'packaging_rating', type: 'int', default: 5 })
  packagingRating: number; // 1-5

  @Column({ name: 'delivery_rating', type: 'int', default: 5 })
  deliveryRating: number; // 1-5

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ name: 'merchant_reply', type: 'text', nullable: true })
  merchantReply: string;

  @Column({ name: 'reply_at', type: 'timestamptz', nullable: true })
  replyAt: Date;

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
