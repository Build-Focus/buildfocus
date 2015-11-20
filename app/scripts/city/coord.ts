import Direction = require('city/direction');
import serialize = require('city/serialization/serialization-format');

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

  getNeighbour(direction: Direction): Coord {
    switch (direction) {
      case Direction.North:
        return this.north();
      case Direction.East:
        return this.east();
      case Direction.South:
        return this.south();
      case Direction.West:
        return this.west();
      default:
        throw new Error(`Invalid value passed to coord.getNeighbour: ${direction}`);
    }
  }

  getDirectNeighbours() {
    return [
      this.north(),
      this.east(),
      this.south(),
      this.west()
    ];
  }

  isDirectNeighbour(coord: Coord): boolean {
    var xDifference = Math.abs(coord.x - this.x);
    var yDifference = Math.abs(coord.y - this.y);
    return xDifference + yDifference === 1;
  }

  getDirectionToward(coord: Coord): Direction {
    var xDifference = Math.abs(coord.x - this.x);
    var yDifference = Math.abs(coord.y - this.y);

    if (xDifference > yDifference) {
      if (this.x > coord.x) return Direction.West;
      else return Direction.East;
    } else {
      if (this.y > coord.y) return Direction.North;
      else return Direction.South;
    }
  }

  north() {
    return new Coord(this.x, this.y - 1);
  }

  east() {
    return new Coord(this.x + 1, this.y);
  }

  south() {
    return new Coord(this.x, this.y + 1);
  }

  west() {
    return new Coord(this.x - 1, this.y);
  }

  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }

  equals(otherCoord: Coord) {
    return otherCoord != null && this.x === otherCoord.x && this.y === otherCoord.y;
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

  static diagonalCompare(coordA: Coord, coordB: Coord): number {
    var coordATotal = coordA.x + coordA.y;
    var coordBTotal = coordB.x + coordB.y;

    if (coordATotal > coordBTotal) {
      return 1;
    } else if (coordATotal < coordBTotal) {
      return -1;
    } else if (coordA.x > coordB.x) {
      return 1;
    } else if (coordA.x < coordB.x) {
      return -1;
    } else {
      return 0;
    }
  }

  distanceTo(coordB: Coord): number {
    return Math.sqrt(Math.pow(this.x - coordB.x, 2) + Math.pow(this.y - coordB.y, 2));
  }
}

export = Coord;