'use strict';

import ko = require('knockout');
import _ = require('lodash');

import synchronizedObservable = require('observables/synchronized-observable');
import City = require('city/city');

class Score {
  points = synchronizedObservable("points", 0, "sync");
  city = new City();

  constructor() {
    this.city.construct(this.city.getPossibleUpgrades()[0]);
  }

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