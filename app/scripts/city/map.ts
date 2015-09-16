'use strict';

import ko = require('knockout');
import _ = require('lodash');

import Coord = require('city/coord');
import Cell = require('city/cell');

import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;

import RoadEdge = require('city/roads/road-edge');

import serialization = require('city/city-serialization');

interface CellFactory {
  (coord): Cell;
}

class Map {
  // TODO: String format for lookups is a bit hacky; make this a proper map
  private cellLookup: { [coord: string]: Cell };
  private buildings: Building[];
  private roads: RoadEdge[];

  constructor(private cellFactory: (Coord) => Cell) {
    this.loadData([cellFactory(new Coord(0, 0))], [], []);

    ko.track(this);
  }

  private loadData(cells: Cell[], buildings: Building[], roads: RoadEdge[]) {
    this.buildings = [];
    this.roads = [];
    this.cellLookup = {};

    _.forEach(cells, (cell) => {
      if (this.getCell(cell.coord) !== undefined) {
        throw "Duplicate cell coordinates: " + cell.coord;
      } else {
        this.setCell(cell);
      }
    });

    _.forEach(buildings, this.construct.bind(this));
    _.forEach(roads, this.addRoad.bind(this));
  }

  private setCell = (cell) => {
    this.cellLookup[cell.coord.toString()] = cell;
    ko.valueHasMutated(this, 'cellLookup');
  };

  private getCell(coord: Coord): Cell {
    return this.cellLookup[coord.toString()];
  }

  private isCellPresent(coord: Coord): boolean {
    return !!this.getCell(coord);
  }

  getCells(): Cell[] {
    return _.values<Cell>(this.cellLookup);
  }

  // TODO: This and getRoadAt should probably use some kind of index
  getBuildingAt(coord: Coord): Building {
    return _.find(this.buildings, (building) => {
      return !!_.findWhere(building.coords, coord);
    });
  }

  getRoadAt(coord: Coord): RoadEdge {
    return _.find(this.roads, (road) => {
      return !!_.findWhere(road.coords, coord);
    });
  }

  construct(building: Building) {
    if (_.any(building.coords, (coord) => !this.isCellPresent(coord))) {
      throw new Error("Can't build building on cells that don't exist yet");
    }
    if (_.any(building.coords, (coord) => !!this.getBuildingAt(coord) || !!this.getRoadAt(coord))) {
      throw new Error("Can't build buildings on a non-empty cell");
    }

    this.buildings.push(building);
    this.expandCellsAroundBuilding(building);
  }

  remove(buildingToDelete: Building) {
    var savedBuilding = _(this.getBuildings()).find(function (building) {
      return _.isEqual(building, buildingToDelete);
    });

    if (!savedBuilding) throw new Error("Attempted to delete building that is not present: " +
                                        JSON.stringify(buildingToDelete));

    this.buildings.remove(savedBuilding);
  }

  private expandCellsAroundBuilding(building: Building) {
    var allCoordsToExpand = _.reduce(building.coords, (coordsSoFar, buildingCoord) => {
      var neighbouringCoords = buildingCoord.getNeighbours();
      var nextCoordsToExpand = neighbouringCoords.filter((coord) => {
        var alreadyPresent = this.getCell(coord) !== undefined;
        var alreadyExpanding = !!_.findWhere(coordsSoFar, coord);

        return !alreadyPresent && !alreadyExpanding;
      });

      return coordsSoFar.concat(nextCoordsToExpand);
    }, []);

    var newCells = allCoordsToExpand.map(this.cellFactory);
    newCells.forEach(this.setCell);
  }

  addRoad(road: RoadEdge) {
    for (let coord of road.coords) {
      if (this.getBuildingAt(coord)) {
        throw new Error(`Can't build road, as it conflicts with an existing building at ${coord}`);
      }
      if (!this.isCellPresent(coord)) {
        throw new Error(`Can't build road, as it covers a cell that doesn't exist at ${coord}`);
      }
    }

    this.roads.push(road);
  }

  // TODO: Make this (and getRoads) return an immutable view instead
  getBuildings(): Building[] {
    return _.clone(this.buildings);
  }

  getRoads(): RoadEdge[] {
    return _.clone(this.roads);
  }

  serialize(): serialization.MapData {
    return {
      cells: this.getCells().map((cell) => cell.serialize()),
      buildings: this.getBuildings().map((building) => building.serialize()),
      roads: this.getRoads().map((road) => road.serialize())
    };
  }

  static deserialize(data: serialization.MapData, cellFactory: CellFactory): Map {
    var cells = data.cells.map(Cell.deserialize);
    var buildings = data.buildings.map(Buildings.deserialize);
    var roads = data.roads.map(RoadEdge.deserialize)

    var map = new Map(cellFactory);
    map.loadData(cells, buildings, roads);
    return map;
  }
}

export = Map;