'use strict';

import $ = require("jquery");
import easeljs = require("createjs");
import ko = require("knockout");

import Buildings = require("app/scripts/city/buildings/buildings");

import City = require("app/scripts/city/city");
import CityRenderer = require("app/scripts/city/rendering/city-renderer");
import BuildingType = require("app/scripts/city/buildings/building-type");

function render(city) {
  var element = document.createElement("div");
  testDiv.appendChild(element);
  element.setAttribute("data-bind", "render: { source: render }");
  element.style.width = "500px";
  element.style.height = "400px";

  ko.applyBindings(new CityRenderer(city), element);

  return $(element).find("canvas")[0];
}

var testDiv;

describe('Acceptance: City', function () {
  this.timeout(5000);

  beforeEach(function () {
    testDiv = document.createElement("div");
    testDiv.style.display = "block";
    testDiv.style.visibility = "hidden";
    document.body.appendChild(testDiv);
  });

  afterEach(function () {
    ko.cleanNode(testDiv);
    testDiv.parentElement.removeChild(testDiv);

    // Clear ticker listeners, so that the stage stops getting updated
    easeljs.Ticker.removeAllEventListeners();
  });

  it("should show an empty cell correctly", function () {
    var city = new City();

    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/empty-cell.png");
  });

  it("should render a building", function () {
    var city = new City();

    city.construct(city.getPossibleUpgrades()[0].building);
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/single-building.png");
  });

  it("should update as new buildings are added", function () {
    var city = new City();
    var canvas = render(city);

    city.construct(city.getPossibleUpgrades()[0].building);

    return expect(canvas).to.soon.be.image("expected-images/single-building.png");
  });

  it("should render a block correctly", function () {
    var city = new City();

    _.times(10, () => city.construct(_.max(city.getPossibleUpgrades(), 'cost').building));
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/10x-0th-upgrade-city.png");
  });

  it("should render upgrades correctly", function () {
    var city = new City();

    _.times(10, () => city.construct(_(city.getPossibleUpgrades())
                                      .where({ building: { buildingType: BuildingType.BasicHouse } })
                                      .max('cost').building));
    _.times(5, () => city.construct(_(city.getPossibleUpgrades())
                                     .reject({ building: { buildingType: BuildingType.BasicHouse } })
                                     .min('cost').building));
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/10x-new-5x-upgrade-city.png");
  });

  it("should render destruction correctly", function () {
    var city = new City();

    _.times(10, () => city.construct(_.max(city.getPossibleUpgrades(), 'cost').building));
    _.times(5, () => city.remove(city.getBuildings()[0]));
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/10x-new-5x-destruction-city.png");
  });
});