'use strict';

import CellType = require('city/cell-type');
import Coord = require('city/coord');
import serialization = require('city/serialization/serialization-format');

class Cell {
  constructor(public coord: Coord, public cellType: CellType) { }

  toString() {
    return "[Cell: " + this.coord.toString() + " - " + this.cellType + "]";
  }

  serialize(): serialization.CellData {
    return {
      coord: this.coord.serialize(),
      cellType: this.cellType
    }
  }

  static deserialize(data: serialization.CellData): Cell {
    return new Cell(Coord.deserialize(data.coord), data.cellType);
  }
}

export = Cell;