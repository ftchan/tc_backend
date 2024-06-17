// import dayjs from 'dayjs';
import { JwtPayload } from 'jwt-decode';
import { JwtService } from '@midwayjs/jwt';
import { PrismaClient } from '@prisma/client';
import { Context, NextFunction } from '@midwayjs/koa';
import { Provide, Inject, httpError } from '@midwayjs/core';

@Provide()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  static getName(): string {
    return 'JWT';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const token = ctx.get('authorization');

      // 未检测到 Token 或 Token 长度异常
      if (!token || token.length <= 2) {
        throw new httpError.UnauthorizedError();
      }

      const decoded = this.jwtService.decodeSync(token, {
        complete: true,
      });

      // 获取 JWT-Token 的 Sub 和 EXP 信息
      const payload = decoded.payload as JwtPayload;
      const uuid = payload.sub;
      const exp = payload.exp;

      // Token 中未包含 UUID 信息
      if (!decoded?.payload.sub) {
        throw new httpError.UnauthorizedError();
      }

      // Token 过时(注：此处不应该扔出未鉴权错误，而是应该认出 Token 过时错误)
      if (Date.now() > exp * 1000) {
        throw new httpError.UnauthorizedError();
      }

      const prisma = new PrismaClient();
      const user = await prisma.user_info.findUnique({ where: { uuid } });

      // Token 可被解析，但是该用户 UUID 未在数据库中被查询到。
      if (!user) {
        return {
          status: 401,
          msg: '未找到该用户',
        };
      } else {
        await next();
      }
    };
  }
}
