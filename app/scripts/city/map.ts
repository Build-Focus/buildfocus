'use strict';

import ko = require('knockout');
import _ = require('lodash');
import Cell = require('city/cell');
import NullCell = require('city/null-cell');
import Building = require('city/building');

class Map {
  private cellLookup: { [x: number]: { [y:number]: Cell } };
  private buildings: Building[];
  private cellFactory: (x: number, y: number) => Cell;

  constructor(cells: Cell[], cellFactory: (x: number, y: number) => Cell) {
    this.cellFactory = cellFactory;
    this.buildings = [];
    this.cellLookup = {};

    _.forEach(cells, (cell) => {
      if (this.getCellOrUndefined(cell.x, cell.y) !== undefined) {
        throw "Duplicate cell coordinates: " + cell.x + "," + cell.y;
      } else {
        this.setCell(cell);
      }
    });
  }

  private setCell = (cell) => {
    if (!this.cellLookup[cell.x]) {
      this.cellLookup[cell.x] = [];
    }
    this.cellLookup[cell.x][cell.y] = cell;
  };

  private getCellOrUndefined(x, y): Cell {
    var row = this.cellLookup[x] || [];
    return row[y];
  }

  private isCellPresent(x, y): boolean {
    return !!this.getCellOrUndefined(x, y);
  }

  public getCells(): Cell[] {
    var rows = _.values(this.cellLookup);
    return _.flatten(_.map(rows, _.values));
  }

  public getCell(x, y): Cell {
    return this.getCellOrUndefined(x, y) || new NullCell(x, y);
  }

  public construct(building: Building) {
    if (_.any(building.cells, (coord) => !this.isCellPresent(coord.x, coord.y))) {
      throw new Error("Can't build building for cells that don't exist");
    }
    this.buildings.push(building);
    this.expandCellsAroundBuilding(building);
  }

  private expandCellsAroundBuilding(building: Building) {
    // TODO: Refactor out a coord type, move methods to use it, move some of below to coord.getNeighbours
    var allCoordsToExpand = _.reduce(building.cells, (coordsSoFar, buildingCell) => {
      var offsets = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

      var coordsToExpandForCell = offsets.map((offset) => {
        var x = buildingCell.x + offset[0];
        var y = buildingCell.y + offset[1];
        return [x, y];
      }).filter((coord) => {
        var x = coord[0];
        var y = coord[1];

        var alreadyPresent = this.getCellOrUndefined(x, y) !== undefined;
        var alreadyExpanding = !!_.find(coordsSoFar, (cell) => cell.x === x && cell.y === y);

        return  !alreadyPresent && !alreadyExpanding;
      });

      return coordsSoFar.concat(coordsToExpandForCell);
    }, []);

    var newCells = allCoordsToExpand.map((coord) => {
      return this.cellFactory(coord[0], coord[1]);
    });
    newCells.forEach(this.setCell)
  }

  public getBuildings(): Building[] {
    return _.clone(this.buildings);
  }
}

export = Map;