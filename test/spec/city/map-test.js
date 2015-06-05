/* global describe, it */

(function () {
  'use strict';

  var ko;

  var Map;
  var NullCell;

  describe('Map', function () {
    before(function (done) {
      require(["knockout", "city/map", "city/null-cell"],
        function (loadedKo, loadedMapClass, loadedNullCellClass) {
          Map = loadedMapClass;
          NullCell = loadedNullCellClass;
          ko = loadedKo;
          done();
        }
      );
    });

    it('should take a set of cells as its initial state', function () {
      var cell = {x: 0, y: 0};
      var map = new Map([cell]);

      expect(map.cells()).to.deep.equal([cell]);
    });

    it("should place the cells according to their coordinates", function () {
      var centralCell = {x: 0, y: 0};
      var eastCell = {x: 1, y: 0};
      var map = new Map([centralCell, eastCell]);

      expect(map.getCell(0, 0)).to.equal(centralCell);
      expect(map.getCell(1, 0)).to.equal(eastCell);
    });

    it("should return NullCells for all empty cells", function () {
      var cell = {x: 0, y: 0};
      var map = new Map([cell]);

      var unspecifiedCell = map.getCell(10, 10);
      expect(unspecifiedCell).to.be.instanceOf(NullCell);
    });

    it("should throw if the cells provided have duplicates", function () {
      var centralCell1 = { x: 0, y: 0 };
      var centralCell2 = { x: 0, y: 0 };

      expect(function () {
        new Map([centralCell1, centralCell2]);
      }).to.throw();
    });
  });
})();