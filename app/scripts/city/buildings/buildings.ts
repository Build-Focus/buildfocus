'use strict';

import Direction = require('city/direction');
import Map = require('city/map');
import Coord = require('city/coord');
import BuildingType = require('city/buildings/building-type');
import serialization = require('city/city-serialization');
import FancyHouse = require('city/buildings/fancy-house');

interface BuildingFactory {
  deserialize(coords: Coord[], direction: Direction): Building;
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
  direction: Direction;

  canBeBuiltOn(lookup: BuildingLookup): boolean;
  getPotentialUpgrades(): Building[];

  serialize(): serialization.BuildingData;
}

export class AbstractBuilding {
  constructor(private _buildingType: BuildingType, private _coords: Coord[], private _direction: Direction) {
    if (this.constructor === AbstractBuilding) {
      throw new Error("AbstractBuilding is abstract and should not be instantiated directly");
    }
    if (BuildingType[_buildingType] === undefined) throw new Error("Can't create building without a building type");
    if (!_coords || _coords.length === 0) throw new Error("Can't create building without any coords");
    if (Direction[_direction] === undefined) throw new Error("Can't create building without a direction");
  }

  get direction(): Direction {
    return this._direction;
  }

  get buildingType(): BuildingType {
    return this._buildingType;
  }

  get coords(): Coord[] {
    return this._coords;
  }

  serialize(): serialization.BuildingData {
    return {
      coords: this.coords.map(c => c.serialize()),
      buildingType: this.buildingType,
      direction: this.direction
    };
  }
}

export function deserialize(data: serialization.BuildingData) {
  var coords = data.coords.map(Coord.deserialize);
  var buildingFactory = buildingFactoryMap[data.buildingType];
  return buildingFactory.deserialize(coords, data.direction);
}

