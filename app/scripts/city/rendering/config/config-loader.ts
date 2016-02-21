import Buildings = require('city/buildings/buildings');
import PositionedImageConfig = require("positioned-image-config");
import RoadPart = require("city/roads/road-part");
import Cell = require("city/cell");
import CellType = require("city/cell-type");
import CellShade = require("city/rendering/config/cell-shade");
import change = require("city/change");

import buildingConfig = require("city/rendering/config/building-rendering-config");
import roadConfig = require("city/rendering/config/road-rendering-config");
import cellConfig = require("city/rendering/config/cell-rendering-config");
import changeConfig = require("city/rendering/config/change-highlight-rendering-config");

export function getBuildingConfig(building: Buildings.Building): PositionedImageConfig {
  return buildingConfig[building.buildingType][building.direction];
}

export function getRoadImagePath(road: RoadPart): string {
  return roadConfig[road.type]
}

export function getCellImagePath(cell: Cell, cellShade: CellShade): string {
  return cellConfig[cell.cellType][cellShade];
}

export function getChangeHighlightConfig(change: change.Change): PositionedImageConfig {
  return changeConfig[change.type];
}