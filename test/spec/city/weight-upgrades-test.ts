import _ = require('lodash');

import WeightedList = require('app/scripts/generic-structures/weighted-list');

import Coord = require('app/scripts/city/coord');
import Direction = require('app/scripts/city/direction');
import Buildings = require('app/scripts/city/buildings/buildings');
import Building = Buildings.Building;
import BuildingType = require('app/scripts/city/buildings/building-type');

import BasicHouse = require('app/scripts/city/buildings/basic-house');
import NiceHouse = require('app/scripts/city/buildings/nice-house');
import FancyHouse = require('app/scripts/city/buildings/fancy-house');

import weightUpgrades = require('app/scripts/city/weight-upgrades');

function c(x, y) {
  return new Coord(x, y);
}

function getAllBuildings(weightedList: WeightedList<Building>): Building[] {
  var someValues = _.range(1000).map(() => weightedList.get());
  return _(someValues).sortBy((value) => value !== null && value.buildingType)
                      .unique()
                      .value();
}

function getCoordFrequency(weightedList: WeightedList<Building>) {
  var someValues = _.range(10000).map(() => weightedList.get());
  return _.countBy(someValues, (building) => building.coords.toString());
}

function getBuildingTypeFrequency(weightedList: WeightedList<Building>) {
  var someValues = _.range(10000).map(() => weightedList.get());
  return _.countBy(someValues, (building) => building.buildingType);
}

describe("Weighting upgrades", () => {
  it("should include all the original buildings", () => {
    var upgrades = [{ building: new BasicHouse(c(0, 1), Direction.South), cost: 0 },
                     { building: new NiceHouse(c(0, 0), Direction.North), cost: 0 },
                     { building: new FancyHouse(c(1, 0), c(2, 0), Direction.South), cost: 0 }];

    var weighted = weightUpgrades(upgrades);

    expect(getAllBuildings(weighted)).to.deep.equal(_.pluck(upgrades, "building"));
  });

  it("should weight more central buildings higher", () => {
    var upgrades = [{ building: new BasicHouse(c(2, 0), Direction.South), cost: 0 },
                     { building: new BasicHouse(c(1, 0), Direction.South), cost: 0 }];

    var weighted = weightUpgrades(upgrades);

    var coordFrequencies = getCoordFrequency(weighted);
    var [closeCount, farCount] = [c(1, 0), c(2, 0)].map((coord) => coordFrequencies[coord.toString()]);
    expect(closeCount).to.be.approx(farCount * 2, 25);
  });

  it("should weight more expensive buildings proportionally higher", () => {
    var upgrades = [{ building: new BasicHouse(c(0, 0), Direction.South), cost: 1 },
                    { building: new NiceHouse( c(0, 0), Direction.South), cost: 10 }];

    var weighted = weightUpgrades(upgrades);

    var typeFrequencies = getBuildingTypeFrequency(weighted);
    var cheapCount = typeFrequencies[BuildingType.BasicHouse] || 0;
    var expensiveCount = typeFrequencies[BuildingType.NiceHouse] || 0;

    expect(cheapCount).to.be.approx(expensiveCount * 10);
  });

  it("should combine distance and building cost sensibly", () => {
    var upgrades = [{ building: new BasicHouse(c(0, 5), Direction.North), cost: 1 },
      { building: new NiceHouse( c(0, 2), Direction.North), cost: 10 }];

    var weighted = weightUpgrades(upgrades);

    var typeFrequencies = getBuildingTypeFrequency(weighted);
    var cheapCount = typeFrequencies[BuildingType.BasicHouse] || 0;
    var expensiveCount = typeFrequencies[BuildingType.NiceHouse] || 0;

    // Cost of 12 (2 distance + 10 cost) vs cost of 6 (5 distance + 1 cost)
    expect(cheapCount).to.be.approx(expensiveCount * 2);
  });
});