import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant, MerchantStatus } from './entities/merchant.entity';
import { Category } from './entities/category.entity';
import { QueryMerchantsDto, MerchantSortBy } from './dto/query-merchants.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';
import { MerchantListItemDto } from './dto/merchant-list.dto';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(query: QueryMerchantsDto): Promise<PaginatedResult<MerchantListItemDto>> {
    const { page = 1, pageSize = 20, lat, lng, category, keyword, sortBy } = query;

    const qb = this.merchantRepository
      .createQueryBuilder('merchant')
      .leftJoinAndSelect('merchant.category', 'category')
      .where('merchant.status = :status', { status: MerchantStatus.ACTIVE });

    // Filter by category
    if (category) {
      qb.andWhere('merchant.categoryId = :category', { category });
    }

    // Filter by keyword
    if (keyword) {
      qb.andWhere('merchant.name ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    // Sorting
    switch (sortBy) {
      case MerchantSortBy.RATING:
        qb.orderBy('merchant.rating', 'DESC');
        break;
      case MerchantSortBy.SALES:
        qb.orderBy('merchant.monthlySales', 'DESC');
        break;
      default:
        // For distance sorting, we'd need PostGIS or calculated column
        qb.orderBy('merchant.monthlySales', 'DESC');
        break;
    }

    const total = await qb.getCount();
    const merchants = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const items: MerchantListItemDto[] = merchants.map((m) => ({
      id: m.id,
      name: m.name,
      logo: m.logo,
      category: m.category?.name || null,
      rating: Number(m.rating),
      monthlySales: m.monthlySales,
      minOrderAmount: Number(m.minOrderAmount),
      deliveryFee: Number(m.deliveryFee),
      deliveryTime: m.deliveryTime,
      distance: this.calculateDistance(lat, lng, m.latitude, m.longitude),
      features: m.features,
      status: m.isOpen ? 'open' : 'closed',
    }));

    return new PaginatedResult(items, page, pageSize, total);
  }

  async findById(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!merchant) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Merchant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return merchant;
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  private calculateDistance(
    lat1: number | undefined,
    lng1: number | undefined,
    lat2: number | null | undefined,
    lng2: number | null | undefined,
  ): number | null {
    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return null;
    }

    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
  }
}
