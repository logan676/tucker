import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 0 })
  code: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiPropertyOptional()
  data?: T;

  constructor(data?: T, code = 0, message = 'success') {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data?: T, message = 'success'): ApiResponseDto<T> {
    return new ApiResponseDto(data, 0, message);
  }

  static error(code: number, message: string): ApiResponseDto<undefined> {
    return new ApiResponseDto(undefined, code, message);
  }
}
