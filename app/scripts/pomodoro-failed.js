'use strict';

require(["knockout", "score"], function (ko, score) {
  ko.applyBindings({
    points: score.points
  });
});