import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({ example: 'Changed my mind' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  reason: string;
}
