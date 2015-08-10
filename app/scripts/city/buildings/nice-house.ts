import Buildings = require('city/buildings/buildings');
import serialization = require('city/city-serialization');

import Map = require('city/map');
import BuildingType = require('city/buildings/building-type');
import Coord = require('city/coord');
import FancyHouse = require('city/buildings/fancy-house');

class NiceHouse extends Buildings.AbstractBuilding implements Buildings.Building {

  constructor(private coord: Coord) {
    super(BuildingType.NiceHouse, [coord]);
  }

  canBeBuiltOn(lookup: Buildings.BuildingLookup) {
    return lookup.getBuildingAt(this.coord).buildingType === BuildingType.BasicHouse;
  }

  getPotentialUpgrades(): Buildings.Building[] {
    return this.coord.getDirectNeighbours()
                     .map((neighbouringCoord) => new FancyHouse(this.coord, neighbouringCoord));
  }

  static deserialize(coords: Coord[]): Buildings.Building {
    if (coords.length !== 1) {
      throw new Error("Attempting to build NiceHouse with invalid coords: " + JSON.stringify(coords));
    }

    return new NiceHouse(coords[0]);
  }
}

Buildings.registerBuildingType(BuildingType.NiceHouse, NiceHouse);

export = NiceHouse;