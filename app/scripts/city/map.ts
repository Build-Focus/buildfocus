'use strict';

import ko = require('knockout');
import _ = require('lodash');

import Coord = require('city/coord');
import Cell = require('city/cell');
import CellType = require('city/cell-type');
import NullCell = require('city/null-cell');
import Building = require('city/building');

import serialization = require('city/city-serialization');

interface CellFactory {
  (coord): Cell;
}

class Map {
  private cellLookup: { [x: number]: { [y:number]: Cell } };
  private buildings: Building[];

  constructor(private cellFactory: (Coord) => Cell) {
    this.loadData([cellFactory(new Coord(0, 0))], []);
  }

  private loadData(cells: Cell[], buildings: Building[]) {
    this.buildings = [];
    this.cellLookup = {};

    _.forEach(cells, (cell) => {
      if (this.getCell(cell.coord) !== undefined) {
        throw "Duplicate cell coordinates: " + cell.coord;
      } else {
        this.setCell(cell);
      }
    });

    _.forEach(buildings, this.construct.bind(this));
  }

  private setCell = (cell) => {
    if (!this.cellLookup[cell.coord.x]) {
      this.cellLookup[cell.coord.x] = [];
    }
    this.cellLookup[cell.coord.x][cell.coord.y] = cell;
  };

  private getCell(coord: Coord): Cell {
    var row = this.cellLookup[coord.x] || [];
    return row[coord.y];
  }

  private isCellPresent(coord: Coord): boolean {
    return !!this.getCell(coord);
  }

  getCells(): Cell[] {
    var rows = _.values(this.cellLookup);
    return _.flatten(_.map(rows, (row) => _.values<Cell>(row)));
  }

  construct(building: Building) {
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
        var alreadyPresent = this.getCell(coord) !== undefined;
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

  getBuildings(): Building[] {
    return _.clone(this.buildings);
  }

  serialize(): serialization.MapData {
    return {
      cells: this.getCells().map((cell) => cell.serialize()),
      buildings: this.getBuildings().map((building) => building.serialize())
    };
  }

  static deserialize(data: serialization.MapData, cellFactory: CellFactory): Map {
    var cells = data.cells.map(Cell.deserialize);
    var buildings = data.buildings.map(Building.deserialize);

    var map = new Map(cellFactory);
    map.loadData(cells, buildings);
    return map;
  }
}

export = Map;