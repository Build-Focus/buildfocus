import Coord = require('city/coord');

export interface CostedCoord {
  coord: Coord;
  cost: number;
}

export interface CostedRoute extends Array<Coord> {
  cost: number;
}
