import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewService, CreateReviewDto, ReviewQueryDto } from './review.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('merchant/:merchantId')
  async findByMerchant(
    @Param('merchantId') merchantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'rating' | 'likes',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const query: ReviewQueryDto = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC',
    };
    return this.reviewService.findByMerchant(merchantId, query);
  }

  @Get('merchant/:merchantId/stats')
  async getStats(@Param('merchantId') merchantId: string) {
    return this.reviewService.getStats(merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyReviews(@Request() req: any) {
    return this.reviewService.findByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() data: CreateReviewDto) {
    return this.reviewService.create(req.user.userId, data);
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    return this.reviewService.like(id);
  }
}

@Controller('merchant/reviews')
export class MerchantReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  async addReply(
    @Param('id') id: string,
    @Body('reply') reply: string,
  ) {
    return this.reviewService.addMerchantReply(id, reply);
  }
}
