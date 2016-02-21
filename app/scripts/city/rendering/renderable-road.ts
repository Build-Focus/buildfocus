import easeljs = require('createjs');
import Coord = require('city/coord');
import RoadPart = require('city/roads/road-part');
import Renderable = require('city/rendering/renderable');

import renderableConfigLoader = require("city/rendering/config/config-loader")

class RenderableRoad implements Renderable {
  constructor(private road: RoadPart) { }

  get mainCoord(): Coord {
    return this.road.coord;
  }

  layerIndex = 0;
  zIndex = 1;

  render(): easeljs.DisplayObject {
    var imagePath = renderableConfigLoader.getRoadImagePath(this.road);

    if (imagePath) {
      return new easeljs.Bitmap(imagePath);
    } else {
      throw new Error("Failed to render road, unknown road type: " + this.road.type);
    }
  }

  shouldRender = true;
}

export = RenderableRoad;