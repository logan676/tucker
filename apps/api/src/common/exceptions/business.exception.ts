import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

export class BusinessException extends HttpException {
  public readonly errorCode: ErrorCode;

  constructor(
    errorCode: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        code: errorCode,
        message,
      },
      status,
    );
    this.errorCode = errorCode;
  }
}
