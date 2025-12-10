import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { MerchantApplicationService } from './merchant-application.service';
import { QueryApplicationsDto, RejectApplicationDto } from './dto/review-application.dto';

@ApiTags('Admin - Applications')
@Controller('admin/applications')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class MerchantApplicationAdminController {
  constructor(private readonly applicationService: MerchantApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all merchant applications' })
  async findAll(@Query() query: QueryApplicationsDto) {
    return this.applicationService.findAll(query);
  }

  @Get('pending-count')
  @ApiOperation({ summary: 'Get count of pending applications' })
  async getPendingCount() {
    const count = await this.applicationService.getPendingCount();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details' })
  async findById(@Param('id') id: string) {
    return this.applicationService.findById(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get review logs for an application' })
  async getReviewLogs(@Param('id') id: string) {
    return this.applicationService.getReviewLogs(id);
  }

  @Post(':id/start-review')
  @ApiOperation({ summary: 'Start reviewing an application' })
  async startReview(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.applicationService.startReview(id, user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an application' })
  async approve(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.applicationService.approve(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an application' })
  async reject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.applicationService.reject(id, user.id, dto.reason);
  }
}
