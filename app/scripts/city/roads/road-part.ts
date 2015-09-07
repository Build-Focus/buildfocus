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
}

export = RoadPart;