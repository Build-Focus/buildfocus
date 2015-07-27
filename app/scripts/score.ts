'use strict';

import ko = require('knockout');
import _ = require('lodash');

import synchronizedObservable = require('observables/synchronized-observable');
import City = require('city/city');

class Score {
  points = synchronizedObservable("points", 0, "sync");

  city = new City();
  private cityData = synchronizedObservable("city-data", this.city.toJSON(), "sync");

  constructor() {
    this.cityData.subscribe((newCityData) => this.city.updateFromJSON(newCityData));
    this.city.onChanged(() => this.cityData(this.city.toJSON()));
  }

  addSuccess() {
    this.points(this.points() + 1);
  }

  addFailure() {
    this.points(this.points() - 1);
  }
}

export = Score;