'use strict';

import Map = require('city/map');
import Coord = require('city/coord');
import BuildingType = require('city/buildings/building-type');
import serialization = require('city/city-serialization');
import FancyHouse = require('city/buildings/fancy-house');

interface BuildingFactory {
  deserialize(coords: Coord[]): Building;
}

var buildingFactoryMap: { [buildingType: number]: BuildingFactory } = { };

export function registerBuildingType(type: BuildingType, factory: BuildingFactory) {
  buildingFactoryMap[type] = factory;
}

export interface BuildingLookup {
  getBuildingAt(coord: Coord): Building;
}

export interface Building {
  buildingType: BuildingType;
  coords: Coord[];

  canBeBuiltOn(lookup: BuildingLookup): boolean;
  getPotentialUpgrades(): Building[];

  serialize(): serialization.BuildingData;
}

export class AbstractBuilding {
  constructor(private _buildingType: BuildingType, private _coords: Coord[]) {
    if (this.constructor === AbstractBuilding) {
      throw new Error("AbstractBuilding is abstract and should not be instantiated directly");
    }
  }

  get buildingType(): BuildingType {
    return this._buildingType;
  }

  get coords(): Coord[] {
    return this._coords;
  }

  serialize(): serialization.BuildingData {
    return {
      // Sort these so that serialization is canonical
      coords: this.coords.sort().map(c => c.serialize()),
      buildingType: this.buildingType
    };
  }
}

export function deserialize(data: serialization.BuildingData) {
  var coords = data.coords.map(Coord.deserialize);
  var buildingFactory = buildingFactoryMap[data.buildingType];
  return buildingFactory.deserialize(coords);
}