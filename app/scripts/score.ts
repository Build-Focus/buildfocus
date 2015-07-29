'use strict';

import ko = require('knockout');
import _ = require('lodash');

import synchronizedObservable = require('observables/synchronized-observable');
import City = require('city/city');

class Score {
  city = new City();
  private cityData = synchronizedObservable("city-data", this.city.toJSON(), "sync");

  constructor() {
    this.cityData.subscribe((newCityData) => this.city.updateFromJSON(newCityData));
    this.city.onChanged(() => this.cityData(this.city.toJSON()));
  }

  addSuccess() {
    this.city.construct(this.city.getPossibleUpgrades()[0]);
  }

  addFailure() {
  }
}

export = Score;