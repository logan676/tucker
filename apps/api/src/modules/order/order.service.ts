import { Injectable, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Address } from '../user/entities/address.entity';
import { Product } from '../product/entities/product.entity';
import { Merchant, MerchantStatus } from '../merchant/entities/merchant.entity';
import { CouponService } from '../coupon/coupon.service';
import { CreateOrderDto, CreateOrderResponseDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    // Validate merchant
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

    if (merchant.status !== MerchantStatus.ACTIVE) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_SUSPENDED,
        'Merchant is not available',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!merchant.isOpen) {
      throw new BusinessException(
        ErrorCodes.MERCHANT_CLOSED,
        'Merchant is currently closed',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate address
    const address = await this.addressRepository.findOne({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Address not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate and calculate products
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: productIds.map((id) => ({ id, merchantId: dto.merchantId })),
    });

    const productMap = new Map<string, Product>();
    products.forEach((p) => productMap.set(p.id, p));

    let totalAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new BusinessException(
          ErrorCodes.PRODUCT_UNAVAILABLE,
          `Product ${item.productId} not found`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!product.isAvailable) {
        throw new BusinessException(
          ErrorCodes.PRODUCT_UNAVAILABLE,
          `Product ${product.name} is not available`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        options: item.options,
      });
    }

    // Check minimum order amount
    if (totalAmount < Number(merchant.minOrderAmount)) {
      throw new BusinessException(
        ErrorCodes.MIN_ORDER_AMOUNT_NOT_MET,
        `Minimum order amount is ${merchant.minOrderAmount}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const deliveryFee = Number(merchant.deliveryFee);

    // Apply coupon if provided
    let discountAmount = 0;
    if (dto.couponCode) {
      const validation = await this.couponService.validateCoupon(userId, {
        code: dto.couponCode,
        merchantId: dto.merchantId,
        orderAmount: totalAmount,
      });

      if (validation.valid) {
        discountAmount = validation.discountAmount;
      }
    }

    const payAmount = totalAmount + deliveryFee - discountAmount;

    // Generate order number
    const orderNo = this.generateOrderNo();

    // Create order
    const order = this.orderRepository.create({
      orderNo,
      userId,
      merchantId: dto.merchantId,
      totalAmount,
      deliveryFee,
      discountAmount,
      payAmount,
      deliveryAddress: {
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        longitude: address.longitude ?? undefined,
        latitude: address.latitude ?? undefined,
      },
      remark: dto.remark,
      status: OrderStatus.PENDING_PAYMENT,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const items = orderItems.map((item) => ({
      ...item,
      orderId: savedOrder.id,
    }));
    await this.orderItemRepository.save(items);

    // Payment expiration (15 minutes)
    const payExpireAt = new Date(Date.now() + 15 * 60 * 1000);

    return {
      orderId: savedOrder.id,
      orderNo: savedOrder.orderNo,
      totalAmount,
      deliveryFee,
      discountAmount,
      payAmount,
      payExpireAt,
    };
  }

  async findAll(userId: string, query: QueryOrdersDto): Promise<PaginatedResult<Order>> {
    const { page = 1, pageSize = 20, status } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.merchant', 'merchant')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.userId = :userId', { userId })
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

  async findById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['merchant', 'items'],
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

  async cancel(userId: string, orderId: string, dto: CancelOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        'Order not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Only pending orders can be cancelled
    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PENDING_CONFIRM
    ) {
      throw new BusinessException(
        ErrorCodes.INVALID_ORDER_STATUS,
        'Order cannot be cancelled in current status',
        HttpStatus.BAD_REQUEST,
      );
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = dto.reason;

    return this.orderRepository.save(order);
  }

  private generateOrderNo(): string {
    const now = new Date();
    const datePart = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${datePart}${randomPart}`;
  }
}
