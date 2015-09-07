import easeljs = require('createjs');

import City = require('city/city');
import Coord = require('city/coord');

import Renderable = require('city/rendering/renderable');
import RenderableRoad = require('city/rendering/renderable-road');
import RenderableCell = require('city/rendering/renderable-cell');
import RenderableBuilding = require('city/rendering/renderable-building');

const CELL_WIDTH = 600;
const CELL_HEIGHT = 346;

function xOffset(coord: Coord) {
  return coord.x * (CELL_WIDTH / 2) - coord.y * (CELL_WIDTH / 2)
}

function yOffset(coord: Coord) {
  return coord.y * (CELL_HEIGHT / 2) + coord.x * (CELL_HEIGHT / 2)
}

function compareLayerIndexes(a: Renderable, b: Renderable) {
  return a.layerIndex - b.layerIndex;
}

function compareZIndexes(a: Renderable, b: Renderable) {
  return a.zIndex - b.zIndex;
}

class CityRenderer {
  private city: City;

  constructor(city: City) {
    this.city = city;
  }

  render = (): Array<easeljs.DisplayObject> => {
    var renderables = this.getRenderablesFromCity(this.city);
    return renderables.sort((r1, r2) => compareLayerIndexes(r1, r2) ||
                                        Coord.diagonalCompare(r1.mainCoord, r2.mainCoord) ||
                                        compareZIndexes(r1, r2) )
                      .map((renderable) => {
                        var result = renderable.render();
                        result.x += xOffset(renderable.mainCoord);
                        result.y += yOffset(renderable.mainCoord);
                        return result;
                      });
  };

  private getRenderablesFromCity(city: City): Renderable[] {
    var renderableCells: Renderable[] = this.city.getCells().map((cell) => new RenderableCell(cell));
    var renderableRoads: Renderable[] = this.city.getRoads().map((road) => new RenderableRoad(road));
    var renderableBuildings: Renderable[] = this.city.getBuildings().map((building) => new RenderableBuilding(building));

    return renderableCells.concat(renderableRoads).concat(renderableBuildings);
  }
}

export = CityRenderer;