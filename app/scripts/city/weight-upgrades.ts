'use strict';

import WeightedList = require('generic-structures/weighted-list');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;

function distanceFrom0(c: Coord): number {
  return Math.sqrt(Math.pow(c.x, 2) + Math.pow(c.y, 2));
}

export = function weightUpgrades(upgrades: Buildings.CostedBuilding[]): WeightedList<Building> {
  var weightedList = new WeightedList<Building>();

  upgrades.forEach((u) => u.cost += _.max(u.building.coords.map(distanceFrom0)));
  var maxCost = _.max(upgrades.map((u) => u.cost));

  upgrades.forEach((upgrade) => {
    var buildingWeight = maxCost / (upgrade.cost || 0.1);
    weightedList.push(upgrade.building, buildingWeight);
  });

  return weightedList;
}