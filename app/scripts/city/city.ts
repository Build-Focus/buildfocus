'use strict';

import _ = require("lodash");

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
  }

  getCells(): Cell[] {
    return this.map.getCells();
  }

  getBuildings(): Building[] {
    return this.map.getBuildings();
  }

  getPossibleUpgrades(): Building[] {
    var buildingCoords = _(this.getBuildings()).pluck('coords').flatten();
    var buildableCells = _.reject(this.getCells(), (cell) => _(buildingCoords).contains(cell.coord));

    return buildableCells.map(function (cell) {
      return new Building([cell.coord], BuildingType.BasicHouse);
    });
  }

  construct(building: Building): void {
    this.map.construct(building);
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