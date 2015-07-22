#!/usr/bin/node
/* jshint node:true */

/**
 * Precommit hook to catch accidental inclusion of describe.only()/it.only(),
 * which both disable all but the selected tests.
 *
 * Enable by running:
 *   ln -s ../../pre-commit.js .git/hooks/pre-commit
 */

'use strict';
var glob = require('glob');
var async = require('async');
var fs = require('fs');
var chalk = require('chalk');

glob('test/**/*.*', function(err, files) {
  if (err) {
    throw err;
  }
  async.map(files, getFileReader(), function(err, results) {
    if (err) {
      throw err;
    }
    var badFiles = [];
    var badMatch = /describe\.only|it\.only/gmi;
    results.forEach(function(fileContents, index) {
      if (badMatch.test(fileContents)) {
        badFiles.push(files[index]);
      }
    });
    var p = badFiles.length > 1;
    if (badFiles.length) {
      var message = chalk.bold.red('There ' + (p ? 'are' : 'is') + ' ' + badFiles.length + ' ' +
          (p ? 'files' : 'file') + ' with a `.only` still included:');
      var badFilesPart = chalk.red(badFiles.join('\n\t'));
      console.warn([message, badFilesPart].join('\n\t'));
      throw new Error('only-check failed');
    }
  });
});

function getFileReader() {
  return function readFileUTF8(filepath, callback) {
    return fs.readFile(filepath, 'utf8', callback);
  };
}
