// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-oauth2-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
  },
})
export class User extends Entity {
  // must keep it
  @property({
    type: 'number',
    id: 1,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  realm?: string;

  // must keep it
  @property({
    type: 'string',
  })
  username: string;

  // must keep it
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'boolean',
  })
  emailVerified?: boolean;

  @property({
    type: 'string',
  })
  verificationToken?: string;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
