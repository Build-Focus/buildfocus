'use strict';

import CellType = require('city/cell-type');
import Cell = require('city/cell');

class NullCell extends Cell {
  constructor(x: number, y: number) {
    super(x, y, CellType.Null);
  }
}

export = NullCell;