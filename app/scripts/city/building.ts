'use strict';

import Coord = require('city/coord');
import BuildingType = require('city/building-type');
import serialization = require('city/city-serialization');

class Building {

  constructor(public coords: Coord[], public buildingType: BuildingType) { }

  serialize(): serialization.BuildingData {
    return {
      coords: this.coords.map((coord) => coord.serialize()),
      buildingType: this.buildingType
    }
  }

  static deserialize(data: serialization.BuildingData): Building {
    var coords = data.coords.map(Coord.deserialize);
    return new Building(coords, data.buildingType);
  }
}

export = Building;