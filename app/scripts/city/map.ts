'use strict';

import ko = require('knockout');
import _ = require('lodash');

import Direction = require('city/direction');
import Coord = require('city/coord');
import Cell = require('city/cell');

import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;

import RoadEdge = require('city/roads/road-edge');
import EndlessRoadEdge = require('city/roads/endless-road-edge');
import SpecificRoadEdge = require('city/roads/specific-road-edge');

import serialization = require('city/serialization/serialization-format');

interface CellFactory {
  (coord): Cell;
}

class Map {
  // TODO: String format for lookups is a bit hacky; make this a proper map
  private cellLookup: { [coord: string]: Cell };
  private buildings: Building[];
  private roads: RoadEdge[];

  constructor(private cellFactory: (Coord) => Cell) {
    this.loadInitialData();

    ko.track(this);
  }

  private loadInitialData() {
    var initialCoords = _.flatten(_.range(-1, 2).map((x) => _.range(-1, 2).map((y) => new Coord(x, y))));
    var initialCells = initialCoords.map(this.cellFactory);

    var initialRoads = [new EndlessRoadEdge(new Coord(0, 0), Direction.North, this)];
    var initialBuildings = [];

    this.loadData(initialCells, initialBuildings, initialRoads);
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
      return _.containsEqual(building.coords, coord);
    });
  }

  getRoadAt(coord: Coord): RoadEdge {
    return _.find(this.roads, (road) => {
      return _.containsEqual(road.coords, coord);
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
    building.coords.forEach((coord) => this.expandCellsAroundCoord(coord));
  }

  remove(buildingToDelete: Building) {
    var savedBuilding = _(this.getBuildings()).find(function (building) {
      return _.isEqual(building, buildingToDelete);
    });

    if (!savedBuilding) throw new Error("Attempted to delete building that is not present: " +
                                        JSON.stringify(buildingToDelete));

    this.buildings.remove(savedBuilding);
  }

  private expandCellsAroundCoord(coord: Coord) {
    var neighbouringCoords = coord.getNeighbours();

    var coordsToExpand = neighbouringCoords.filter((coord) => {
      return this.getCell(coord) === undefined;
    });

    var newCells = coordsToExpand.map(this.cellFactory);
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

    if (!(road instanceof EndlessRoadEdge)) {
      road.coords.forEach((coord) => this.expandCellsAroundCoord(coord));
    }
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
    var map = new Map(cellFactory);

    var cells = data.cells.map(Cell.deserialize);
    var buildings = data.buildings.map(Buildings.deserialize);
    var roads = data.roads.map((roadData) => {
      // TODO: Use TS1.6 'is' functions to clear this up?
      if (!(<any>roadData).end) {
        return EndlessRoadEdge.deserialize(<serialization.EndlessRoadData> roadData, map);
      } else {
        return SpecificRoadEdge.deserialize(<serialization.SpecificRoadData> roadData);
      }
    });

    map.loadData(cells, buildings, roads);
    return map;
  }
}

export = Map;