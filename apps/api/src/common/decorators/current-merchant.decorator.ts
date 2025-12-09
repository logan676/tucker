import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Merchant } from '@/modules/merchant/entities/merchant.entity';

export const CurrentMerchant = createParamDecorator(
  (data: keyof Merchant | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const merchant = request.merchant as Merchant;

    if (!merchant) {
      return null;
    }

    return data ? merchant[data] : merchant;
  },
);
