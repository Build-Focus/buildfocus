'use strict';

import Map = require('city/map');
import Cell = require('city/cell');
import CellType = require('city/cell-type');
import Building = require('city/building');
import BuildingType = require('city/building-type');

// Handles setup and defines the external API of the city model
class City {
  private map: Map;

  constructor() {
    var initialCell = new Cell(0, 0, CellType.Grass);
    var cellFactory = (x: number, y: number) => new Cell(x, y, CellType.Grass);
    this.map = new Map([initialCell], cellFactory);
  }

  getCells() {
    return this.map.getCells();
  }

  getBuildings() {
    return this.map.getBuildings();
  }

  construct(building: Building) {
    this.map.construct(building);
  }
}

export = City;