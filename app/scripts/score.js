'use strict';

define(["lodash", "knockout"], function (_, ko) {
  function Score() {
    var self = this;
    self.points = ko.observable(0);

    chrome.storage.sync.get("points", function (loadedData) {
      // TODO: Breaking this doesn't break the acceptance tests!
      self.points(loadedData.points || 0);
    });

    chrome.storage.onChanged.addListener(function (changes) {
      if (_.has(changes, "points")) {
        self.points(changes.points.newValue);
      }
    });

    self.points.subscribe(function () {
      chrome.storage.sync.set({points: self.points()});
    });

    this.addSuccess = function addSuccess() {
      self.points(self.points() + 1);
    };

    this.addFailure = function addFailure() {
      self.points(self.points() - 1);
    };
  }

  return new Score();
});