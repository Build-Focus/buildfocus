import BuildingType = require('city/buildings/building-type');

interface BuildingConfig {
  xOffset: number;
  yOffset: number;
  imagePath: string;
}

var config: { [buildingType: number]: BuildingConfig } = {
  [BuildingType.BasicHouse]: {
    xOffset: 136,
    yOffset: 6,
    imagePath: "/images/city/basic-house/sw.png",
  }
};

export = config;