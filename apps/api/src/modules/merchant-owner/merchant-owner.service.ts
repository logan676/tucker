import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from '@/modules/order/entities/order.entity';
import { Product } from '@/modules/product/entities/product.entity';
import { Merchant } from '@/modules/merchant/entities/merchant.entity';
import {
  DashboardStatsDto,
  QueryMerchantOrdersDto,
  UpdateOrderStatusDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateStoreSettingsDto,
} from './dto/merchant-owner.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

@Injectable()
export class MerchantOwnerService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async getDashboardStats(merchantId: string): Promise<DashboardStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todayOrders = await this.orderRepository.count({
      where: {
        merchantId,
        createdAt: Between(today, tomorrow),
      },
    });

    // Today's revenue
    const todayRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payAmount)', 'total')
      .where('order.merchantId = :merchantId', { merchantId })
      .andWhere('order.createdAt BETWEEN :today AND :tomorrow', { today, tomorrow })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT],
      })
      .getRawOne();

    // Pending orders
    const pendingOrders = await this.orderRepository.count({
      where: {
        merchantId,
        status: OrderStatus.PENDING_CONFIRM,
      },
    });

    // Total orders
    const totalOrders = await this.orderRepository.count({
      where: { merchantId },
    });

    // Total revenue
    const totalRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payAmount)', 'total')
      .where('order.merchantId = :merchantId', { merchantId })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT],
      })
      .getRawOne();

    // Get merchant rating
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    return {
      todayOrders,
      todayRevenue: Number(todayRevenueResult?.total || 0),
      pendingOrders,
      totalOrders,
      totalRevenue: Number(totalRevenueResult?.total || 0),
      averageRating: merchant?.rating ? Number(merchant.rating) : 0,
      ratingCount: merchant?.ratingCount || 0,
    };
  }

  async getOrders(
    merchantId: string,
    query: QueryMerchantOrdersDto,
  ): Promise<PaginatedResult<Order>> {
    const { page = 1, pageSize = 20, status } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.merchantId = :merchantId', { merchantId })
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const total = await qb.getCount();
    const orders = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResult(orders, page, pageSize, total);
  }

  async getOrderById(merchantId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, merchantId },
      relations: ['items'],
    });

    if (!order) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return order;
  }

  async updateOrderStatus(
    merchantId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.getOrderById(merchantId, orderId);

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [],
      [OrderStatus.PENDING_CONFIRM]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[order.status]?.includes(dto.status)) {
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        `Cannot transition from ${order.status} to ${dto.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    order.status = dto.status;

    if (dto.status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelReason = dto.reason || 'Cancelled by merchant';
    }

    if (dto.status === OrderStatus.COMPLETED) {
      order.completedAt = new Date();
    }

    return this.orderRepository.save(order);
  }

  async getProducts(merchantId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getProductById(merchantId: string, productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId, merchantId },
    });

    if (!product) {
      throw new BusinessException(
        ErrorCodes.PRODUCT_UNAVAILABLE,
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }

  async createProduct(merchantId: string, dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...dto,
      merchantId,
      isAvailable: dto.isAvailable ?? true,
    });

    return this.productRepository.save(product);
  }

  async updateProduct(
    merchantId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(merchantId, productId);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async deleteProduct(merchantId: string, productId: string): Promise<void> {
    const product = await this.getProductById(merchantId, productId);
    await this.productRepository.remove(product);
  }

  async toggleProductAvailability(
    merchantId: string,
    productId: string,
    isAvailable: boolean,
  ): Promise<Product> {
    const product = await this.getProductById(merchantId, productId);
    product.isAvailable = isAvailable;
    return this.productRepository.save(product);
  }

  async getStoreSettings(merchantId: string): Promise<Merchant> {
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

    return merchant;
  }

  async updateStoreSettings(
    merchantId: string,
    dto: UpdateStoreSettingsDto,
  ): Promise<Merchant> {
    const merchant = await this.getStoreSettings(merchantId);
    Object.assign(merchant, dto);
    return this.merchantRepository.save(merchant);
  }

  async toggleStoreOpen(merchantId: string, isOpen: boolean): Promise<Merchant> {
    const merchant = await this.getStoreSettings(merchantId);
    merchant.isOpen = isOpen;
    return this.merchantRepository.save(merchant);
  }
}
