import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { MerchantApplicationService } from './merchant-application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Merchant Application')
@Controller('merchant-application')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MerchantApplicationController {
  constructor(private readonly applicationService: MerchantApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new merchant application' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationService.create(user.id, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get my current application' })
  async getMyApplication(@CurrentUser() user: User) {
    return this.applicationService.findMyApplication(user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update my application (draft or rejected only)' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationService.update(user.id, id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit application for review' })
  async submit(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.applicationService.submit(user.id, id);
  }
}
