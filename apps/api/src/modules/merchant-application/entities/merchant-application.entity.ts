import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../merchant/entities/category.entity';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('merchant_applications')
export class MerchantApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  // Basic Business Info
  @Column({ type: 'varchar', length: 100 })
  businessName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner: string | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  // Contact Info
  @Column({ type: 'varchar', length: 100 })
  contactName: string;

  @Column({ type: 'varchar', length: 20 })
  contactPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactEmail: string | null;

  // Address Info
  @Column({ type: 'varchar', length: 50 })
  province: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  district: string;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  // Australian Business Credentials
  @Column({ type: 'varchar', length: 20 })
  abn: string; // Australian Business Number (11 digits)

  @Column({ type: 'varchar', length: 500, nullable: true })
  abnCertificateImage: string | null; // ABN certificate/registration image

  @Column({ type: 'varchar', length: 50, nullable: true })
  foodSafetyCertNumber: string | null; // Food Safety Supervisor Certificate Number

  @Column({ type: 'varchar', length: 500, nullable: true })
  foodSafetyCertImage: string | null; // Food Safety Certificate image

  // Optional: Business owner identification
  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerName: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ownerIdImage: string | null; // Driver's license or passport image

  // Bank Info (for payment settlements)
  @Column({ type: 'varchar', length: 100, nullable: true })
  bankAccountName: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  bsb: string | null; // Bank State Branch (6 digits)

  @Column({ type: 'varchar', length: 20, nullable: true })
  accountNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  // Application Status
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  rejectReason: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  merchantId: string | null; // Set after approval

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedBy' })
  reviewer: User;
}
