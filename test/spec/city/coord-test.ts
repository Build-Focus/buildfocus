'use strict';

import _ = require("lodash");
import Coord = require("app/scripts/city/coord");
import Direction = require("app/scripts/city/direction");

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

  it('should let you get its direct neighbours', () => {
    var coord = new Coord(0, 0);

    expect(coord.getDirectNeighbours().sort(lexicographicSort)).to.deep.equal([
                        new Coord(0, -1),
      new Coord(-1, 0),                   new Coord(1, 0),
                        new Coord(0, 1)
    ].sort(lexicographicSort));
  });

  it('should let you get its direct neighbours individually', () => {
    var coord = new Coord(0, 0);

    expect(coord.north()).to.deep.equal(new Coord(0, -1));
    expect(coord.east()).to.deep.equal(new Coord(1, 0));
    expect(coord.south()).to.deep.equal(new Coord(0, 1));
    expect(coord.west()).to.deep.equal(new Coord(-1, 0));
  });

  it('should let you get a neighbour by passed direction', () => {
    var coord = new Coord(-10, 20);

    expect(coord.getNeighbour(Direction.North)).to.deep.equal(coord.north());
    expect(coord.getNeighbour(Direction.East)).to.deep.equal(coord.east());
    expect(coord.getNeighbour(Direction.South)).to.deep.equal(coord.south());
    expect(coord.getNeighbour(Direction.West)).to.deep.equal(coord.west());
  });

  it('should tell you if another coord is a neighbour', () => {
    var coord = new Coord(0, 0);

    expect(coord.isDirectNeighbour(new Coord(1, 0))).to.be.true;
    expect(coord.isDirectNeighbour(new Coord(0, 1))).to.be.true;
    expect(coord.isDirectNeighbour(new Coord(-1, 0))).to.be.true;
    expect(coord.isDirectNeighbour(new Coord(0, -1))).to.be.true;
  });

  it('should tell you if another coord is not a neighbour', () => {
    var coord = new Coord(0, 0);

    expect(coord.isDirectNeighbour(new Coord(2, 0))).to.be.false;
    expect(coord.isDirectNeighbour(new Coord(0, -2))).to.be.false;
    expect(coord.isDirectNeighbour(new Coord(1, 1))).to.be.false;
    expect(coord.isDirectNeighbour(new Coord(0, 0))).to.be.false;
  });

  it('can give you direction towards another cell', () => {
    var coord = new Coord(0, 0);

    expect(coord.getDirectionToward(new Coord(0, -1))).to.equal(Direction.North);
    expect(coord.getDirectionToward(new Coord(1, 0))).to.equal(Direction.East);
    expect(coord.getDirectionToward(new Coord(0, 1))).to.equal(Direction.South);
    expect(coord.getDirectionToward(new Coord(-1, 0))).to.equal(Direction.West);
  });

  describe("diagonal comparison", () => {
    it('should consider coords in the previous diagonal row to be lesser', () => {
      expect(Coord.diagonalCompare(new Coord(2, 2), new Coord(3, 3))).to.equal(-1);
    });

    it('should consider coords in the next diagonal row to be greater', () => {
      expect(Coord.diagonalCompare(new Coord(3, 3), new Coord(2, 2))).to.equal(1);
    });

    it('should consider coords earlier in the current diagonal row to be lesser', () => {
      expect(Coord.diagonalCompare(new Coord(3, 3), new Coord(2, 4))).to.equal(1);
    });

    it('should consider coords later in the current diagonal row to be greater', () => {
      expect(Coord.diagonalCompare(new Coord(3, 3), new Coord(4, 2))).to.equal(-1);
    });

    it('should consider the same coord to be equal', () => {
      expect(Coord.diagonalCompare(new Coord(3, 3), new Coord(3, 3))).to.equal(0);
    });
  });

  describe("distance measurement", () => {
    it('should return the simple length for a straight line between coords', () => {
      var coordA = new Coord(0, 0);
      var coordB = new Coord(0, 10);

      expect(coordA.distanceTo(coordB)).to.equal(10);
    });

    it('should return the straight line distance between two given coords', () => {
      var coordA = new Coord(0, 0);
      var coordB = new Coord(3, 4);

      expect(coordA.distanceTo(coordB)).to.equal(5);
    });

    it('should return the straight line distance between two given coords backwards', () => {
      var coordA = new Coord(3, 4);
      var coordB = new Coord(0, 0);

      expect(coordA.distanceTo(coordB)).to.equal(5);
    });
  });

  describe("equality", () => {
    it("should match values with the same x and y", () => {
      expect(new Coord(5, 10).equals(new Coord(5, 10))).to.equal(true);
    });

    it("should not match values with differing y's", () => {
      expect(new Coord(5, 10).equals(new Coord(5, 11))).to.equal(false);
    });

    it("should not match values with differing x's", () => {
      expect(new Coord(5, 10).equals(new Coord(4, 0))).to.equal(false);
    });

    it("should not match objects without an x", () => {
      expect(new Coord(5, 10).equals(<any>{ y: 10 })).to.equal(false);
    });

    it("should not match objects without a y", () => {
      expect(new Coord(5, 10).equals(<any>{ x: 5 })).to.equal(false);
    });

    it("should not match null", () => {
      expect(new Coord(5, 10).equals(null)).to.equal(false);
    });

    it("should not match undefined", () => {
      expect(new Coord(5, 10).equals(undefined)).to.equal(false);
    });
  })
});