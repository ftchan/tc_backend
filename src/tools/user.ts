import { PrismaClient } from '@prisma/client';

export default class User {
  private static prisma = new PrismaClient();

  // 根据 UUID 获取用户信息
  static async getUserInfo(uuid: string) {
    return await this.prisma.user_info.findUnique({
      where: { uuid },
    });
  }
}
