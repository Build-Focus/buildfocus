'use strict';

import CellType = require('city/cell-type');
import Cell = require('city/cell');
import Coord = require('city/coord');

class NullCell extends Cell {
  constructor(coord: Coord) {
    super(coord, CellType.Null);
  }
}

export = NullCell;