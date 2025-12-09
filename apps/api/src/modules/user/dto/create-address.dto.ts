import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '13800138000' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ example: 'Beijing' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  province: string;

  @ApiProperty({ example: 'Beijing' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  city: string;

  @ApiProperty({ example: 'Chaoyang' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  district: string;

  @ApiProperty({ example: 'Wangjing SOHO T1 2001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  detail: string;

  @ApiPropertyOptional({ example: 'Office' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  label?: string;

  @ApiPropertyOptional({ example: 116.4551 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 39.9889 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
