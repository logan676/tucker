import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchant/entities/merchant.entity';
import { ProductCategory } from './product-category.entity';

interface ProductOption {
  name: string;
  required: boolean;
  items: { name: string; price: number }[];
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 500, array: true, nullable: true })
  images: string[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number | null;

  @Column({ type: 'int', default: 0 })
  monthlySales: number;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'jsonb', nullable: true })
  options: ProductOption[] | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'boolean', default: false })
  isRecommend: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Merchant, (merchant) => merchant.products)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;
}
