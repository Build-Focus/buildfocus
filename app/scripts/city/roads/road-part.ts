import Coord = require('city/coord');
import Direction = require('city/direction');

import RoadPartType = require('city/roads/road-part-type');

class RoadPart {
  constructor(private _coord: Coord, private _type: RoadPartType) { }

  get coord() {
    return this._coord;
  }

  get type() {
    return this._type;
  }

  combinedWith(road: RoadPart): RoadPart {
    if (!_.isEqual(road.coord, this.coord)) throw new Error("Cannot combine road parts from different coordinates");

    return new RoadPart(this.coord, RoadPartType.combine(this.type, road.type));
  }
}

export = RoadPart;