'use strict';

import CellType = require('city/cell-type');
import Coord = require('city/coord');

class Cell {
  public coord: Coord;
  public cellType: CellType;

  constructor(coord: Coord, type: CellType) {
    this.coord = coord;
    this.cellType = type;
  }

  toString() {
    return "[Cell: " + this.coord.toString() + " - " + this.cellType + "]";
  }
}

export = Cell;