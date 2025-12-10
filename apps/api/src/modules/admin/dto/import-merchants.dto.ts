import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  IsArray,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportMerchantRowDto {
  @ApiProperty({ description: 'Business name' })
  @IsString()
  @MaxLength(100)
  businessName: string;

  @ApiProperty({ description: 'Australian Business Number' })
  @IsString()
  @Matches(/^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/, {
    message: 'ABN must be 11 digits',
  })
  abn: string;

  @ApiPropertyOptional({ description: 'Food Safety Certificate number' })
  @IsOptional()
  @IsString()
  foodSafetyCertNumber?: string;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  categoryName: string;

  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  @MaxLength(100)
  contactName: string;

  @ApiProperty({ description: 'Contact phone' })
  @IsString()
  @MaxLength(20)
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  province: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Suburb/District' })
  @IsString()
  district: string;

  @ApiProperty({ description: 'Street address' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Delivery fee' })
  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount' })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;
}

export class ImportMerchantsDto {
  @ApiProperty({ type: [ImportMerchantRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportMerchantRowDto)
  merchants: ImportMerchantRowDto[];
}

export class ImportResultDto {
  @ApiProperty()
  success: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  errors: Array<{
    row: number;
    businessName: string;
    error: string;
  }>;

  @ApiProperty()
  createdMerchants: Array<{
    id: string;
    name: string;
  }>;
}
