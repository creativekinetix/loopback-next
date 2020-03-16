// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: example-passport-oauth2-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asAuthStrategy,
  AuthenticationStrategy,
  UserProfileFactory,
} from '@loopback/authentication';
import {StrategyAdapter} from './strategy-adapter';
import {Strategy, StrategyOption, Profile} from 'passport-facebook';
import {bind, inject} from '@loopback/context';
import {Request} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {UserService, UserServiceBindings} from '../services';
import {User} from '../models';
import {asSpecEnhancer, OASEnhancer} from '@loopback/openapi-v3';

const options: StrategyOption = {
  clientID: '202843417684514',
  clientSecret: 'ad4315e3453b012f6e4b8dd4bc1c0ae6',
  callbackURL: '/auth/thirdparty/callback',
};

@bind(asAuthStrategy, asSpecEnhancer)
export class Oauth2Authorization
  implements AuthenticationStrategy, OASEnhancer {
  name = 'Oauth2';
  facebookStrategy: Strategy;
  facebookAuthentication: StrategyAdapter<Profile>;

  constructor(
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService,
  ) {
    this.facebookStrategy = new Strategy(options, this.verify.bind(this));
    this.facebookAuthentication = new StrategyAdapter(
      this.facebookStrategy,
      'facebook',
      mapFaceBookProfile,
    );
  }
  modifySpec(
    spec: import('@loopback/rest').OpenAPIObject,
  ): import('@loopback/rest').OpenAPIObject {
    throw new Error('Method not implemented.');
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await this.facebookAuthentication.authenticate(
      request,
    );
    return response;
  }

  /**
   * verify function for the oauth2 strategy
   * This function looks up the user in the user service and creates a local user profile if not present
   *
   * @param accessToken
   * @param refreshToken
   * @param profile
   * @param done
   */
  verify(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any, info?: any) => void,
  ) {
    const userProfile: UserProfile = mapFaceBookProfile(profile);
    this.userService
      .findOrCreateExternalUser(userProfile)
      .then((user: User) => {
        user.token = accessToken;
        done(null, user);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        console.log(err);
        done(err);
      });
  }
}

/**
 *
 * @param user
 */
export const mapFaceBookProfile: UserProfileFactory<Profile> = function (
  user: Profile,
): UserProfile {
  const userProfile: UserProfile = {
    [securityId]: user.id,
    profile: {
      ...user,
      source: 'facebook',
    },
  };
  return userProfile;
};
