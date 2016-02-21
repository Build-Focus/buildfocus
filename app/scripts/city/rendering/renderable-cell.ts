import easeljs = require('createjs');
import Coord = require('city/coord');
import CellType = require('city/cell-type');
import Cell = require('city/cell');
import Renderable = require('city/rendering/renderable');

import CellShade = require('city/rendering/config/cell-shade');
import renderableConfigLoader = require('city/rendering/config/config-loader');

function positiveModulus(x, n) {
  return ((x % n) + n) % n;
}

class RenderableCell implements Renderable {
  constructor(private cell: Cell) { }

  get mainCoord(): Coord {
    return this.cell.coord;
  }

  layerIndex = 0;
  zIndex = 0;

  render(): easeljs.DisplayObject {
    var shade: CellShade = positiveModulus((1061 * this.cell.coord.x + 859 * this.cell.coord.y + 733) ^ 6991, 3);
    return new easeljs.Bitmap(renderableConfigLoader.getCellImagePath(this.cell, shade));
  }

  shouldRender = true;
}

export = RenderableCell;