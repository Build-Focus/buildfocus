import _ = require('lodash');

import Direction = require('city/direction');
import Coord = require('city/coord');
import RoadPart = require('city/roads/road-part');
import RoadPartType = require('city/roads/road-part-type');
import serialization = require('city/serialization/serialization-format');

import RoadEdge = require('city/roads/road-edge');

class SpecificRoadEdge implements RoadEdge {
  constructor (private start: Coord, private end: Coord) {
    if (start.x === end.x && start.y === end.y) throw new Error(`Road edges must have a length, not just cover one cell (here ${start})`);
    if (start.x !== end.x && start.y !== end.y) throw new Error(`Road edges may be straight lines only but coords were ${start}->${end}`);
  }

  private get direction(): Direction {
    if (this.start.x === this.end.x) {
      if (this.start.y < this.end.y) return Direction.South;
      else return Direction.North;
    } else {
      if (this.start.x < this.end.x) return Direction.East;
      else return Direction.West;
    }
  }

  get parts(): RoadPart[] {
    var type: RoadPartType = {
      [Direction.North]: RoadPartType.StraightNorthSouth,
      [Direction.East]:  RoadPartType.StraightEastWest,
      [Direction.South]: RoadPartType.StraightNorthSouth,
      [Direction.West]:  RoadPartType.StraightEastWest
    }[this.direction];

    var startType: RoadPartType = {
      [Direction.North]: RoadPartType.EndFromNorth,
      [Direction.East]:  RoadPartType.EndFromEast,
      [Direction.South]: RoadPartType.EndFromSouth,
      [Direction.West]:  RoadPartType.EndFromWest
    }[this.direction];

    var endType: RoadPartType = {
      [Direction.North]: RoadPartType.EndFromSouth,
      [Direction.East]:  RoadPartType.EndFromWest,
      [Direction.South]: RoadPartType.EndFromNorth,
      [Direction.West]:  RoadPartType.EndFromEast
    }[this.direction];

    var middleParts = this.coords.slice(1, this.coords.length - 1).map((c) => new RoadPart(c, type));
    var start = new RoadPart(_.first(this.coords), startType);
    var end = new RoadPart(_.last(this.coords), endType);
    return [start, ...middleParts, end];
  }

  get coords(): Coord[] {
    if (this.direction === Direction.East) {
      let y = this.start.y;
      return _.range(this.start.x, this.end.x + 1).map((x) => new Coord(x, y));
    } else if (this.direction === Direction.West) {
      let y = this.start.y;
      return _.range(this.start.x, this.end.x - 1, -1).map((x) => new Coord(x, y));
    } else if (this.direction === Direction.South) {
      let x = this.start.x;
      return _.range(this.start.y, this.end.y + 1).map((y) => new Coord(x, y));
    } else {
      let x = this.start.x;
      return _.range(this.start.y, this.end.y - 1, -1).map((y) => new Coord(x, y));
    }
  }

  serialize(): serialization.SpecificRoadData {
    return {
      start: this.start.serialize(),
      end: this.end.serialize()
    }
  }

  static deserialize(data: serialization.SpecificRoadData): SpecificRoadEdge {
    return new SpecificRoadEdge(Coord.deserialize(data.start), Coord.deserialize(data.end));
  }
}

export = SpecificRoadEdge;