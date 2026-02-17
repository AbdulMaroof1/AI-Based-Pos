import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@pos/shared-types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    if (!user.tenantId) return false;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant || !tenant.isActive) {
      throw new ForbiddenException('Company is inactive');
    }

    if (tenant.trialEndAt && tenant.trialEndAt < new Date() && tenant.plan === 'TRIAL') {
      throw new ForbiddenException('Trial period has ended. Please upgrade your plan.');
    }

    return true;
  }
}
