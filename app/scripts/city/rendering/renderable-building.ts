import _ = require('lodash');
import easeljs = require('createjs');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Renderable = require('city/rendering/renderable');
import renderableConfigLoader = require('city/rendering/config/config-loader');

class RenderableBuilding implements Renderable {
  constructor(private building: Buildings.Building) { }

  get mainCoord(): Coord {
    return _.last(this.building.coords.sort(Coord.diagonalCompare));
  }

  layerIndex = 1;
  zIndex = 2;

  render(): easeljs.DisplayObject {
    var config = renderableConfigLoader.getBuildingConfig(this.building);

    var image = new easeljs.Bitmap(config.imagePath);
    image.x = config.xOffset;
    image.y = config.yOffset;
    return image;
  }

  shouldRender = true;
}

export = RenderableBuilding;