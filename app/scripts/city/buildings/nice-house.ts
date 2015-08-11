import Buildings = require('city/buildings/buildings');
import serialization = require('city/city-serialization');

import Direction = require('city/direction');
import Map = require('city/map');
import BuildingType = require('city/buildings/building-type');
import Coord = require('city/coord');
import FancyHouse = require('city/buildings/fancy-house');

class NiceHouse extends Buildings.AbstractBuilding implements Buildings.Building {

  constructor(private coord: Coord, direction) {
    super(BuildingType.NiceHouse, [coord], direction);
  }

  canBeBuiltOn(lookup: Buildings.BuildingLookup) {
    return lookup.getBuildingAt(this.coord).buildingType === BuildingType.BasicHouse;
  }

  getPotentialUpgrades(): Buildings.Building[] {
    return _(this.coord.getDirectNeighbours())
            .map((neighbouringCoord) => {
              var coordDirection = this.coord.getDirectionToward(neighbouringCoord);
              return [new FancyHouse(this.coord, neighbouringCoord, Direction.leftOf(coordDirection)),
                      new FancyHouse(this.coord, neighbouringCoord, Direction.rightOf(coordDirection))]
            })
            .flatten()
            .value();
  }

  static deserialize(coords: Coord[], direction: Direction): Buildings.Building {
    if (coords.length !== 1) {
      throw new Error("Attempting to build NiceHouse with invalid coords: " + JSON.stringify(coords));
    }

    return new NiceHouse(coords[0], direction);
  }
}

Buildings.registerBuildingType(BuildingType.NiceHouse, NiceHouse);

export = NiceHouse;