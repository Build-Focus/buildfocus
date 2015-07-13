'use strict';

import CellType = require('city/cell-type');
import Coord = require('city/coord');

class Cell {
  public coord: Coord;
  private type: CellType;

  constructor(coord: Coord, type: CellType) {
    this.coord = coord;
    this.type = type;
  }

  toString() {
    return "[Cell: " + this.coord.toString() + " - " + this.type + "]";
  }
}

export = Cell;