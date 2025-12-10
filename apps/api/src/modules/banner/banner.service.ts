import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { Banner, BannerType } from './entities/banner.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepo: Repository<Banner>,
  ) {}

  async findActive(type?: BannerType): Promise<Banner[]> {
    const now = new Date();

    const query = this.bannerRepo
      .createQueryBuilder('banner')
      .where('banner.isActive = :isActive', { isActive: true })
      .andWhere(
        '(banner.startDate IS NULL OR banner.startDate <= :now)',
        { now },
      )
      .andWhere(
        '(banner.endDate IS NULL OR banner.endDate >= :now)',
        { now },
      )
      .orderBy('banner.sortOrder', 'ASC');

    if (type) {
      query.andWhere('banner.type = :type', { type });
    }

    return query.getMany();
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepo.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Banner | null> {
    return this.bannerRepo.findOneBy({ id });
  }

  async create(data: Partial<Banner>): Promise<Banner> {
    const banner = this.bannerRepo.create(data);
    return this.bannerRepo.save(banner);
  }

  async update(id: string, data: Partial<Banner>): Promise<Banner | null> {
    await this.bannerRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bannerRepo.delete(id);
  }

  async trackClick(id: string): Promise<void> {
    await this.bannerRepo.increment({ id }, 'clickCount', 1);
  }

  async trackView(id: string): Promise<void> {
    await this.bannerRepo.increment({ id }, 'viewCount', 1);
  }
}
