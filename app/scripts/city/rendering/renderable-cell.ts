import easeljs = require('createjs');
import Coord = require('city/coord');
import CellType = require('city/cell-type');
import Cell = require('city/cell');
import Renderable = require('city/rendering/renderable');
import getBuildingConfig = require('city/rendering/building-rendering-config');

const CELL_SHADES = ["light", "normal", "dark"];

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
    var shadeIndex = positiveModulus((1061 * this.cell.coord.x + 859 * this.cell.coord.y + 733) ^ 6991, 3);
    var shade = CELL_SHADES[shadeIndex];

    switch (this.cell.cellType) {
      case CellType.Grass:
        return new easeljs.Bitmap("/images/city/grass/grass-" + shade + ".png");
      default:
        throw new Error("Failed to render cell, unknown cell type: " + this.cell.cellType);
    }
  }
}

export = RenderableCell;