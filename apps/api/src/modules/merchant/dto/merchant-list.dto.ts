import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MerchantListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  logo: string | null;

  @ApiPropertyOptional()
  category: string | null;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  monthlySales: number;

  @ApiProperty()
  minOrderAmount: number;

  @ApiProperty()
  deliveryFee: number;

  @ApiPropertyOptional()
  deliveryTime: string | null;

  @ApiPropertyOptional()
  distance: number | null;

  @ApiPropertyOptional()
  features: string[] | null;

  @ApiProperty()
  status: 'open' | 'closed';
}
