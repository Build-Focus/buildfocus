'use strict';

import CellType = require('city/cell-type');

class Cell {
  public x: number;
  public y: number;

  private type: CellType;

  constructor(x: number, y: number, type: CellType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

export = Cell;