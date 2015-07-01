/* global describe, it */

(function () {
  'use strict';

  var ko;

  var _;
  var Map;
  var Cell;
  var NullCell;

  function buildCell(x, y) {
    return new NullCell(x, y);
  }

  describe('Map', function () {
    before(function (done) {
      require(["knockout", "lodash", "city/map", "city/cell"],
        function (loadedKo, loadedLodash, loadedMapClass, loadedCellClass) {
          Map = loadedMapClass;
          Cell = loadedCellClass.Cell;
          NullCell = loadedCellClass.NullCell;

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
      var cell = buildCell(0, 0);
      var map = new Map([cell]);

      var unspecifiedCell = map.getCell(10, 10);
      expect(unspecifiedCell).to.be.instanceOf(NullCell);
    });

    it("should throw if the cells provided have duplicates", function () {
      var centralCell1 = buildCell(0, 0);
      var centralCell2 = buildCell(0, 0);

      expect(function () {
        new Map([centralCell1, centralCell2]);
      }).to.throw();
    });

    it("should allow you to add a building", function () {
      var centralCell = buildCell(0, 0);
      var construction = { building: {}, cells: [centralCell] };
      var map = new Map([centralCell], buildCell);

      map.construct(construction);

      expect(map.getConstructions()).to.deep.equal([construction]);
    });

    function asCoords(cells) {
      return _.map(cells, function (cell) {
        return [cell.x, cell.y];
      });
    }

    function toCells(coords) {
      return _.map(coords, function (coord) {
        return buildCell(coord[0], coord[1]);
      });
    }

    it("should reject constructions on cells that don't exist", function () {
      var centralCell = buildCell(0, 0);
      var map = new Map([centralCell], buildCell);

      expect(function () {
        map.construct({building: {}, cells: [buildCell(1, 0)]});
      }).to.throw();
    });

    it("should add new cells from the cell factory when a building as added surrounded by space", function () {
      var centralCell = buildCell(0, 0);
      var map = new Map([centralCell], buildCell);

      map.construct({ building: {}, cells: [centralCell] });

      expect(asCoords(map.getCells()).sort()).to.deep.equal([
        [-1, -1], [0, -1], [1, -1],
        [-1, 0],  [0, 0],  [1, 0],
        [-1, 1],  [0, 1],  [1, 1]
      ].sort());
    });

    it("should add new cells from the cell factory when a building as added at the edge", function () {
      var initialCoords = [[0,0], [1,0], [2,0], [1, 1]];
      var map = new Map(toCells(initialCoords), buildCell);

      map.construct({ building: {}, cells: [buildCell(1, 1)] });

      var coords = _.map(map.getCells(), function (cell) { return [cell.x, cell.y]; }).sort();
      expect(coords).to.deep.equal(initialCoords.concat([
        [0, 1],         [2, 1],
        [0, 2], [1, 2], [2, 2]
      ]).sort());
    });

    it("should have a width matching the longest row of the cells given");

    it("should have a height matching the longest column of the cells given");
  });
})();