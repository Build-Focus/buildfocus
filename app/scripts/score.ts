'use strict';

import ko = require('knockout');
import _ = require('lodash');
import synchronizedObservable = require('observables/synchronized-observable');

class Score {
  points = synchronizedObservable("points", 0, "sync");

  addSuccess() {
    this.points(this.points() + 1);
  }

  addFailure() {
    this.points(this.points() - 1);
  }
}

// Singleton
var score = new Score();
export = score;