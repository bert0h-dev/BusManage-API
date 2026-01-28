import { PermissionAction } from '@prisma/client';

export interface RequiredPermission {
  module: string;
  action: PermissionAction;
}
