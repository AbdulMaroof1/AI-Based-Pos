import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@pos/shared-types';
import { Reflector } from '@nestjs/core';
import { ModuleAccessService } from '../../module-access/module-access.service';

export const REQUIRE_MODULE = 'require_module';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private readonly moduleAccessService: ModuleAccessService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<string>(REQUIRE_MODULE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredModule) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    if (user.tenantId && user.tenantId === 'ALL') return true;
    if (!user.tenantId) throw new ForbiddenException('Company context required');

    const isEnabled = await this.moduleAccessService.isModuleEnabled(user.tenantId, requiredModule);
    if (!isEnabled) {
      throw new ForbiddenException(`Module ${requiredModule} is not enabled for your company`);
    }

    return true;
  }
}
