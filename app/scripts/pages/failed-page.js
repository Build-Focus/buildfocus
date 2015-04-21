'use strict';

define(["score"], function (score) {
  return function FailedPageViewModel() {
    this.points = score.points;
  };
});