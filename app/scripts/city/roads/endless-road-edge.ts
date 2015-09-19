import _ = require('lodash');

import Map = require('city/map');
import Direction = require('city/direction');
import Coord = require('city/coord');
import RoadPart = require('city/roads/road-part');
import RoadPartType = require('city/roads/road-part-type');
import serialization = require('city/city-serialization');

import RoadEdge = require('city/roads/road-edge');

class EndlessRoadEdge implements RoadEdge {
  constructor (private start: Coord, private _direction: Direction, private map: Map) { }

  private get direction(): Direction {
    return this._direction;
  }

  get coords(): Coord[] {
    // This is obviously very inefficient (checking every cell of the map). Could cache things or
    // do this search better, but for now I'm ignoring it.
    if (this.direction === Direction.East || this.direction === Direction.West) {
      return this.map.getCells().map((cell) => cell.coord).filter((coord) => coord.y === this.start.y);
    } else {
      return this.map.getCells().map((cell) => cell.coord).filter((coord) => coord.x === this.start.x);
    }
  }

  get parts(): RoadPart[] {
    if (this.direction === Direction.East || this.direction === Direction.West) {
      return this.coords.map((coord) => new RoadPart(coord, RoadPartType.StraightEastWest));
    } else {
      return this.coords.map((coord) => new RoadPart(coord, RoadPartType.StraightNorthSouth));
    }
  }

  serialize(): serialization.EndlessRoadData {
    return {
      start: this.start.serialize(),
      direction: this._direction
    }
  }

  static deserialize(data: serialization.EndlessRoadData, map: Map): EndlessRoadEdge {
    return new EndlessRoadEdge(Coord.deserialize(data.start), data.direction, map);
  }
}

export = EndlessRoadEdge;