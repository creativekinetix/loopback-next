// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: 'src',
    file: 'application.ts',
    content: fs.readFileSync(require.resolve('./application.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: 'lib',
    file: 'no-header.js',
    content: fs.readFileSync(require.resolve('./no-header.js'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: '',
    file: 'package.json',
    content: fs.readFileSync(require.resolve('./package.json.txt'), {
      encoding: 'utf-8',
    }),
  },
];
