import easeljs = require('createjs');

import City = require('city/city');

import Cell = require('city/cell');
import CellType = require ('city/cell-type');

import Building = require ('city/building');
import BuildingType = require ('city/building-type');

const CELL_WIDTH = 600;
const CELL_HEIGHT = 345;

function byCoordsDiagonally(cellA, cellB) {
  var coordA = cellA.coord;
  var coordB = cellB.coord;

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

  render = (container: easeljs.Container) => {
    for (var cell of this.city.getCells().sort(byCoordsDiagonally)) {
      container.addChild(this.renderCell(cell));
    }

    // TODO: Sort buildings correctly
    for (var building of this.city.getBuildings()) {
      container.addChild(this.renderBuilding(building));
    }
  };

  private renderBuilding(building: Building): easeljs.DisplayObject {
    var buildingImage = this.getBuildingImage(building);

    // TODO: Consider all coords, not just 0th
    var buildingCoord = building.coords[0];
    buildingImage.x += buildingCoord.x * (CELL_WIDTH / 2) - buildingCoord.y * (CELL_WIDTH / 2);
    buildingImage.y += buildingCoord.x * (CELL_HEIGHT / 2) + buildingCoord.y * (CELL_HEIGHT / 2);

    return buildingImage;
  }

  private getBuildingImage(building: Building): easeljs.Bitmap {
    switch (building.buildingType) {
      case BuildingType.BasicHouse:
        var image = new easeljs.Bitmap("/images/city/basic-house/sw.png");
        image.x = 136;
        image.y = 6;
        return image;
      default:
        throw new Error("Failed to render building, unknown building type: " + building.buildingType);
    }
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
        throw new Error("Failed to render building, unknown building type: " + cell.cellType);
    }
  }
}

export = CityRenderer;