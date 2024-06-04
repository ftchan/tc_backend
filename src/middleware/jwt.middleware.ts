import { Provide, Inject, httpError } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { Context, NextFunction } from '@midwayjs/koa';

@Provide()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  static getName(): string {
    return 'JWT';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (!ctx.headers['authorization']) {
        throw new httpError.UnauthorizedError();
      }

      const token = ctx.get('authorization').trim();

      if (token.length <= 2) {
        throw new httpError.UnauthorizedError();
      }

      try {
        await this.jwtService.verify(token, {
          complete: true,
        });
      } catch (error) {
        throw new httpError.UnauthorizedError();
      }

      await next();
    };
  }
}
