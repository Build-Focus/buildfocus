'use strict';

define(["lodash", "city/coord"], function (_, Coord) {
  function lexicographicSort(coordA, coordB) {
    if (coordA.x !== coordB.x) {
      return coordA.x > coordB.x ? 1 : -1;
    } else if (coordA.y !== coordB.y) {
      return coordA.y > coordB.y ? 1 : -1;
    } else {
      return 0;
    }
  }

  describe('Coord', () => {
    it('should save a given x and y', () => {
      var coord = new Coord(10, 20);

      expect(coord.x).to.equal(10);
      expect(coord.y).to.equal(20);
    });

    it('should print itself clearly', () => {
      var coord = new Coord(1, -3);

      expect(coord.toString()).to.equal("(1, -3)");
    });

    it('should know its neighbouring coordinates', () => {
      var coord = new Coord(10, 10);

      expect(coord.getNeighbours().sort(lexicographicSort)).to.deep.equal([
        new Coord(9, 9),  new Coord(10, 9),  new Coord(11, 9),
        new Coord(9, 10),                    new Coord(11, 10),
        new Coord(9, 11), new Coord(10, 11), new Coord(11, 11)
      ].sort(lexicographicSort));
    });

    it('should get negative coord neighbours correctly too', () => {
      var coord = new Coord(0, 0);

      expect(coord.getNeighbours().sort(lexicographicSort)).to.deep.equal([
        new Coord(-1, -1), new Coord(0, -1), new Coord(1, -1),
        new Coord(-1, 0),                    new Coord(1, 0),
        new Coord(-1, 1),  new Coord(0, 1),  new Coord(1, 1)
      ].sort(lexicographicSort));
    });
  });
});