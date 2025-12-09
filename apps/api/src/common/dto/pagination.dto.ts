import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsPositive()
  @Min(1)
  pageSize?: number = 20;
}

export class PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;

  constructor(page: number, pageSize: number, total: number) {
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.totalPages = Math.ceil(total / pageSize);
  }
}

export class PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;

  constructor(items: T[], page: number, pageSize: number, total: number) {
    this.items = items;
    this.pagination = new PaginationMeta(page, pageSize, total);
  }
}
