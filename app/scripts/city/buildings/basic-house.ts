import Buildings = require('city/buildings/buildings');
import serialization = require('city/city-serialization');

import Map = require('city/map');
import BuildingType = require('city/buildings/building-type');
import Coord = require('city/coord');
import NiceHouse = require('city/buildings/nice-house');

class BasicHouse extends Buildings.AbstractBuilding implements Buildings.Building {

  constructor(private coord: Coord) {
    super(BuildingType.BasicHouse, [coord]);
  }

  canBeBuiltOn(lookup: Buildings.BuildingLookup) {
    return lookup.getBuildingAt(this.coord) === undefined;
  }

  getPotentialUpgrades(): Buildings.Building[] {
    return [new NiceHouse(this.coord)];
  }

  static deserialize(coords: Coord[]): Buildings.Building {
    if (coords.length !== 1) {
      throw new Error("Attempting to build BasicHouse with invalid coords: " + JSON.stringify(coords));
    }

    return new BasicHouse(coords[0]);
  }
}

Buildings.registerBuildingType(BuildingType.BasicHouse, BasicHouse);

export = BasicHouse;