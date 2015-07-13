'use strict';

import ko = require('knockout');
import _ = require('lodash');

import Coord = require('city/coord');
import Cell = require('city/cell');
import NullCell = require('city/null-cell');
import Building = require('city/building');

class Map {
  private cellLookup: { [x: number]: { [y:number]: Cell } };
  private buildings: Building[];
  private cellFactory: (coord: Coord) => Cell;

  constructor(cells: Cell[], cellFactory: (coord: Coord) => Cell) {
    this.cellFactory = cellFactory;
    this.buildings = [];
    this.cellLookup = {};

    _.forEach(cells, (cell) => {
      if (this.getCellOrUndefined(cell.coord) !== undefined) {
        throw "Duplicate cell coordinates: " + cell.coord;
      } else {
        this.setCell(cell);
      }
    });
  }

  private setCell = (cell) => {
    if (!this.cellLookup[cell.coord.x]) {
      this.cellLookup[cell.coord.x] = [];
    }
    this.cellLookup[cell.coord.x][cell.coord.y] = cell;
  };

  private getCellOrUndefined(coord: Coord): Cell {
    var row = this.cellLookup[coord.x] || [];
    return row[coord.y];
  }

  private isCellPresent(coord: Coord): boolean {
    return !!this.getCellOrUndefined(coord);
  }

  public getCells(): Cell[] {
    var rows = _.values(this.cellLookup);
    return _.flatten(_.map(rows, _.values));
  }

  public getCell(x: number, y: number): Cell;
  public getCell(coord: Coord): Cell;
  public getCell(coordOrX: Coord|number, y?: number): Cell {
    if (coordOrX instanceof Coord) {
      var coord: Coord = coordOrX;
      return this.getCellOrUndefined(coord) || new NullCell(coord);
    } else {
      var x = <number> coordOrX;
      return this.getCell(new Coord(x, y));
    }
  }

  public construct(building: Building) {
    if (_.any(building.coords, (coord) => !this.isCellPresent(coord))) {
      throw new Error("Can't build building on cells that don't exist yet");
    }
    this.buildings.push(building);
    this.expandCellsAroundBuilding(building);
  }

  private expandCellsAroundBuilding(building: Building) {
    var allCoordsToExpand = _.reduce(building.coords, (coordsSoFar, buildingCoord) => {
      var neighbouringCoords = buildingCoord.getNeighbours();
      var nextCoordsToExpand = neighbouringCoords.filter((coord) => {
        var alreadyPresent = this.getCellOrUndefined(coord) !== undefined;
        var alreadyExpanding = !!_.find(coordsSoFar, (previousCoord) => {
          return previousCoord.x === coord.x && previousCoord.y === coord.y;
        });

        return !alreadyPresent && !alreadyExpanding;
      });

      return coordsSoFar.concat(nextCoordsToExpand);
    }, []);

    var newCells = allCoordsToExpand.map(this.cellFactory);
    newCells.forEach(this.setCell)
  }

  public getBuildings(): Building[] {
    return _.clone(this.buildings);
  }
}

export = Map;