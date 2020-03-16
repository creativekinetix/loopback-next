// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-oauth2-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {
  AuthenticationComponent,
  AuthenticationBindings,
} from '@loopback/authentication';
import {Oauth2Controller} from './controllers';
import {
  Oauth2Authorization,
  AuthenticateActionProvider,
} from './authentication-strategies';
import {MyUserService, UserServiceBindings} from './services';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';

export class Oauth2LoginApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();

    this.add(createBindingFromClass(Oauth2Authorization));

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    const client = require('../client/app');

    this.mountExpressRouter('/', client);

    this.controller(Oauth2Controller);

    this.component(AuthenticationComponent);

    this.bind(AuthenticationBindings.AUTH_ACTION).toProvider(
      AuthenticateActionProvider,
    );

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
  }
}
