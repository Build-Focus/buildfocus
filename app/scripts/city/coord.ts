import serialize = require('city/city-serialization');

const NEIGHBOUR_OFFSETS = [
  [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]
];

class Coord {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getNeighbours() {
    return NEIGHBOUR_OFFSETS.map((offset) => {
      var x = this.x + offset[0];
      var y = this.y + offset[1];
      return new Coord(x, y);
    });
  }

  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }

  serialize(): serialize.CoordData {
    return {
      x: this.x,
      y: this.y
    };
  }

  static deserialize(data: serialize.CoordData): Coord {
    return new Coord(data.x, data.y);
  }
}

export = Coord;