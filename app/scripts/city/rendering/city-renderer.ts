import easeljs = require('createjs');
import ko = require('knockout');

import City = require('city/city');

import Cell = require('city/cell');
import CellType = require('city/cell-type');

import Buildings = require('city/buildings/buildings');
import BuildingType = require('city/buildings/building-type');

import buildingRenderConfig = require('city/rendering/building-rendering-config');

const CELL_WIDTH = 600;
const CELL_HEIGHT = 345;

function compareCellCoords(cellA, cellB) {
  return compareCoords(cellA.coord, cellB.coord);
}

function compareBuildingCoords(buildingA, buildingB) {
  return compareCoords(buildingA.coords[0], buildingB.coords[0]);
}

function compareCoords(coordA, coordB) {
  var coordATotal = coordA.x + coordA.y;
  var coordBTotal = coordB.x + coordB.y;

  if (coordATotal > coordBTotal) {
    return 1;
  } else if (coordATotal < coordBTotal) {
    return -1;
  } else if (coordA.x > coordB.x) {
    return 1;
  } else if (coordA.x < coordB.x) {
    return -1;
  } else {
    return 0;
  }
}

class CityRenderer {
  private city: City;

  constructor(city: City) {
    this.city = city;
  }

  render = (): Array<easeljs.DisplayObject> => {
    var cellRenderings = this.city.getCells()
                                  .sort(compareCellCoords)
                                  .map((cell) => this.renderCell(cell));
    var buildingRenderings = this.city.getBuildings()
                                      .sort(compareBuildingCoords)
                                      .map((building) => this.renderBuilding(building));

    return cellRenderings.concat(buildingRenderings);
  };

  private renderBuilding(building: Buildings.Building): easeljs.DisplayObject {
    var buildingImage = this.getBuildingImage(building);

    // TODO: Consider all coords, not just 0th (here and when sorting)
    var buildingCoord = building.coords[0];
    buildingImage.x += buildingCoord.x * (CELL_WIDTH / 2) - buildingCoord.y * (CELL_WIDTH / 2);
    buildingImage.y += buildingCoord.x * (CELL_HEIGHT / 2) + buildingCoord.y * (CELL_HEIGHT / 2);

    return buildingImage;
  }

  private getBuildingImage(building: Buildings.Building): easeljs.Bitmap {
    var config = buildingRenderConfig[building.buildingType];
    if (!config) throw new Error("Failed to render building, unknown type: " + building.buildingType);

    var image = new easeljs.Bitmap(config.imagePath);
    image.x = config.xOffset;
    image.y = config.yOffset;
    return image;
  }

  private renderCell(cell: Cell): easeljs.DisplayObject {
    var cellImage = this.getCellImage(cell);
    cellImage.x = cell.coord.x * (CELL_WIDTH / 2) - cell.coord.y * (CELL_WIDTH / 2);
    cellImage.y = cell.coord.x * (CELL_HEIGHT / 2) + cell.coord.y * (CELL_HEIGHT / 2);
    return cellImage;
  }

  private getCellImage(cell: Cell): easeljs.Bitmap {
    switch (cell.cellType) {
      case CellType.Grass:
        return new easeljs.Bitmap("/images/city/grass/grass.png");
      default:
        throw new Error("Failed to render cell, unknown cell type: " + cell.cellType);
    }
  }
}

export = CityRenderer;