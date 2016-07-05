'use strict';

import ko = require('knockout');
import _ = require('lodash');

import weightUpgrades = require('city/weight-upgrades');
import synchronizedObservable = require('data-synchronization/synchronized-observable');

import Buildings = require('city/buildings/buildings');
import City = require('city/city');

import migrateCityData = require('city/serialization/migrate-city-data');

class Score {
  city = new City();

  private rawCityData = synchronizedObservable("city-data", this.city.toJSON(), "local");

  private cityData = ko.computed({
    read: () => {
      var rawData = this.rawCityData();
      var dataInCurrentFormat = migrateCityData(rawData);

      // If we had to do any migration, update the saved city data
      if (rawData !== dataInCurrentFormat) {
        this.rawCityData(dataInCurrentFormat);
      }

      return dataInCurrentFormat;
    },
    write: this.rawCityData
  });

  constructor() {
    this.cityData.subscribe((cityData) => this.city.updateFromJSON(cityData));
    this.city.onChanged(() => this.cityData(this.city.toJSON()));
  }

  addSuccess(): Buildings.Building {
    var possibleUpgrades = weightUpgrades(this.city.getPossibleUpgrades());
    var randomUpgrade = possibleUpgrades.get();
    this.city.construct(randomUpgrade);
    return randomUpgrade;
  }

  rejectSuccess(lastSuccess: Buildings.Building) {
    this.city.remove(lastSuccess);
    this.addFailure();
  }

  addFailure() {
    var buildingToRemove = _.sample(this.city.getBuildings());
    if (buildingToRemove) this.city.remove(buildingToRemove);
  }
}

export = Score;
