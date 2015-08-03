'use strict';

import Coord = require('city/coord');
import BuildingType = require('city/building-type');
import serialization = require('city/city-serialization');

class Building {

  public coords: Coord[];

  constructor(coords: Coord[], public buildingType: BuildingType) {
    this.coords = coords.sort();
  }

  // TODO: Push this onto house-type-specific subclasses (and consider how to take fetcher)
  getPotentialUpgrades(buildingFetcher: (coord) => Building): Building[] {
    if (this.buildingType === BuildingType.BasicHouse) {
      var onlyCoord = this.coords[0];
      return _(onlyCoord.getDirectNeighbours()).map((neighbouringCoord) => {
        var currentBuilding = buildingFetcher(neighbouringCoord);
        if (currentBuilding && currentBuilding.buildingType === BuildingType.BasicHouse) {
          return new Building([onlyCoord, neighbouringCoord], BuildingType.FancyHouse);
        }
      }).compact().value();
    } else return [];
  }

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