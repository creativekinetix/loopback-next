import {Oauth2LoginApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {Oauth2LoginApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new Oauth2LoginApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
