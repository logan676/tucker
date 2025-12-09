import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  image: string | null;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  originalPrice: number | null;

  @ApiProperty()
  monthlySales: number;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  isAvailable: boolean;
}

export class CategoryWithProductsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [ProductListItemDto] })
  products: ProductListItemDto[];
}

export class ProductMenuResponseDto {
  @ApiProperty({ type: [CategoryWithProductsDto] })
  categories: CategoryWithProductsDto[];
}
