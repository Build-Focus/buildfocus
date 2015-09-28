'use strict';

import WeightedList = require('generic-structures/weighted-list');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;

function distance(c: Coord): number {
  return Math.sqrt(Math.pow(c.x, 2) + Math.pow(c.y, 2));
}

export = function weightUpgrades(buildings: Building[]): WeightedList<Building> {
  var weightedList = new WeightedList<Building>();

  var maxDistance = _.max(buildings.map((building) => _.max(building.coords.map(distance))));

  buildings.forEach((building) => {
    var buildingWeight = Math.pow((maxDistance + 1) - _.max(building.coords.map(distance)), 3);
    weightedList.push(building, buildingWeight);
  });

  return weightedList;
}