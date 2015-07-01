'use strict';

import ko = require('knockout');
import _ = require('lodash');
import cell = require('city/cell');
import Construction = require('city/construction');

class Map {
  private cellLookup: { [x: number]: { [y:number]: cell.Cell } };
  private constructions: Construction[];
  private cellFactory: (x: number, y: number) => cell.Cell;

  constructor(cells: cell.Cell[], cellFactory: (x: number, y: number) => cell.Cell) {
    this.cellFactory = cellFactory;
    this.constructions = [];
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

  private getCellOrUndefined(x, y): cell.Cell {
    var row = this.cellLookup[x] || [];
    return row[y];
  }

  private isCellPresent(x, y): boolean {
    return !!this.getCellOrUndefined(x, y);
  }

  public getCells(): cell.Cell[] {
    var rows = _.values(this.cellLookup);
    return _.flatten(_.map(rows, _.values));
  }

  public getCell(x, y): cell.Cell {
    return this.getCellOrUndefined(x, y) || new cell.NullCell(x, y);
  }

  public construct(construction: Construction) {
    if (_.any(construction.cells, (coord) => !this.isCellPresent(coord.x, coord.y))) {
      throw new Error("Can't build construction for cells that don't exist");
    }
    this.constructions.push(construction);
    this.expandCellsAroundConstruction(construction);
  }

  private expandCellsAroundConstruction(construction: Construction) {
    // TODO: Refactor out a coord type, move methods to use it, move some of below to coord.getNeighbours
    var allCoordsToExpand = _.reduce(construction.cells, (coordsSoFar, constructionCell) => {
      var offsets = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

      var coordsToExpandForCell = offsets.map((offset) => {
        var x = constructionCell.x + offset[0];
        var y = constructionCell.y + offset[1];
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

  public getConstructions(): Construction[] {
    return _.clone(this.constructions);
  }
}

export = Map;