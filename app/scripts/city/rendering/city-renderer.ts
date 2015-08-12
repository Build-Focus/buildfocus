import easeljs = require('createjs');
import ko = require('knockout');

import City = require('city/city');
import Coord = require('city/coord');

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
  var maxBuildingACoord = _.last(buildingA.coords.sort(compareCoords));
  var maxBuildingBCoord = _.last(buildingB.coords.sort(compareCoords));
  return compareCoords(maxBuildingACoord, maxBuildingBCoord);
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

function xOffset(coord: Coord) {
  return coord.x * (CELL_WIDTH / 2) - coord.y * (CELL_WIDTH / 2)
}

function yOffset(coord: Coord) {
  return coord.y * (CELL_HEIGHT / 2) + coord.x * (CELL_HEIGHT / 2)
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

    var buildingCoord = _.last(<Coord[]> building.coords.sort(compareCoords));
    buildingImage.x += xOffset(buildingCoord);
    buildingImage.y += yOffset(buildingCoord);

    return buildingImage;
  }

  private getBuildingImage(building: Buildings.Building): easeljs.Bitmap {
    var config = buildingRenderConfig[building.buildingType][building.direction];

    if (!config) throw new Error("Failed to render building, no image for type: " + building.buildingType +
                                 "and direction: " + building.direction);

    var image = new easeljs.Bitmap(config.imagePath);
    image.x = config.xOffset;
    image.y = config.yOffset;
    return image;
  }

  private renderCell(cell: Cell): easeljs.DisplayObject {
    var cellImage = this.getCellImage(cell);
    cellImage.x = xOffset(cell.coord);
    cellImage.y = yOffset(cell.coord);
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