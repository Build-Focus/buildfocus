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
      imagePath: "/images/city/basic-house/south.png",
    },
    [Direction.East]: {
      xOffset: 157,
      yOffset: 11,
      imagePath: "/images/city/basic-house/east.png",
    }
  },

  [BuildingType.NiceHouse]: {
    [Direction.South]: {
      xOffset: -2,
      yOffset: -92,
      imagePath: "/images/city/nice-house/south.png",
    },
    [Direction.East]: {
      xOffset: -2,
      yOffset: -92,
      imagePath: "/images/city/nice-house/east.png",
    }
  },

  [BuildingType.FancyHouse]: {
    [Direction.North]: {
      xOffset: -280,
      yOffset: -224,
      imagePath: "images/city/fancy-house/south.png",
    },
    [Direction.South]: {
      xOffset: -280,
      yOffset: -224,
      imagePath: "images/city/fancy-house/south.png",
    },
    [Direction.East]: {
      xOffset: 4,
      yOffset: -201,
      imagePath: "images/city/fancy-house/east.png",
    },
    [Direction.West]: {
      xOffset: 4,
      yOffset: -201,
      imagePath: "images/city/fancy-house/east.png",
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