import Coord = require('city/coord');
import RoadPart = require('city/roads/road-part');
import serialization = require('city/serialization/serialization-format');

interface RoadEdge {
  parts: RoadPart[];
  coords: Coord[];

  serialize(): serialization.RoadData
}

export = RoadEdge;