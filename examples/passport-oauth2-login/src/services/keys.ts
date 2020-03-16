import {BindingKey} from '@loopback/core';
import {UserService} from './user.service';

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService>(
    'services.user.service',
  );
}
