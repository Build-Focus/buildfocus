'use strict';

define(["lodash", "knockout", "synchronized-observable"], function (_, ko, SynchronizedObservable) {
  function Score() {
    var self = this;
    self.points = new SynchronizedObservable("points", 0, "sync");

    this.addSuccess = function addSuccess() {
      self.points(self.points() + 1);
    };

    this.addFailure = function addFailure() {
      self.points(self.points() - 1);
    };
  }

  return new Score();
});