/* global describe, it */

(function () {
  'use strict';

  var ko;

  var _;
  var Map;
  var Cell;
  var NullCell;
  var Coord;

  function buildCell(x, y) {
    return new NullCell(new Coord(x, y));
  }

  function cellFactory(coord) {
    return buildCell(coord.x, coord.y);
  }

  function lexicographicSort(coordA, coordB) {
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
      return new NullCell(coord);
    });
  }

  describe('Map', function () {
    before(function (done) {
      require(["knockout", "lodash", "city/map", "city/cell",
               "city/null-cell", "city/coord"],
        function (loadedKo, loadedLodash, loadedMapClass,
                  loadedCellClass, loadedNullCellClass, loadedCoordClass) {
          Map = loadedMapClass;
          Cell = loadedCellClass;
          NullCell = loadedNullCellClass;
          Coord = loadedCoordClass;

          _ = loadedLodash;
          ko = loadedKo;
          done();
        }
      );
    });

    it('should take a set of cells as its initial state', function () {
      var cell = buildCell(0, 0);
      var map = new Map([cell]);

      expect(map.getCells()).to.deep.equal([cell]);
    });

    it("should place the cells according to their coordinates", function () {
      var centralCell = buildCell(0, 0);
      var eastCell = buildCell(1, 0);
      var map = new Map([centralCell, eastCell]);

      expect(map.getCell(0, 0)).to.equal(centralCell);
      expect(map.getCell(1, 0)).to.equal(eastCell);
    });

    it("should accept negative cell coordinates", function () {
      var centralCell = buildCell(0, 0);
      var northWestCell = buildCell(-1, -1);
      var map = new Map([centralCell, northWestCell]);

      expect(map.getCell(-1, -1)).to.equal(northWestCell);
      expect(map.getCells()).to.deep.equal([centralCell, northWestCell]);
    });

    it("should return NullCells for all empty cells", function () {
      var map = new Map([buildCell(0, 0)]);

      var unspecifiedCell = map.getCell(new Coord(10, 10));
      expect(unspecifiedCell).to.be.instanceOf(NullCell);
    });

    it("should throw if the cells provided have duplicates", function () {
      expect(function () {
        new Map([buildCell(0, 0), buildCell(0, 0)]);
      }).to.throw();
    });

    it("should allow you to add a building", function () {
      var building = { buildingType: null, coords: [c(0, 0)] };
      var map = new Map([buildCell(0, 0)], cellFactory);

      map.construct(building);

      expect(map.getBuildings()).to.deep.equal([building]);
    });

    it("should reject constructions on cells that don't exist", function () {
      var map = new Map([buildCell(0, 0)], cellFactory);

      expect(function () {
        map.construct({buildingType: null, coords: [c(1, 0)]});
      }).to.throw();
    });

    it("should add new cells from the cell factory when a building as added surrounded by space", function () {
      var map = new Map([buildCell(0, 0)], cellFactory);

      map.construct({ buildingType: null, coords: [c(0, 0)] });

      var coords = _.pluck(map.getCells(), 'coord');
      expect(coords.sort(lexicographicSort)).to.deep.equal([
        c(-1, -1), c(0, -1), c(1, -1),
        c(-1, 0),  c(0, 0),  c(1, 0),
        c(-1, 1),  c(0, 1),  c(1, 1)
      ].sort(lexicographicSort));
    });

    it("should add new cells from the cell factory when a building as added at the edge", function () {
      var initialCoords = [c(0, 0), c(1, 0), c(2, 0), c(1, 1)];
      var map = new Map(toCells(initialCoords), cellFactory);

      map.construct({ buildingType: null, coords: [c(1, 1)] });

      var coords = _.pluck(map.getCells(), 'coord');
      expect(coords.sort(lexicographicSort)).to.deep.equal(initialCoords.concat([
        c(0, 1),          c(2, 1),
        c(0, 2), c(1, 2), c(2, 2)
      ]).sort(lexicographicSort));
    });
  });
})();