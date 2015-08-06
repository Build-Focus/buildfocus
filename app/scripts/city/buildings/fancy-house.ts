import Buildings = require('city/buildings/buildings');
import serialization = require('city/city-serialization');

import Map = require('city/map');
import BuildingType = require('city/buildings/building-type');
import Coord = require('city/coord');
import BasicHouse = require('city/buildings/basic-house');

class FancyHouse extends Buildings.AbstractBuilding implements Buildings.Building {

  constructor(private coord1: Coord, private coord2: Coord) {
    super(BuildingType.FancyHouse, [coord1, coord2]);
  }

  canBeBuiltOn(lookup: Buildings.BuildingLookup) {
    var twoNeighbouringCells = this.coord1.isDirectNeighbour(this.coord2);
    var existingBuildingsAreHouses = _.all([this.coord1, this.coord2], (coord) => {
      var existingBuilding = lookup.getBuildingAt(coord);
      return existingBuilding && existingBuilding.buildingType === BuildingType.BasicHouse;
    });
    return twoNeighbouringCells && existingBuildingsAreHouses;
  }

  getPotentialUpgrades(): Buildings.Building[] {
    return [];
  }

  static deserialize(coords: Coord[]): Buildings.Building {
    if (coords.length !== 2) {
      throw new Error("Attempting to build FancyHouse with invalid coords: " + JSON.stringify(coords));
    }

    return new FancyHouse(coords[0], coords[1]);
  }
}

Buildings.registerBuildingType(BuildingType.FancyHouse, FancyHouse);

export = FancyHouse;