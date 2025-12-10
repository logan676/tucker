import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApplicationStatus } from '../entities/merchant-application.entity';

export class RejectApplicationDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  @MaxLength(1000)
  reason: string;
}

export class QueryApplicationsDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Search by business name or ABN' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;
}

export class ApplicationResponseDto {
  id: string;
  businessName: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  categoryId: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  province: string;
  city: string;
  district: string;
  address: string;
  longitude: number | null;
  latitude: number | null;
  abn: string;
  abnCertificateImage: string | null;
  foodSafetyCertNumber: string | null;
  foodSafetyCertImage: string | null;
  ownerName: string | null;
  ownerIdImage: string | null;
  bankAccountName: string | null;
  bsb: string | null;
  accountNumber: string | null;
  bankName: string | null;
  status: ApplicationStatus;
  rejectReason: string | null;
  reviewedAt: Date | null;
  submittedAt: Date | null;
  merchantId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    phone: string;
  };
  category?: {
    id: string;
    name: string;
  };
  reviewer?: {
    id: string;
    name: string | null;
  };
}
