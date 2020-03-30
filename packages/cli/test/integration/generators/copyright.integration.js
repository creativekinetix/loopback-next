// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/copyright');
const SANDBOX_FILES = require('../../fixtures/copyright').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

const year = new Date().getFullYear();

describe('lb4 copyright', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('updates copyright/license headers with prompts', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () =>
        testUtils.givenLBProject(SANDBOX_PATH, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withPrompts({owner: 'ACME Inc.', license: 'ISC'})
      .withOptions({gitOnly: false});

    assertApplicationTsFileUpdated();
    assertJsFileUpdated();
  });

  it('updates copyright/license headers with options', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () =>
        testUtils.givenLBProject(SANDBOX_PATH, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({owner: 'ACME Inc.', license: 'ISC', gitOnly: false});

    assertApplicationTsFileUpdated();
    assertJsFileUpdated();
  });
});

function assertApplicationTsFileUpdated() {
  const file = path.join(SANDBOX_PATH, 'src', 'application.ts');
  assertHeader(file);
}

function assertHeader(file) {
  assert.fileContent(
    file,
    `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
  );
  assert.fileContent(file, '// Node module: myapp');
  assert.fileContent(
    file,
    '// This file is licensed under the ISC License (ISC).',
  );
  assert.fileContent(
    file,
    '// License text available at https://opensource.org/licenses/ISC',
  );
}

function assertJsFileUpdated() {
  const file = path.join(SANDBOX_PATH, 'lib', 'no-header.js');
  assertHeader(file);
}
