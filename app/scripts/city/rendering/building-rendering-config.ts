import Buildings = require('city/buildings/buildings');
import Direction = require('city/direction');
import BuildingType = require('city/buildings/building-type');

interface BuildingRenderingConfig {
  xOffset: number;
  yOffset: number;
  imagePath: string;
}

var config: { [buildingType: number]: { [direction: number]: BuildingRenderingConfig } } = {
  [BuildingType.BasicHouse]: {
    [Direction.South]: {
      xOffset: 136,
      yOffset: 6,
      imagePath: "/images/city/basic-house/sw.png",
    }
  },

  [BuildingType.NiceHouse]: {
    [Direction.South]: {
      xOffset: 0,
      yOffset: -66,
      imagePath: "/images/city/nice-house/sw.png",
    }
  },

  // TODO: Actually create a north + west images for this (and fix the East shadows too)
  [BuildingType.FancyHouse]: {
    [Direction.North]: {
      xOffset: -284,
      yOffset: -225,
      imagePath: "images/city/fancy-house/South.png",
    },
    [Direction.South]: {
      xOffset: -284,
      yOffset: -225,
      imagePath: "images/city/fancy-house/South.png",
    },
    [Direction.East]: {
      xOffset: -37,
      yOffset: -224,
      imagePath: "images/city/fancy-house/East.png",
    },
    [Direction.West]: {
      xOffset: -37,
      yOffset: -224,
      imagePath: "images/city/fancy-house/East.png",
    }
  }
};

export = function getBuildingConfig(building: Buildings.Building): BuildingRenderingConfig {
  var buildingConfig = config[building.buildingType];
  if (buildingConfig) {
    return buildingConfig[building.direction];
  } else {
    return undefined;
  }
}