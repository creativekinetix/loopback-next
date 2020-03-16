// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  get,
  RestBindings,
  Response,
  HttpHandler,
  RequestContext,
} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';

/**
 * Login controller for third party oauth provider
 *
 * This creates an authentication endpoint for the third party oauth provider
 *
 * Two methods are expected
 *
 * 1. loginToThirdParty
 *           i. an endpoint for api clients to login via a third party app
 *          ii. the passport strategy identifies this call as a redirection to third party
 *         iii. this endpoint redirects to the third party authorization url
 *
 * 2. thirdPartyCallBack
 *           i. this is the callback for the thirdparty app
 *          ii. on successful user login the third party calls this endpoint with an access code
 *         iii. the passport oauth2 strategy exchanges the code for an access token
 *          iv. the passport oauth2 strategy then calls the provided `verify()` function with the access token
 */

export class Oauth2Controller {
  constructor() {}

  // this configures the oauth2 strategy
  @authenticate('Oauth2')
  // we have modeled this as a GET endpoint
  @get('/auth/thirdparty')
  // loginToThirdParty() is the handler for '/auth/thirdparty'
  // this method is injected with redirect url and status
  // the value for 'authentication.redirect.url' is set by the authentication action provider
  loginToThirdParty(
    @inject('authentication.redirect.url')
    redirectUrl: string,
    @inject('authentication.redirect.status')
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    // controller handles redirect
    // and returns response object to indicate response is already handled
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  // we configure the callback url also with the same oauth2 strategy
  @authenticate('Oauth2')
  // this SHOULD be a GET call so that the third party can ask the browser to redirect
  @get('/auth/thirdparty/callback')
  // thirdPartyCallBack() is the handler for '/auth/thirdparty/callback'
  // the oauth2 strategy identifies this as a callback with the request.query.code sent by the third party app
  // the oauth2 strategy exchanges the access code for a access token and then calls the provided verify() function
  // the verify function creates a user profile after verifying the access token
  async thirdPartyCallBack(
    @inject(SecurityBindings.USER) user: UserProfile,
    @inject(RestBindings.Http.CONTEXT) context: RequestContext,
    @inject(RestBindings.HANDLER) handler: HttpHandler,
  ) {
    const request = context.request;
    request.user = {
      profiles: [
        {
          user: user.profile.profile._json,
          token: user.profile.token,
          provider: user.profile.profile.provider,
        },
      ],
    };
    request.url = '/auth/account';
    request.method = 'get';
    await handler.findRoute(request).invokeHandler(context, []);
    return context.response;
  }
}
