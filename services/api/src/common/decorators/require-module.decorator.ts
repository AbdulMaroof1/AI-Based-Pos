import { SetMetadata } from '@nestjs/common';
import { REQUIRE_MODULE } from '../guards/module-access.guard';

export const RequireModule = (moduleName: string) => SetMetadata(REQUIRE_MODULE, moduleName);
