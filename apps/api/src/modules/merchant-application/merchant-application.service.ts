import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MerchantApplication,
  ApplicationStatus,
} from './entities/merchant-application.entity';
import { ApplicationReviewLog, ReviewAction } from './entities/application-review-log.entity';
import { Merchant, MerchantStatus } from '../merchant/entities/merchant.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationsDto } from './dto/review-application.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class MerchantApplicationService {
  constructor(
    @InjectRepository(MerchantApplication)
    private applicationRepo: Repository<MerchantApplication>,
    @InjectRepository(ApplicationReviewLog)
    private reviewLogRepo: Repository<ApplicationReviewLog>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  // ==================== Applicant Methods ====================

  async create(userId: string, dto: CreateApplicationDto): Promise<MerchantApplication> {
    // Check if user already has a pending/approved application
    const existing = await this.applicationRepo.findOne({
      where: [
        { userId, status: ApplicationStatus.DRAFT },
        { userId, status: ApplicationStatus.SUBMITTED },
        { userId, status: ApplicationStatus.UNDER_REVIEW },
        { userId, status: ApplicationStatus.APPROVED },
      ],
    });

    if (existing) {
      if (existing.status === ApplicationStatus.APPROVED) {
        throw new BadRequestException('You already have an approved merchant account');
      }
      throw new BadRequestException('You already have a pending application');
    }

    const application = this.applicationRepo.create({
      ...dto,
      userId,
      status: ApplicationStatus.DRAFT,
    });

    return this.applicationRepo.save(application);
  }

  async findMyApplication(userId: string): Promise<MerchantApplication | null> {
    return this.applicationRepo.findOne({
      where: { userId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationDto,
  ): Promise<MerchantApplication> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId, userId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Can only update draft or rejected applications');
    }

    Object.assign(application, dto);
    return this.applicationRepo.save(application);
  }

  async submit(userId: string, applicationId: string): Promise<MerchantApplication> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId, userId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Can only submit draft or rejected applications');
    }

    // Validate required fields
    this.validateApplicationForSubmission(application);

    const fromStatus = application.status;
    application.status = ApplicationStatus.SUBMITTED;
    application.submittedAt = new Date();
    application.rejectReason = null;

    await this.applicationRepo.save(application);

    // Log the action
    await this.logAction(
      applicationId,
      userId,
      fromStatus === ApplicationStatus.REJECTED ? 'resubmit' : 'submit',
      fromStatus,
      ApplicationStatus.SUBMITTED,
    );

    return application;
  }

  private validateApplicationForSubmission(application: MerchantApplication): void {
    const requiredFields = [
      'businessName',
      'contactName',
      'contactPhone',
      'province',
      'city',
      'district',
      'address',
      'abn',
    ];

    const missingFields = requiredFields.filter(
      (field) => !application[field as keyof MerchantApplication],
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
    }
  }

  // ==================== Admin Methods ====================

  async findAll(query: QueryApplicationsDto): Promise<{
    items: MerchantApplication[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.category', 'category')
      .leftJoinAndSelect('app.reviewer', 'reviewer');

    if (query.status) {
      qb.andWhere('app.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(app.businessName ILIKE :search OR app.abn ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('app.submittedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('app.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async findById(applicationId: string): Promise<MerchantApplication> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: ['user', 'category', 'reviewer'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async startReview(applicationId: string, adminId: string): Promise<MerchantApplication> {
    const application = await this.findById(applicationId);

    if (application.status !== ApplicationStatus.SUBMITTED) {
      throw new BadRequestException('Can only start review for submitted applications');
    }

    const fromStatus = application.status;
    application.status = ApplicationStatus.UNDER_REVIEW;
    application.reviewedBy = adminId;

    await this.applicationRepo.save(application);

    await this.logAction(
      applicationId,
      adminId,
      'start_review',
      fromStatus,
      ApplicationStatus.UNDER_REVIEW,
    );

    return application;
  }

  async approve(applicationId: string, adminId: string): Promise<MerchantApplication> {
    const application = await this.findById(applicationId);

    if (
      application.status !== ApplicationStatus.SUBMITTED &&
      application.status !== ApplicationStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Can only approve submitted or under-review applications');
    }

    const fromStatus = application.status;

    // Create the merchant
    const merchant = this.merchantRepo.create({
      name: application.businessName,
      description: application.description,
      logo: application.logo,
      banner: application.banner,
      categoryId: application.categoryId,
      phone: application.contactPhone,
      province: application.province,
      city: application.city,
      district: application.district,
      address: application.address,
      longitude: application.longitude,
      latitude: application.latitude,
      ownerId: application.userId,
      status: MerchantStatus.ACTIVE,
      isOpen: false, // Merchant needs to manually open
    });

    const savedMerchant = await this.merchantRepo.save(merchant);

    // Update user role to MERCHANT
    await this.userRepo.update(application.userId, {
      role: UserRole.MERCHANT,
    });

    // Update application
    application.status = ApplicationStatus.APPROVED;
    application.merchantId = savedMerchant.id;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();

    await this.applicationRepo.save(application);

    // Log the action
    await this.logAction(
      applicationId,
      adminId,
      'approve',
      fromStatus,
      ApplicationStatus.APPROVED,
    );

    // Send notification
    await this.notificationService.create({
      userId: application.userId,
      type: NotificationType.SYSTEM,
      title: 'Application Approved',
      content: `Congratulations! Your merchant application for "${application.businessName}" has been approved. You can now access your merchant dashboard.`,
      relatedId: savedMerchant.id,
    });

    return application;
  }

  async reject(
    applicationId: string,
    adminId: string,
    reason: string,
  ): Promise<MerchantApplication> {
    const application = await this.findById(applicationId);

    if (
      application.status !== ApplicationStatus.SUBMITTED &&
      application.status !== ApplicationStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Can only reject submitted or under-review applications');
    }

    const fromStatus = application.status;

    application.status = ApplicationStatus.REJECTED;
    application.rejectReason = reason;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();

    await this.applicationRepo.save(application);

    // Log the action
    await this.logAction(
      applicationId,
      adminId,
      'reject',
      fromStatus,
      ApplicationStatus.REJECTED,
      reason,
    );

    // Send notification
    await this.notificationService.create({
      userId: application.userId,
      type: NotificationType.SYSTEM,
      title: 'Application Rejected',
      content: `Your merchant application for "${application.businessName}" has been rejected. Reason: ${reason}. You can update your application and resubmit.`,
      relatedId: applicationId,
    });

    return application;
  }

  async getReviewLogs(applicationId: string): Promise<ApplicationReviewLog[]> {
    return this.reviewLogRepo.find({
      where: { applicationId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingCount(): Promise<number> {
    return this.applicationRepo.count({
      where: { status: ApplicationStatus.SUBMITTED },
    });
  }

  // ==================== Helper Methods ====================

  private async logAction(
    applicationId: string,
    actorId: string,
    action: ReviewAction,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    comment?: string,
  ): Promise<void> {
    const log = this.reviewLogRepo.create({
      applicationId,
      actorId,
      action,
      fromStatus,
      toStatus,
      comment,
    });

    await this.reviewLogRepo.save(log);
  }
}
