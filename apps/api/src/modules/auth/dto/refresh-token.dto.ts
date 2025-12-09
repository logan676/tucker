import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbG...' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'eyJhbG...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbG...' })
  refreshToken: string;

  @ApiProperty({ example: 900 })
  expiresIn: number;
}
