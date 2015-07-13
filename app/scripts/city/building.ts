'use strict';

import Coord = require('city/coord');
import BuildingType = require('city/building-type');

class Building {
  public coords: Coord[];
  public buildingType: BuildingType;

  constructor(coords: Coord[], buildingType: BuildingType) {
    this.coords = coords;
    this.buildingType = buildingType;
  }
}

export = Building;