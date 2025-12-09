import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, QueryNotificationsDto } from './dto/notification.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(dto);
    const saved = await this.notificationRepository.save(notification);

    // Send real-time notification via WebSocket
    this.notificationGateway.sendToUser(dto.userId, 'notification', {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      content: saved.content,
      relatedId: saved.relatedId,
      data: saved.data,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  async findAll(
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<PaginatedResult<Notification>> {
    const { page = 1, pageSize = 20, type, unreadOnly } = query;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (type) {
      qb.andWhere('notification.type = :type', { type });
    }

    if (unreadOnly) {
      qb.andWhere('notification.read = :read', { read: false });
    }

    const total = await qb.getCount();
    const notifications = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResult(notifications, page, pageSize, total);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { read: true },
    );

    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    return notification!;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  // Helper methods for creating specific notifications
  async notifyOrderStatusChange(
    userId: string,
    orderId: string,
    orderNo: string,
    status: string,
  ): Promise<Notification> {
    const statusMessages: Record<string, string> = {
      pending_confirm: 'Your order has been paid and is waiting for merchant confirmation',
      preparing: 'Merchant has started preparing your order',
      ready: 'Your order is ready for pickup/delivery',
      delivering: 'Your order is on the way',
      completed: 'Your order has been completed',
      cancelled: 'Your order has been cancelled',
    };

    return this.create({
      userId,
      type: NotificationType.ORDER_STATUS,
      title: `Order #${orderNo}`,
      content: statusMessages[status] || `Order status updated to ${status}`,
      relatedId: orderId,
      data: { orderId, orderNo, status },
    });
  }

  async notifyPaymentSuccess(
    userId: string,
    orderId: string,
    orderNo: string,
    amount: number,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Payment Successful',
      content: `Payment of ¥${amount.toFixed(2)} for order #${orderNo} was successful`,
      relatedId: orderId,
      data: { orderId, orderNo, amount },
    });
  }

  async notifyMerchantNewOrder(
    merchantUserId: string,
    orderId: string,
    orderNo: string,
    amount: number,
  ): Promise<Notification> {
    return this.create({
      userId: merchantUserId,
      type: NotificationType.ORDER_STATUS,
      title: 'New Order',
      content: `You have a new order #${orderNo} worth ¥${amount.toFixed(2)}`,
      relatedId: orderId,
      data: { orderId, orderNo, amount },
    });
  }
}
