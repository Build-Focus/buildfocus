import _ = require('lodash');
import easeljs = require('createjs');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Renderable = require('city/rendering/renderable');
import getBuildingConfig = require('city/rendering/building-rendering-config');

class RenderableBuilding implements Renderable {
  constructor(private building: Buildings.Building) { }

  get mainCoord(): Coord {
    return _.last(this.building.coords.sort(Coord.diagonalCompare));
  }

  layerIndex = 1;
  zIndex = 2;

  render(): easeljs.DisplayObject {
    var config = getBuildingConfig(this.building);

    if (!config) throw new Error("Failed to render building, no image for type: " + this.building.buildingType +
      "and direction: " + this.building.direction);

    var image = new easeljs.Bitmap(config.imagePath);
    image.x = config.xOffset;
    image.y = config.yOffset;
    return image;
  }

  shouldRender = true;
}

export = RenderableBuilding;