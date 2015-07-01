'use strict';

enum BuildingType {
  BasicHouse
}

class Building {
  private type: BuildingType;

  public constructor(type: BuildingType) {
    this.type = type;
  }
}