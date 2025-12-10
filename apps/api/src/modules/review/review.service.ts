import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

export interface CreateReviewDto {
  merchantId: string;
  orderId?: string;
  rating: number;
  content?: string;
  images?: string[];
  tasteRating?: number;
  packagingRating?: number;
  deliveryRating?: number;
  isAnonymous?: boolean;
}

export interface ReviewQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'likes';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async findByMerchant(
    merchantId: string,
    query: ReviewQueryDto = {},
  ): Promise<{ reviews: Review[]; total: number; avgRating: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { merchantId },
      relations: ['user'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const avgResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .where('review.merchantId = :merchantId', { merchantId })
      .getRawOne();

    return {
      reviews,
      total,
      avgRating: parseFloat(avgResult?.avgRating || '0'),
    };
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { userId },
      relations: ['merchant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'merchant'],
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async create(userId: string, data: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepo.create({
      ...data,
      userId,
    });
    return this.reviewRepo.save(review);
  }

  async like(id: string): Promise<Review> {
    await this.reviewRepo.increment({ id }, 'likes', 1);
    return this.findOne(id);
  }

  async addMerchantReply(
    id: string,
    reply: string,
  ): Promise<Review> {
    await this.reviewRepo.update(id, {
      merchantReply: reply,
      replyAt: new Date(),
    });
    return this.findOne(id);
  }

  async getStats(merchantId: string): Promise<{
    avgRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
    avgTaste: number;
    avgPackaging: number;
    avgDelivery: number;
  }> {
    const stats = await this.reviewRepo
      .createQueryBuilder('review')
      .select([
        'AVG(review.rating) as avgRating',
        'COUNT(*) as totalReviews',
        'AVG(review.tasteRating) as avgTaste',
        'AVG(review.packagingRating) as avgPackaging',
        'AVG(review.deliveryRating) as avgDelivery',
      ])
      .where('review.merchantId = :merchantId', { merchantId })
      .getRawOne();

    const distribution = await this.reviewRepo
      .createQueryBuilder('review')
      .select('FLOOR(review.rating) as rating, COUNT(*) as count')
      .where('review.merchantId = :merchantId', { merchantId })
      .groupBy('FLOOR(review.rating)')
      .getRawMany();

    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      ratingDistribution[Math.floor(d.rating)] = parseInt(d.count);
    });

    return {
      avgRating: parseFloat(stats?.avgRating || '0'),
      totalReviews: parseInt(stats?.totalReviews || '0'),
      ratingDistribution,
      avgTaste: parseFloat(stats?.avgTaste || '0'),
      avgPackaging: parseFloat(stats?.avgPackaging || '0'),
      avgDelivery: parseFloat(stats?.avgDelivery || '0'),
    };
  }
}
