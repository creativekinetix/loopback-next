// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const _ = require('lodash');
const git = require('./git');
const path = require('path');
const fs = require('fs-extra');
const Project = require('@lerna/project');

const {promisify} = require('util');
const glob = promisify(require('glob'));

const debug = require('debug')('loopback:cli:copyright');

// Components of the copyright header.
const COPYRIGHT = [
  'Copyright <%= owner %> <%= years %>. All Rights Reserved.',
  'Node module: <%= name %>',
];
const LICENSE = [
  'This file is licensed under the <%= license %>.',
  'License text available <%= ref %>',
];
const CUSTOM_LICENSE = [];

// Compiled templates for generating copyright headers
const UNLICENSED = _.template(COPYRIGHT.join('\n'));
const LICENSED = _.template(COPYRIGHT.concat(LICENSE).join('\n'));
let CUSTOM = UNLICENSED;
if (CUSTOM_LICENSE.length) {
  CUSTOM = _.template(COPYRIGHT.concat(CUSTOM_LICENSE).join('\n'));
}

// Patterns for matching previously generated copyright headers
const BLANK = /^\s*$/;
const ANY = COPYRIGHT.concat(LICENSE, CUSTOM_LICENSE).map(
  l => new RegExp(l.replace(/<%[^>]+%>/g, '.*')),
);

/**
 * Inspect years for a given file based on git history
 * @param {string} file - JS/TS file
 */
async function copyYears(file) {
  file = file || '.';
  let dates = await git(
    process.cwd(),
    '--no-pager log --pretty=%%ai --all -- %s',
    file,
  );
  debug('Dates for %s', file, dates);
  if (_.isEmpty(dates)) {
    // if the given path doesn't have any git history, assume it is new
    dates = [new Date().toJSON()];
  } else {
    dates = [_.head(dates), _.last(dates)];
  }
  const years = _.map(dates, getYear);
  return _.uniq(years).sort();
}

// assumes ISO-8601 (or similar) format
function getYear(str) {
  return str.slice(0, 4);
}

/**
 * Copy header for a file
 * @param {string} file - JS/TS file
 * @param {object} pkg - Package json object
 * @param {object} options - Options
 */
async function copyHeader(file, pkg, options) {
  const license = options.license || _.get(pkg, 'license');
  const years = await copyYears(file);
  const params = expandLicense(license);
  params.years = years.join(',');
  const owner =
    options.copyrightOwner ||
    _.get(pkg, 'copyright.owner') ||
    _.get(pkg, 'author.name', 'Owner');

  const name =
    options.copyrightIdentifer ||
    _.get(pkg, 'copyright.identifier', _.get(pkg, 'name'));

  _.defaults(params, {
    owner,
    name,
    license,
  });
  debug('Params', params);
  return params.template(params);
}

function expandLicense(name) {
  if (/^apache/i.test(name)) {
    return {
      template: LICENSED,
      license: 'Apache License 2.0',
      ref: 'at https://opensource.org/licenses/Apache-2.0',
    };
  }
  if (/^artistic/i.test(name)) {
    return {
      template: LICENSED,
      license: 'Artistic License 2.0',
      ref: 'at https://opensource.org/licenses/Artistic-2.0',
    };
  }
  if (/^mit$/i.test(name)) {
    return {
      template: LICENSED,
      license: 'MIT License',
      ref: 'at https://opensource.org/licenses/MIT',
    };
  }
  if (/^isc$/i.test(name)) {
    return {
      template: LICENSED,
      license: 'ISC License (ISC)',
      ref: 'at https://opensource.org/licenses/ISC',
    };
  }
  return {
    template: CUSTOM,
    license: name,
  };
}

/**
 * Format the header for a file
 * @param {string} file - JS/TS file
 * @param {string} pkg - Package json object
 * @param {object} options - Options
 */
async function formatHeader(file, pkg, options) {
  const header = await copyHeader(file, pkg, options);
  return header.split('\n').map(line => `// ${line}`);
}

/**
 * Ensure the file is updated with the correct header
 * @param {string} file - JS/TS file
 * @param {object} pkg - Package json object
 * @param {object} options - Options
 */
async function ensureHeader(file, pkg, options = {}) {
  const header = await formatHeader(file, pkg, options);
  debug('Header: %s', header);
  const current = await fs.readFile(file, 'utf8');
  const content = mergeHeaderWithContent(header, current);
  if (!options.dryRun) {
    await fs.writeFile(file, content, 'utf8');
  } else {
    console.log(file, header);
  }
  return content;
}

/**
 * Merge header with file content
 * @param {string} header - Copyright header
 * @param {string} content - File content
 */
function mergeHeaderWithContent(header, content) {
  const lineEnding = /\r\n/gm.test(content) ? '\r\n' : '\n';
  const preamble = [];
  content = content.split(lineEnding);
  if (/^#!/.test(content[0])) {
    preamble.push(content.shift());
  }
  // replace any existing copyright header lines and collapse blank lines down
  // to just one.
  while (headerOrBlankLine(content[0])) {
    content.shift();
  }
  return [].concat(preamble, header, '', content).join(lineEnding);
}

function headerOrBlankLine(line) {
  return BLANK.test(line) || ANY.some(pat => pat.test(line));
}

/**
 * List all JS/TS files
 * @param {string[]} paths - Paths to search
 */
async function jsOrTsFiles(paths = []) {
  paths = [].concat(paths);
  const globs = paths.map(p => {
    if (/\/$/.test(p)) {
      p += '**/*.{js,ts}';
    } else if (!/[^*]\.(js|ts)$/.test(p)) {
      p += '/**/*.{js,ts}';
    }
    return glob(p, {nodir: true, follow: false});
  });
  paths = await Promise.all(globs);
  paths = _.flatten(paths);
  return _.filter(paths, /\.(js|ts)$/);
}

/**
 * Update file headers for the given project
 * @param {string} projectRoot - Root directory of a package or a lerna monorepo
 * @param {object} options - Options
 */
async function updateFileHeaders(projectRoot, options = {}) {
  options = {
    dryRun: false,
    gitOnly: true,
    ...options,
  };

  const isMonorepo = await fs.exists(path.join(projectRoot, 'lerna.json'));
  if (isMonorepo) {
    // List all packages for the monorepo
    const project = new Project(projectRoot);
    debug('Lerna monorepo', project);
    const packages = await project.getPackages();

    // Update file headers for each package
    const visited = [];
    for (const p of packages) {
      visited.push(p.location);
      await updateFileHeaders(p.location, options);
    }

    // Now handle the root level package
    // Exclude files that have been processed
    const filter = f =>
      !visited.some(dir => {
        dir = path.relative(projectRoot, dir);
        return f.startsWith(path.join(dir, '/'));
      });
    await updateFileHeadersForSinglePackage(projectRoot, {filter, ...options});
  } else {
    await updateFileHeadersForSinglePackage(projectRoot, options);
  }
}

/**
 * Update file headers for the given project
 * @param {string} projectRoot - Root directory of a package
 * @param {object} options - Options
 */
async function updateFileHeadersForSinglePackage(projectRoot, options) {
  debug('Options', options);
  debug('Project root: %s', projectRoot);
  const pkgFile = path.join(projectRoot, 'package.json');
  const exists = await fs.exists(pkgFile);
  if (!exists) {
    console.error('No package.json exists at %s.', projectRoot);
    return;
  }
  const pkg = await fs.readJson(pkgFile);
  console.log(
    'Updating project %s (%s)',
    pkg.name,
    path.relative(process.cwd(), projectRoot) || '.',
  );
  debug('Package', pkg);
  let files = options.gitOnly
    ? await git(projectRoot, 'ls-files')
    : [projectRoot];
  debug('Paths', files);
  if (typeof options.filter === 'function') {
    files = files.filter(options.filter);
  }
  files = await jsOrTsFiles(files);
  debug('JS/TS files', files);
  for (const file of files) {
    await ensureHeader(file, pkg, options);
  }
}

exports.updateFileHeaders = updateFileHeaders;

if (require.main === module) {
  updateFileHeaders(process.cwd()).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
