import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// For now, we'll use a simple admin check based on a hardcoded admin phone list
// In production, this should be based on user roles stored in the database
const ADMIN_PHONES = ['13800138000', '13900139000', '18888888888'];

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Admin access required');
    }

    // Check if user is an admin
    if (!ADMIN_PHONES.includes(user.phone)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
