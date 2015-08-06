'use strict';

import _ = require("lodash");
import ko = require("knockout");

import subscribableEvent = require('subscribable-event');
import Map = require('city/map');
import Coord = require('city/coord');
import Cell = require('city/cell');
import CellType = require('city/cell-type');

import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;

import BasicHouse = require('city/buildings/basic-house');

// Handles setup and defines the external API of the city model
class City {
  private cellFactory: (Coord) => Cell;
  private map: Map;

  constructor() {
    this.cellFactory = (coord: Coord) => new Cell(coord, CellType.Grass);
    this.map = new Map(this.cellFactory);
    ko.track(this);
  }

  getCells(): Cell[] {
    return this.map.getCells();
  }

  getBuildings(): Building[] {
    return this.map.getBuildings();
  }

  private getPossibleNewBuildings(): Building[] {
    var buildingCoords = _(this.getBuildings()).pluck('coords').flatten().value();
    var buildableCells = _.reject(this.getCells(), (cell) => !!_.findWhere(buildingCoords, cell.coord));
    return buildableCells.map((cell) => new BasicHouse(cell.coord));
  }

  private getPossibleBuildingUpgrades(): Building[] {
    return _(this.getBuildings()).map((building) => building.getPotentialUpgrades())
                                 .flatten()
                                 .unique((building) => JSON.stringify(building.serialize()))
                                 .filter((building) => building.canBeBuiltOn(this.map))
                                 .value();
  }

  getPossibleUpgrades(): Building[] {
    return this.getPossibleNewBuildings().concat(this.getPossibleBuildingUpgrades());
  }

  onChanged = subscribableEvent();

  construct(building: Building): void {
    if (!building.canBeBuiltOn(this.map)) {
      throw new Error("Attempt to build invalid building: " + JSON.stringify(building));
    }

    building.coords.map((coord) => this.map.getBuildingAt(coord))
                   .filter((existingBuilding) => existingBuilding !== undefined)
                   .forEach((existingBuilding) => this.map.remove(existingBuilding));

    this.map.construct(building);
    this.onChanged.trigger();
  }

  remove(building: Building): void {
    this.map.remove(building);
    this.onChanged.trigger();
  }

  updateFromJSON(json: string): void {
    var data = JSON.parse(json);
    this.map = Map.deserialize(data.map, this.cellFactory);
  }

  toJSON(): string {
    return JSON.stringify({
      map: this.map.serialize()
    });
  }
}

export = City;