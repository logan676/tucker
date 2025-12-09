import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { QueryNotificationsDto, NotificationResponseDto, UnreadCountDto } from './dto/notification.dto';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginatedResult } from '@/common/dto/pagination.dto';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200 })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryNotificationsDto,
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationService.findAll(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, type: UnreadCountDto })
  async getUnreadCount(
    @CurrentUser('id') userId: string,
  ): Promise<UnreadCountDto> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ): Promise<Notification> {
    return this.notificationService.markAsRead(userId, notificationId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200 })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }
}
