import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';

export enum MerchantSortBy {
  DISTANCE = 'distance',
  RATING = 'rating',
  SALES = 'sales',
}

export class QueryMerchantsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 39.9889, description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 116.4551, description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: MerchantSortBy, default: MerchantSortBy.DISTANCE })
  @IsOptional()
  @IsEnum(MerchantSortBy)
  sortBy?: MerchantSortBy = MerchantSortBy.DISTANCE;
}
