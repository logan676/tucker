import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  MaxLength,
  MinLength,
  IsNumber,
  Matches,
} from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Business name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  businessName: string;

  @ApiPropertyOptional({ description: 'Business description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Logo image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({ description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  banner?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Contact person name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  contactName: string;

  @ApiProperty({ description: 'Contact phone number', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contactEmail?: string;

  @ApiProperty({ description: 'State/Province (e.g., Queensland)' })
  @IsString()
  @MaxLength(50)
  province: string;

  @ApiProperty({ description: 'City (e.g., Brisbane)' })
  @IsString()
  @MaxLength(50)
  city: string;

  @ApiProperty({ description: 'District/Suburb' })
  @IsString()
  @MaxLength(50)
  district: string;

  @ApiProperty({ description: 'Street address' })
  @IsString()
  @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Australian Business Number (11 digits)' })
  @IsString()
  @MinLength(11)
  @MaxLength(20)
  @Matches(/^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/, {
    message: 'ABN must be 11 digits (with optional spaces)',
  })
  abn: string;

  @ApiPropertyOptional({ description: 'ABN certificate image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  abnCertificateImage?: string;

  @ApiPropertyOptional({ description: 'Food Safety Certificate number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  foodSafetyCertNumber?: string;

  @ApiPropertyOptional({ description: 'Food Safety Certificate image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  foodSafetyCertImage?: string;

  @ApiPropertyOptional({ description: 'Business owner name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ownerName?: string;

  @ApiPropertyOptional({ description: 'Owner ID document image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ownerIdImage?: string;

  @ApiPropertyOptional({ description: 'Bank account name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountName?: string;

  @ApiPropertyOptional({ description: 'BSB number (6 digits)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}-?\d{3}$/, { message: 'BSB must be 6 digits' })
  bsb?: string;

  @ApiPropertyOptional({ description: 'Account number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;
}
