import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Merchant, MerchantStatus } from '../merchant/entities/merchant.entity';
import { Category } from '../merchant/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { ProductCategory } from '../product/entities/product-category.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

export interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingMerchants: number;
  activeOrders: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      totalMerchants,
      totalOrders,
      pendingMerchants,
      todayOrdersResult,
      completedOrdersResult,
      activeOrders,
    ] = await Promise.all([
      this.userRepository.count(),
      this.merchantRepository.count({ where: { status: MerchantStatus.ACTIVE } }),
      this.orderRepository.count(),
      this.merchantRepository.count({ where: { status: MerchantStatus.PENDING } }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(order.payAmount), 0)', 'revenue')
        .where('order.createdAt >= :today', { today })
        .andWhere('order.createdAt < :tomorrow', { tomorrow })
        .getRawOne(),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.payAmount), 0)', 'revenue')
        .where('order.status = :status', { status: OrderStatus.COMPLETED })
        .getRawOne(),
      this.orderRepository.count({
        where: [
          { status: OrderStatus.PENDING_CONFIRM },
          { status: OrderStatus.CONFIRMED },
          { status: OrderStatus.PREPARING },
          { status: OrderStatus.DELIVERING },
        ],
      }),
    ]);

    return {
      totalUsers,
      totalMerchants,
      totalOrders,
      totalRevenue: parseFloat(completedOrdersResult?.revenue || '0'),
      todayOrders: parseInt(todayOrdersResult?.count || '0', 10),
      todayRevenue: parseFloat(todayOrdersResult?.revenue || '0'),
      pendingMerchants,
      activeOrders,
    };
  }

  // Users
  async getUsers(query: QueryUsersDto): Promise<PaginatedResult<User>> {
    const { page = 1, pageSize = 20, keyword } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      qb.where('user.phone LIKE :keyword OR user.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    qb.orderBy('user.createdAt', 'DESC');

    const total = await qb.getCount();
    const users = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResult(users, page, pageSize, total);
  }

  // Merchants
  async getMerchants(query: QueryUsersDto): Promise<PaginatedResult<Merchant>> {
    const { page = 1, pageSize = 20, keyword } = query;

    const qb = this.merchantRepository.createQueryBuilder('merchant');

    if (keyword) {
      qb.where('merchant.name LIKE :keyword OR merchant.phone LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    qb.orderBy('merchant.createdAt', 'DESC');

    const total = await qb.getCount();
    const merchants = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResult(merchants, page, pageSize, total);
  }

  async createMerchant(dto: CreateMerchantDto): Promise<Merchant> {
    const merchant = this.merchantRepository.create(dto);
    return this.merchantRepository.save(merchant);
  }

  async updateMerchant(id: string, dto: UpdateMerchantDto): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ where: { id } });

    if (!merchant) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Merchant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(merchant, dto);
    return this.merchantRepository.save(merchant);
  }

  async deleteMerchant(id: string): Promise<void> {
    const merchant = await this.merchantRepository.findOne({ where: { id } });

    if (!merchant) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Merchant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.merchantRepository.softDelete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Category not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Category not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if category has merchants
    const merchantCount = await this.merchantRepository.count({
      where: { categoryId: id },
    });

    if (merchantCount > 0) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Cannot delete category with associated merchants',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.categoryRepository.delete(id);
  }

  // Products
  async createProduct(dto: CreateProductDto): Promise<Product> {
    // Verify merchant exists
    const merchant = await this.merchantRepository.findOne({
      where: { id: dto.merchantId },
    });

    if (!merchant) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Merchant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new BusinessException(
        ErrorCodes.PRODUCT_UNAVAILABLE,
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new BusinessException(
        ErrorCodes.PRODUCT_UNAVAILABLE,
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.productRepository.softDelete(id);
  }

  // Product Categories (for merchant menu organization)
  async createProductCategory(
    merchantId: string,
    name: string,
    sortOrder = 0,
  ): Promise<ProductCategory> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_NOT_FOUND,
        'Merchant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const category = this.productCategoryRepository.create({
      merchantId,
      name,
      sortOrder,
    });

    return this.productCategoryRepository.save(category);
  }
}
