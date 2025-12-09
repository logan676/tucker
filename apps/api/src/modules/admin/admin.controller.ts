import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService, DashboardStats } from './admin.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { Merchant } from '../merchant/entities/merchant.entity';
import { Category } from '../merchant/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Public()
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200 })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  // Users
  @Public()
  @Get('users')
  @ApiOperation({ summary: 'Get user list with pagination' })
  @ApiResponse({ status: 200 })
  async getUsers(@Query() query: QueryUsersDto) {
    return this.adminService.getUsers(query);
  }

  // Merchants
  @Public()
  @Post('merchants')
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({ status: 201 })
  async createMerchant(@Body() dto: CreateMerchantDto): Promise<Merchant> {
    return this.adminService.createMerchant(dto);
  }

  @Public()
  @Put('merchants/:id')
  @ApiOperation({ summary: 'Update a merchant' })
  @ApiResponse({ status: 200 })
  async updateMerchant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMerchantDto,
  ): Promise<Merchant> {
    return this.adminService.updateMerchant(id, dto);
  }

  @Public()
  @Delete('merchants/:id')
  @ApiOperation({ summary: 'Delete a merchant' })
  @ApiResponse({ status: 200 })
  async deleteMerchant(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteMerchant(id);
  }

  // Categories
  @Public()
  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201 })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.adminService.createCategory(dto);
  }

  @Public()
  @Put('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200 })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.adminService.updateCategory(id, dto);
  }

  @Public()
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200 })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteCategory(id);
  }

  // Products
  @Public()
  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201 })
  async createProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return this.adminService.createProduct(dto);
  }

  @Public()
  @Put('products/:id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200 })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.adminService.updateProduct(id, dto);
  }

  @Public()
  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200 })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteProduct(id);
  }
}
