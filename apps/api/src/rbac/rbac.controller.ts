import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/interfaces/jwt-payload.interface';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { PermissionCodes } from './constants/permission-codes';
import { UserPermissionsResponseDto } from './dto/user-permissions-response.dto';
import { RbacService } from './rbac.service';

/**
 * RBAC 控制器：当前用户权限码与演示受保护接口。
 */
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  /**
   * 返回当前用户在租户内的角色编码与权限码列表（供前端组件级控制）。
   *
   * @param user 鉴权用户
   * @returns 权限包
   */
  @Get('me/permissions')
  getMyPermissions(@CurrentUser() user: JwtPayloadUser): Promise<UserPermissionsResponseDto> {
    return this.rbacService.getUserPermissions(user.tenantId, user.userId);
  }

  /**
   * 演示受保护接口：无 `rbac:demo:ping` 权限时返回 403。
   *
   * @returns 成功标记
   */
  @Get('demo/protected')
  @RequirePermissions(PermissionCodes.RbacDemoPing)
  demoProtected(): { ok: true; message: string } {
    return { ok: true, message: '已通过权限校验' };
  }
}
