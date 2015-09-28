import _ = require('lodash');

import WeightedList = require('app/scripts/generic-structures/weighted-list');

import Coord = require('app/scripts/city/coord');
import Direction = require('app/scripts/city/direction');
import Buildings = require('app/scripts/city/buildings/buildings');
import Building = Buildings.Building;

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

describe("Weighting upgrades", () => {
  it("should include all the original buildings", () => {
    var buildings = [new BasicHouse(c(0, 1), Direction.South),
                     new NiceHouse(c(0, 0), Direction.North),
                     new FancyHouse(c(1, 0), c(2, 0), Direction.South)];

    var weighted = weightUpgrades(buildings);

    expect(getAllBuildings(weighted)).to.deep.equal(buildings);
  });

  it("should weight central buildings more heavily", () => {
    var buildings = [new BasicHouse(c(2, 0), Direction.South),
                     new BasicHouse(c(1, 0), Direction.South),
                     new BasicHouse(c(0, 0), Direction.South)];

    var weighted = weightUpgrades(buildings);

    var coordFrequencies = getCoordFrequency(weighted);
    var [closeCount, farCount] = [c(0, 0), c(2, 0)].map((coord) => coordFrequencies[coord.toString()]);
    expect(closeCount).to.be.approx(farCount * 27, 25);
  });
});