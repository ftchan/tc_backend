import { Provide } from '@midwayjs/core';
import { IUserOptions } from '../interface';
import User from '../tools/user';

@Provide()
export class UserService {
  async getUser(options: IUserOptions) {
    const userInfo = await User.getUserInfo(options.uuid);
    return userInfo;
  }
}
