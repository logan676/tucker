import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchant/entities/merchant.entity';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
