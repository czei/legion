/* eslint-disable no-console */
'use strict';

const cli = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const capture = (function() {
  try      { return require('legion-capture'); }
  catch(e) { return null;                      }
})();
const metrics = require('legion-metrics');

const cli_option_definitions = [
  { name: 'capture-endpoint',        type: String,  typeLabel: '[underline]{URL}',     description: 'endpoint of metrics capture server' },
  { name: 'capture-interval',        type: Number,  typeLabel: '[underline]{seconds}', description: 'interval between streaming metrics to the capture server' },
  { name: 'help',                    type: Boolean,                                    description: 'print this help message' },
  { name: 'project-key',             type: String,  typeLabel: '[underline]{string}',  description: 'project unique key' },
  { name: 'users', alias: 'n',       type: Number,  typeLabel: '[underline]{number}',  description: 'the number of concurrent users' }
];

/*
 * Print usage information.
 */
/* istanbul ignore next */
function printUsage() {
  const usage = commandLineUsage([{
    header: 'Run load tests with legion.',
    optionList: cli_option_definitions
  }]);

  console.log(usage);
}

/*
 * Run the load test using the specified options.
 *
 * options.testcase - the path to require() the testcase.
 * options.users - the number of concurrent users.
 */
function main(testcase) {
  const options = cli(cli_option_definitions);

  /* istanbul ignore next */
  if( options.help ) {
    printUsage();
    return;
  }

  if( !options['project-key'] )
    options['project-key'] = 'default';

  /* istanbul ignore next */
  if( options['capture-endpoint'] )
    testcase = testcase.metricsTarget(capture.Target.create(
        metrics.merge,
        options['capture-endpoint'],
        1000*(options['capture-interval'] || 60),
        { project_key:options['project-key'] }));

  options.users = options.users || 1;

  return Promise.resolve()
    .then(() => testcase.run(options.users).log())
    .catch(err => {
      process.exitCode = 1;
      throw err;
    });
}

module.exports = main;
