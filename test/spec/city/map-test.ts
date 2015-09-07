'use strict';

import ko = require("knockout");
import _ = require("lodash");

import Map = require("app/scripts/city/map");

import Cell = require("app/scripts/city/cell");
import CellType = require("app/scripts/city/cell-type");

import RoadEdge = require('app/scripts/city/roads/road-edge');

import Coord = require("app/scripts/city/coord");
import Direction = require("app/scripts/city/direction");
import BasicHouse = require("app/scripts/city/buildings/basic-house");
import serialization = require("app/scripts/city/city-serialization");

function buildCell(x, y) {
  return new Cell(new Coord(x, y), CellType.Grass);
}

function cellData(x, y): serialization.CellData {
  return { coord: { x: x, y: y }, cellType: CellType.Grass };
}

function cellFactory(coord) {
  return buildCell(coord.x, coord.y);
}

function c(x, y) {
  return new Coord(x, y);
}

function toCells(coordArraysArray) {
  return coordArraysArray.map(function (coord) {
    return new Cell(coord, CellType.Grass);
  });
}

function cellSort(a: Cell, b: Cell) {
  return Coord.diagonalCompare(a.coord, b.coord);
}

function build3x3Map(): Map {
  return Map.deserialize({ cells: [
                             buildCell(-1, -1), buildCell(0, -1), buildCell(1, -1),
                             buildCell(-1, 0),  buildCell(0, 0),  buildCell(1, 0),
                             buildCell(-1, 1),  buildCell(0, 1),  buildCell(1, 1),
                           ], buildings: [], roads: [] }, cellFactory);
}

describe('Map', () => {
  it('should default to a single empty cell', () => {
    var map = new Map(cellFactory);

    expect(map.getCells()).to.deep.equal([buildCell(0, 0)]);
  });

  describe("building addition", () => {
    it("should add the building", () => {
      var building = new BasicHouse(c(0, 0), Direction.South);
      var map = new Map(cellFactory);

      map.construct(building);

      expect(map.getBuildings()).to.deep.equal([building]);
    });

    it("should refuse to add a building in a non-empty space", () => {
      var building = new BasicHouse(c(0, 0), Direction.South);
      var map = new Map(cellFactory);

      map.construct(building);
      expect(() => map.construct(building)).to.throw();
    });

    it("should not work if you add a building on a cell that don't exist", () => {
      var map = new Map(cellFactory);

      expect(() => map.construct(new BasicHouse(c(1, 0), Direction.South))).to.throw();
    });

    it("should refuse to add a building that conflicts with a road", () => {
      var map = build3x3Map();

      map.addRoad(new RoadEdge(c(0, 0), c(0, 1)));

      expect(() => map.construct(new BasicHouse(c(0, 0), Direction.South))).to.throw();
    });
  });

  describe("building removal", () => {
    it("should remove the building", () => {
      var building = new BasicHouse(c(0, 0), Direction.South);
      var map = new Map(cellFactory);

      map.construct(building);
      map.remove(building);

      expect(map.getBuildings()).to.deep.equal([]);
    });

    it("should refuse to remove buildings that don't exist", () => {
      var building = new BasicHouse(c(0, 0), Direction.South);
      var map = new Map(cellFactory);

      map.construct(building);
      map.remove(building);

      expect(() => map.remove(building)).to.throw();
    });

    it("should remove buildings based on equality, not identity", () => {
      var map = new Map(cellFactory);

      map.construct(new BasicHouse(c(0, 0), Direction.South));
      map.remove(new BasicHouse(c(0, 0), Direction.South));

      expect(map.getBuildings()).to.deep.equal([]);
    });

    it("should not remove buildings that don't quite match", () => {
      var map = new Map(cellFactory);

      map.construct(new BasicHouse(c(0, 0), Direction.South));

      expect(() => map.remove(new BasicHouse(c(1, 0), Direction.South))).to.throw();
    });
  });

  describe("autoexpansion", () => {
    it("should add new cells from the cell factory when a building is added surrounded by spaces", () => {
      var map = new Map(cellFactory);

      map.construct(new BasicHouse(c(0, 0), Direction.South));

      var coords = _.pluck(map.getCells(), 'coord');
      expect(coords.sort(Coord.diagonalCompare)).to.deep.equal([
        c(-1, -1), c(0, -1), c(1, -1),
        c(-1, 0),  c(0, 0),  c(1, 0),
        c(-1, 1),  c(0, 1),  c(1, 1)
      ].sort(Coord.diagonalCompare));
    });

    it("should add new cells from the cell factory when a building is added at the edge of the map", () => {
      var initialCoords = [c(0, 0), c(1, 0), c(2, 0), c(1, 1)];
      var map = Map.deserialize({ cells: toCells(initialCoords), buildings: [], roads: [] }, cellFactory);

      map.construct(new BasicHouse(c(1, 1), Direction.South));

      var coords = _.pluck(map.getCells(), 'coord');
      expect(coords.sort(Coord.diagonalCompare)).to.deep.equal(initialCoords.concat([
        c(0, 1),          c(2, 1),
        c(0, 2), c(1, 2), c(2, 2)
      ]).sort(Coord.diagonalCompare));
    });
  });

  describe("serialization", () => {
    it("should serialize all cells", () => {
      var map = new Map(cellFactory);
      map.construct(new BasicHouse(c(0, 0), Direction.South));

      var serialized = map.serialize();

      expect(serialized.cells.sort(cellSort)).to.deep.equal([
        cellData(-1, -1), cellData(0, -1), cellData(1, -1),
        cellData(-1, 0),  cellData(0, 0),  cellData(1, 0),
        cellData(-1, 1),  cellData(0, 1),  cellData(1, 1)
      ].sort(cellSort));
    });

    it("should serialize all buildings", () => {
      var map = new Map(cellFactory);
      var building1 = new BasicHouse(c(0, 0), Direction.South);
      var building2 = new BasicHouse(c(0, 1), Direction.South);

      map.construct(building1);
      map.construct(building2);
      var serialized = map.serialize();

      expect(serialized.buildings).to.deep.equal([
        { coords: [{x: 0, y: 0}], buildingType: 0, direction: 2 },
        { coords: [{x: 0, y: 1}], buildingType: 0, direction: 2 },
      ]);
    });

    it("should serialize all roads", () => {
      var map = build3x3Map();

      map.addRoad(new RoadEdge(c(0, 0), c(1, 0)));
      map.addRoad(new RoadEdge(c(0, 1), c(1, 1)));
      var serialized = map.serialize();

      expect(serialized.roads).to.deep.equal([
        { start: {x: 0, y: 0}, end: {x: 1, y: 0} },
        { start: {x: 0, y: 1}, end: {x: 1, y: 1} }
      ]);
    });

    it('should deserialize successfully from map data', () => {
      var map = Map.deserialize({ cells: [cellData(0, 0)], buildings: [], roads: [] }, cellFactory);

      expect(map.getCells()).to.deep.equal([buildCell(0, 0)]);
    });

    it("should leave the map unchanged after serialization and deserialization", () => {
      var map = new Map(cellFactory);
      map.construct(new BasicHouse(c(0, 0), Direction.South));
      map.construct(new BasicHouse(c(1, 0), Direction.South));
      map.addRoad(new RoadEdge(c(0, 1), c(1, 1)));
      var serialized = map.serialize();

      var newMap = Map.deserialize(serialized, cellFactory);

      expect(newMap.getCells()).to.deep.equal(map.getCells());
      expect(newMap.getBuildings()).to.deep.equal(map.getBuildings());
      expect(newMap.getRoads()).to.deep.equal(map.getRoads());
    });

    it("should throw if the cells in the data to deserialize have duplicates", () => {
      expect(() => {
        Map.deserialize({ cells: [buildCell(0, 0), buildCell(0, 0)], buildings: [], roads: [] },
                        cellFactory);
      }).to.throw();
    });
  });

  describe("building lookup", () => {
    it("should successfully find buildings by position", () => {
      var map = new Map(cellFactory);
      var building = new BasicHouse(c(0, 0), Direction.South);
      map.construct(building);

      var lookedUpBuilding = map.getBuildingAt(c(0, 0));

      expect(lookedUpBuilding).to.deep.equal(building);
    });

    it("should return undefined when looking up buildings in empty cells", () => {
      var map = new Map(cellFactory);
      var building = new BasicHouse(c(0, 0), Direction.South);
      map.construct(building);

      var lookedUpBuilding = map.getBuildingAt(c(1, 0));

      expect(lookedUpBuilding).to.be.undefined;
    });
  });

  describe("road addition", () => {
    it("should add a road", () => {
      var map = build3x3Map();

      var road = new RoadEdge(c(0, 0), c(0, 1));
      map.addRoad(road);

      expect(map.getRoads()).to.deep.equal([road]);
    });

    it("should refuse to add a road that conflicts with a building", () => {
      var map = build3x3Map();

      map.construct(new BasicHouse(c(0, 0), Direction.South));
      var road = new RoadEdge(c(0, 0), c(0, 1));

      expect(() => map.addRoad(road)).to.throw();
    });

    it("should refuse to add a road covering cells that don't exist", () => {
      var map = build3x3Map();

      var road = new RoadEdge(c(0, 0), c(0, 10));

      expect(() => map.addRoad(road)).to.throw();
    });
  });
});