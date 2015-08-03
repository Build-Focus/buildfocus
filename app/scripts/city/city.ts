'use strict';

import _ = require("lodash");
import ko = require("knockout");

import subscribableEvent = require('subscribable-event');
import Map = require('city/map');
import Coord = require('city/coord');
import Cell = require('city/cell');
import CellType = require('city/cell-type');
import Building = require('city/building');
import BuildingType = require('city/building-type');

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

  getPossibleUpgrades(): Building[] {
    var buildingCoords = _(this.getBuildings()).pluck('coords').flatten().value();
    var buildableCells = _.reject(this.getCells(), (cell) => !!_.findWhere(buildingCoords, cell.coord));
    var greenfieldBuildings = buildableCells.map((cell) => new Building([cell.coord], BuildingType.BasicHouse));

    var buildingUpgrades = _(this.getBuildings()).map((building: Building) => building.getPotentialUpgrades((coord) => {
      return this.map.getBuildingAt(coord);
    })).flatten().unique(JSON.stringify).value();

    return greenfieldBuildings.concat(buildingUpgrades);
  }

  construct(building: Building): void {
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

  onChanged = subscribableEvent();

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