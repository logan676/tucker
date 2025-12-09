import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhoneLoginDto {
  @ApiProperty({ example: '13800138000', description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ example: '123456', description: 'SMS verification code' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  code: string;
}

export class UserDto {
  @ApiProperty({ example: 'user_123' })
  id: string;

  @ApiProperty({ example: '138****8000' })
  phone: string;

  @ApiProperty({ example: 'User123', nullable: true })
  name: string | null;

  @ApiProperty({ example: null, nullable: true })
  avatar: string | null;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbG...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbG...' })
  refreshToken: string;

  @ApiProperty({ example: 900, description: 'Access token expires in seconds' })
  expiresIn: number;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
