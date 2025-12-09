import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty({ example: '13800138000', description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string;
}

export class SendSmsResponseDto {
  @ApiProperty({ example: 60, description: 'Seconds until next code can be sent' })
  expireIn: number;
}
