import easeljs = require('createjs');
import Coord = require('city/coord');
import RoadPart = require('city/roads/road-part');
import RoadPartType = require('city/roads/road-part-type');
import Renderable = require('city/rendering/renderable');
import getBuildingConfig = require('city/rendering/building-rendering-config');

class RenderableRoad implements Renderable {
  constructor(private road: RoadPart) { }

  get mainCoord(): Coord {
    return this.road.coord;
  }

  layerIndex = 0;
  zIndex = 1;

  render(): easeljs.DisplayObject {
    switch (this.road.type) {
      case RoadPartType.StraightEastWest:
        return new easeljs.Bitmap("/images/city/road/east-west.png");
      case RoadPartType.StraightNorthSouth:
        return new easeljs.Bitmap("/images/city/road/north-south.png");
      default:
        throw new Error("Failed to render road, unknown road type: " + this.road.type);
    }
  }
}

export = RenderableRoad;