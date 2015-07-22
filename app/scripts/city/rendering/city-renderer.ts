import easeljs = require('createjs');

import City = require('city/city');

class CityRenderer {
  private city: City;

  constructor(city: City) {
    this.city = city;
  }

  render(container: easeljs.Container) {
    var building = new easeljs.Bitmap("/images/city/basic-house/sw.png");
    container.addChild(building);
  }
}

export = CityRenderer;