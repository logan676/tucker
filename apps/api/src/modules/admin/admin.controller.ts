import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import { AdminService, DashboardStats } from './admin.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImportMerchantsDto, ImportResultDto } from './dto/import-merchants.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminGuard } from '@/common/guards/admin.guard';
import { Merchant } from '../merchant/entities/merchant.entity';
import { Category } from '../merchant/entities/category.entity';
import { Product } from '../product/entities/product.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200 })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  // Users
  @Get('users')
  @ApiOperation({ summary: 'Get user list with pagination' })
  @ApiResponse({ status: 200 })
  async getUsers(@Query() query: QueryUsersDto) {
    return this.adminService.getUsers(query);
  }

  // Merchants
  @Get('merchants')
  @ApiOperation({ summary: 'Get merchant list with pagination' })
  @ApiResponse({ status: 200 })
  async getMerchants(@Query() query: QueryUsersDto) {
    return this.adminService.getMerchants(query);
  }

  @Post('merchants')
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({ status: 201 })
  async createMerchant(@Body() dto: CreateMerchantDto): Promise<Merchant> {
    return this.adminService.createMerchant(dto);
  }

  @Put('merchants/:id')
  @ApiOperation({ summary: 'Update a merchant' })
  @ApiResponse({ status: 200 })
  async updateMerchant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMerchantDto,
  ): Promise<Merchant> {
    return this.adminService.updateMerchant(id, dto);
  }

  @Delete('merchants/:id')
  @ApiOperation({ summary: 'Delete a merchant' })
  @ApiResponse({ status: 200 })
  async deleteMerchant(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteMerchant(id);
  }

  @Get('merchants/import/template')
  @ApiOperation({ summary: 'Download merchant import template' })
  async downloadImportTemplate(@Res() res: Response): Promise<void> {
    const templateData = this.adminService.getImportTemplate();

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Merchants');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // businessName
      { wch: 15 }, // abn
      { wch: 18 }, // foodSafetyCertNumber
      { wch: 15 }, // categoryName
      { wch: 15 }, // contactName
      { wch: 15 }, // contactPhone
      { wch: 25 }, // contactEmail
      { wch: 15 }, // province
      { wch: 15 }, // city
      { wch: 15 }, // district
      { wch: 30 }, // address
      { wch: 12 }, // longitude
      { wch: 12 }, // latitude
      { wch: 40 }, // description
      { wch: 12 }, // deliveryFee
      { wch: 15 }, // minOrderAmount
    ];

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=merchant_import_template.xlsx',
    );
    res.send(buffer);
  }

  @Post('merchants/import')
  @ApiOperation({ summary: 'Import merchants from Excel file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importMerchants(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Parse Excel file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Map Excel columns to DTO
    const merchants = jsonData.map((row: Record<string, unknown>) => ({
      businessName: String(row['businessName'] || ''),
      abn: String(row['abn'] || ''),
      foodSafetyCertNumber: row['foodSafetyCertNumber']
        ? String(row['foodSafetyCertNumber'])
        : undefined,
      categoryName: String(row['categoryName'] || ''),
      contactName: String(row['contactName'] || ''),
      contactPhone: String(row['contactPhone'] || ''),
      contactEmail: row['contactEmail'] ? String(row['contactEmail']) : undefined,
      province: String(row['province'] || ''),
      city: String(row['city'] || ''),
      district: String(row['district'] || ''),
      address: String(row['address'] || ''),
      longitude: row['longitude'] ? Number(row['longitude']) : undefined,
      latitude: row['latitude'] ? Number(row['latitude']) : undefined,
      description: row['description'] ? String(row['description']) : undefined,
      deliveryFee: row['deliveryFee'] ? Number(row['deliveryFee']) : undefined,
      minOrderAmount: row['minOrderAmount']
        ? Number(row['minOrderAmount'])
        : undefined,
    }));

    return this.adminService.importMerchants(merchants);
  }

  @Post('merchants/import/json')
  @ApiOperation({ summary: 'Import merchants from JSON data' })
  async importMerchantsJson(@Body() dto: ImportMerchantsDto): Promise<ImportResultDto> {
    return this.adminService.importMerchants(dto.merchants);
  }

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200 })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201 })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.adminService.createCategory(dto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200 })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200 })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteCategory(id);
  }

  // Products
  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201 })
  async createProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return this.adminService.createProduct(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200 })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200 })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteProduct(id);
  }
}
