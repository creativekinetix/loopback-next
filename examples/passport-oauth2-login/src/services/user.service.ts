// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-oauth2-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {UserRepository} from '../repositories';
import {User} from '../models';

export interface UserService {
  findOrCreateExternalUser(profile: UserProfile): Promise<User>;
}

export class MyUserService implements UserService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async findOrCreateExternalUser(profile: UserProfile): Promise<User> {
    return new User({
      id: 1,
      ...profile,
    });
  }
}
