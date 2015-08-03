'use strict';

import Map = require('city/map');
import Coord = require('city/coord');
import BuildingType = require('city/building-type');
import serialization = require('city/city-serialization');

class Building {

  public coords: Coord[];

  constructor(coords: Coord[], public buildingType: BuildingType) {
    this.coords = coords.sort();
  }

  // TODO: Make this depend on a more specific interface than Map
  canBeBuiltOn(map: Map) {
    if (this.buildingType === BuildingType.BasicHouse) {
      var onlyCoord = this.coords[0];
      return map.getBuildingAt(onlyCoord) === undefined;
    } else if (this.buildingType === BuildingType.FancyHouse) {
      var twoNeighbouringCells = this.coords.length === 2 && this.coords[0].isDirectNeighbour(this.coords[1]);
      var existingBuildingsAreHouses = _.all(this.coords, (coord) => {
        var existingBuilding = map.getBuildingAt(coord);
        return existingBuilding && existingBuilding.buildingType === BuildingType.BasicHouse;
      });
      return twoNeighbouringCells && existingBuildingsAreHouses;
    } else {
      throw new Error("Unknown building type");
    }
  }

  // TODO: Push this onto house-type-specific subclasses
  getPotentialUpgrades(): Building[] {
    if (this.buildingType === BuildingType.BasicHouse) {
      var onlyCoord = this.coords[0];
      return onlyCoord.getDirectNeighbours().map((neighbouringCoord) => {
        return new Building([onlyCoord, neighbouringCoord], BuildingType.FancyHouse);
      });
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