'use strict';

import Cell = require('city/cell');
import BuildingType = require('city/building-type');

class Building {
  // TODO: Store coords, not cells
  public cells: Cell[];
  public buildingType: BuildingType;

  constructor(cells: Cell[], buildingType: BuildingType) {
    this.cells = cells;
    this.buildingType = buildingType;
  }
}

export = Building;