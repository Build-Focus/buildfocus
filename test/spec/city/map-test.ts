/* global describe, it */

define(["knockout", "lodash", "city/map", "city/cell", "city/coord", "city/building"],
  function (ko, _, Map, Cell, Coord, Building) {
    'use strict';

    function buildCell(x, y) {
      return new Cell(new Coord(x, y), 0);
    }

    function cellData(x, y) {
      return { coord: { x: x, y: y }, cellType: 0 };
    }

    function cellFactory(coord) {
      return buildCell(coord.x, coord.y);
    }

    function lexicographicSort(coordA, coordB) {
      // Handle sorting both coords and cells
      if (coordA.coord && coordB.coord) {
        return lexicographicSort(coordA.coord, coordB.coord);
      }

      if (coordA.x !== coordB.x) {
        return coordA.x > coordB.x ? 1 : -1;
      } else if (coordA.y !== coordB.y) {
        return coordA.y > coordB.y ? 1 : -1;
      } else {
        return 0;
      }
    }

    function c(x, y) {
      return new Coord(x, y);
    }

    function toCells(coordArraysArray) {
      return coordArraysArray.map(function (coord) {
        return new Cell(coord);
      });
    }

    describe('Map', () => {
      it('should default to a single empty cell', () => {
        var map = new Map(cellFactory);

        expect(map.getCells()).to.deep.equal([buildCell(0, 0)]);
      });

      it("should allow you to add a building", () => {
        var building = new Building([c(0, 0)], 0);
        var map = new Map(cellFactory);

        map.construct(building);

        expect(map.getBuildings()).to.deep.equal([building]);
      });

      it("should not allow you to add a building in a non-empty space", () => {
        var building = new Building([c(0, 0)], 0);
        var map = new Map(cellFactory);

        map.construct(building);
        expect(() => map.construct(building)).to.throw();
      });

      it("should let you remove a building", () => {
        var building = new Building([c(0, 0)], 0);
        var map = new Map(cellFactory);

        map.construct(building);
        map.remove(building);

        expect(map.getBuildings()).to.deep.equal([]);
      });

      it("should reject constructions on cells that don't exist", () => {
        var map = new Map(cellFactory);

        expect(() => map.construct({buildingType: null, coords: [c(1, 0)]})).to.throw();
      });

      it("should reject removing buildings that don't exist", () => {
        var building = new Building([c(0, 0)], 0);
        var map = new Map(cellFactory);

        map.construct(building);
        map.remove(building);

        expect(() => map.remove(building)).to.throw();
      });

      it("should allow building remove on equality, not identity", () => {
        var map = new Map(cellFactory);

        map.construct(new Building([c(0, 0)], 0));
        map.remove(new Building([c(0, 0)], 0));

        expect(map.getBuildings()).to.deep.equal([]);
      });

      it("should reject removing buildings that don't quite match", () => {
        var map = new Map(cellFactory);

        map.construct(new Building([c(0, 0)], 0));

        expect(() => map.remove(new Building([c(0, 0)], 1))).to.throw();
      });

      it("should add new cells from the cell factory when a building as added surrounded by space", () => {
        var map = new Map(cellFactory);

        map.construct(new Building([c(0, 0)]));

        var coords = _.pluck(map.getCells(), 'coord');
        expect(coords.sort(lexicographicSort)).to.deep.equal([
          c(-1, -1), c(0, -1), c(1, -1),
          c(-1, 0),  c(0, 0),  c(1, 0),
          c(-1, 1),  c(0, 1),  c(1, 1)
        ].sort(lexicographicSort));
      });

      it("should add new cells from the cell factory when a building as added at the edge", () => {
        var initialCoords = [c(0, 0), c(1, 0), c(2, 0), c(1, 1)];
        var map = Map.deserialize({ cells: toCells(initialCoords), buildings: [] }, cellFactory);

        map.construct(new Building([c(1, 1)]));

        var coords = _.pluck(map.getCells(), 'coord');
        expect(coords.sort(lexicographicSort)).to.deep.equal(initialCoords.concat([
          c(0, 1),          c(2, 1),
          c(0, 2), c(1, 2), c(2, 2)
        ]).sort(lexicographicSort));
      });
      
      it("should serialize all its cells", () => {
        var map = new Map(cellFactory);
        map.construct(new Building([c(0, 0)]));
        
        var serialized = map.serialize();
        
        expect(serialized.cells.sort(lexicographicSort)).to.deep.equal([
          cellData(-1, -1), cellData(0, -1), cellData(1, -1),
          cellData(-1, 0),  cellData(0, 0),  cellData(1, 0),
          cellData(-1, 1),  cellData(0, 1),  cellData(1, 1)
        ].sort(lexicographicSort));
      });

      it("should serialize its buildings", () => {
        var map = new Map(cellFactory);
        var building1 = new Building([c(0, 0)], 0);
        var building2 = new Building([c(0, 1)], 1);

        map.construct(building1);
        map.construct(building2);
        var serialized = map.serialize();

        expect(serialized.buildings).to.deep.equal([
          { coords: [{x: 0, y: 0}], buildingType: 0 },
          { coords: [{x: 0, y: 1}], buildingType: 1 },
        ]);
      });

      it('should deserialize itself from provided data', () => {
        var map = Map.deserialize({ cells: [cellData(0, 0)], buildings: [] }, cellFactory);

        expect(map.getCells()).to.deep.equal([buildCell(0, 0)]);
      });

      it("should be unchanged after serialization and deserialization", () => {
        var map = new Map(cellFactory);
        map.construct(new Building([c(0, 0)], 0));
        map.construct(new Building([c(1, 0)], 1));
        var serialized = map.serialize();

        var newMap = Map.deserialize(serialized, cellFactory);

        expect(newMap.getCells()).to.deep.equal(map.getCells());
        expect(newMap.getBuildings()).to.deep.equal(map.getBuildings());
      });

      it("should throw if the cells provided have duplicates", () => {
        expect(() => {
          Map.deserialize({ cells: [buildCell(0, 0), buildCell(0, 0)], buildings: [] },
                          cellFactory);
        }).to.throw();
      });

      it("should successfully look up buildings by position", () => {
        var map = new Map(cellFactory);
        var building = new Building([c(0, 0)], 0);
        map.construct(building);

        var lookedUpBuilding = map.getBuildingAt(c(0, 0));

        expect(lookedUpBuilding).to.deep.equal(building);
      });

      it("should return undefined when looking up buildings in empty cells", () => {
        var map = new Map(cellFactory);
        var building = new Building([c(0, 0)], 0);
        map.construct(building);

        var lookedUpBuilding = map.getBuildingAt(c(1, 0));

        expect(lookedUpBuilding).to.be.undefined;
      });
    });
  }
);