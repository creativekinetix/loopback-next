// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import express from 'express';
import http from 'http';
import {AddressInfo} from 'net';
import pEvent from 'p-event';
import {Oauth2LoginApplication} from './application';

export class ExpressServer {
  private app: express.Application;
  public readonly lbApp: Oauth2LoginApplication;
  private server?: http.Server;
  public url: String;

  constructor(options: ApplicationConfig = {}) {
    this.app = require('../client/app');

    this.lbApp = new Oauth2LoginApplication(options);

    // Mount the LB4 REST API
    this.app.use('/api', this.lbApp.requestHandler);
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port ?? 3000;
    const host = this.lbApp.restServer.config.host ?? 'localhost';
    this.server = this.app.listen(port, host);
    await pEvent(this.server, 'listening');
    const add = <AddressInfo>this.server.address();
    this.url = `https://${add.address}:${add.port}`;
  }

  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await pEvent(this.server, 'close');
    this.server = undefined;
  }
}
