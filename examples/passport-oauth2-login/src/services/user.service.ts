// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-oauth2-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository} from '@loopback/repository';
import {Profile as UserProfile} from 'passport';
import {UserRepository} from '../repositories';
import {User} from '../models';
import * as _ from 'lodash';

export interface UserService {
  findOrCreateExternalUser(email: string, profile: UserProfile, token: string): Promise<UserProfile>;
}

export interface UserWithToken extends UserProfile {
  token: string
}

export class MyUserService implements UserService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async findOrCreateExternalUser(email: string, profile: UserProfile, token: string): Promise<UserWithToken> {
    let user: User[] = await this.userRepository.find({
      where: {
        email: email
      }
    });
    if (!user || !user.length) {
      this.userRepository.create({
        email: email,
        name: profile.displayName,
        username: email
      });
    }
    return {
      ...profile,
      token: token
    };
  }
}

function mapAsProfile(user: User): UserProfile {
  return {
    id: JSON.stringify(user.id),
    provider: '',
    displayName: user.name
  }
}
