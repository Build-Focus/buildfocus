'use strict';

var Domain = function (pattern) {
  this.pattern = pattern;
  this.isValid = pattern && pattern.length > 0;

  this.matches = function (url) {
    return url.indexOf(pattern) > -1;
  }
};