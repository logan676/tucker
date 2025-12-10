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
import { ImportMerchantRowDto, ImportResultDto } from './dto/import-merchants.dto';
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

  // Import Merchants from Excel data
  async importMerchants(merchants: ImportMerchantRowDto[]): Promise<ImportResultDto> {
    const result: ImportResultDto = {
      success: 0,
      failed: 0,
      errors: [],
      createdMerchants: [],
    };

    // Get all categories for matching
    const categories = await this.categoryRepository.find();
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    for (let i = 0; i < merchants.length; i++) {
      const row = merchants[i];
      const rowNumber = i + 2; // Excel row (1-indexed, plus header row)

      try {
        // Validate ABN uniqueness (could add ABN field to merchant entity)
        // For now, check by name
        const existing = await this.merchantRepository.findOne({
          where: { name: row.businessName },
        });

        if (existing) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            businessName: row.businessName,
            error: 'Merchant with this name already exists',
          });
          continue;
        }

        // Find category
        const categoryId = categoryMap.get(row.categoryName.toLowerCase());
        if (!categoryId) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            businessName: row.businessName,
            error: `Category "${row.categoryName}" not found`,
          });
          continue;
        }

        // Create merchant
        const merchant = this.merchantRepository.create({
          name: row.businessName,
          description: row.description,
          phone: row.contactPhone,
          categoryId,
          province: row.province,
          city: row.city,
          district: row.district,
          address: row.address,
          longitude: row.longitude,
          latitude: row.latitude,
          deliveryFee: row.deliveryFee ?? 5,
          minOrderAmount: row.minOrderAmount ?? 20,
          status: MerchantStatus.ACTIVE,
          isOpen: false, // Default to closed, merchant will open manually
        });

        const saved = await this.merchantRepository.save(merchant);

        result.success++;
        result.createdMerchants.push({
          id: saved.id,
          name: saved.name,
        });
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          businessName: row.businessName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  // Generate import template data
  getImportTemplate(): object[] {
    return [
      {
        businessName: 'Example Restaurant',
        abn: '12 345 678 901',
        foodSafetyCertNumber: 'FSC-123456',
        categoryName: 'Chinese',
        contactName: 'John Doe',
        contactPhone: '0412345678',
        contactEmail: 'john@example.com',
        province: 'Queensland',
        city: 'Brisbane',
        district: 'CBD',
        address: '123 Queen Street',
        longitude: 153.0251,
        latitude: -27.4698,
        description: 'A great restaurant',
        deliveryFee: 5,
        minOrderAmount: 20,
      },
    ];
  }
}
