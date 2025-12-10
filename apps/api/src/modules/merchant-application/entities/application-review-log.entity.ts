import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MerchantApplication, ApplicationStatus } from './merchant-application.entity';

export type ReviewAction = 'submit' | 'approve' | 'reject' | 'resubmit' | 'start_review';

@Entity('application_review_logs')
export class ApplicationReviewLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  applicationId: string;

  @Column({ type: 'uuid' })
  actorId: string; // User who performed the action

  @Column({ type: 'varchar', length: 20 })
  action: ReviewAction;

  @Column({ type: 'varchar', length: 20 })
  fromStatus: ApplicationStatus;

  @Column({ type: 'varchar', length: 20 })
  toStatus: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => MerchantApplication)
  @JoinColumn({ name: 'applicationId' })
  application: MerchantApplication;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actorId' })
  actor: User;
}
