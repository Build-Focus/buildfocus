import Direction = require('city/direction');
import BuildingType = require('city/buildings/building-type');

interface BuildingRenderingConfig {
  [direction: number]: {
    xOffset: number;
    yOffset: number;
    imagePath: string;
  }
}

var config: { [buildingType: number]: BuildingRenderingConfig } = {
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

  [BuildingType.FancyHouse]: {
    [Direction.South]: {
      xOffset: 20,
      yOffset: -50,
      imagePath: "images/city/fancy-house/South.png",
    },
    [Direction.East]: {
      xOffset: -42,
      yOffset: -222,
      imagePath: "images/city/fancy-house/East.png",
    },
    // TODO: Actually create a 'west' image for this building (and fix the East shadows too)
    [Direction.West]: {
      xOffset: -42,
      yOffset: -222,
      imagePath: "images/city/fancy-house/East.png",
    }
  }
};

export = config;