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
  element.setAttribute("data-bind", "render: render");
  element.style.width = "500px";
  element.style.height = "500px";

  ko.applyBindings(new CityRenderer(city), element);

  return $(element).find("canvas")[0];
}

var testDiv;

describe('Acceptance: City', function () {
  beforeEach(function () {
    testDiv = document.createElement("div");
    testDiv.style.display = "block";
    testDiv.style.visibility = "hidden";
    document.body.appendChild(testDiv);
  });

  afterEach(function () {
    testDiv.parentElement.removeChild(testDiv);
  });

  it("should show an empty cell correctly", function () {
    var city = new City();

    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/empty-cell.png");
  });

  it("should render a building", function () {
    var city = new City();

    city.construct(city.getPossibleUpgrades()[0]);
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/single-building.png");
  });

  it("should update as new buildings are added", function () {
    var city = new City();
    var canvas = render(city);

    city.construct(city.getPossibleUpgrades()[0]);

    return expect(canvas).to.soon.be.image("expected-images/single-building.png");
  });

  it("should render a block correctly", function () {
    var city = new City();

    _.times(10, () => city.construct(_.first(city.getPossibleUpgrades())));
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/10x-0th-upgrade-city.png");
  });

  it("should render upgrades correctly", function () {
    var city = new City();

    _.times(10, () => city.construct(_(city.getPossibleUpgrades())
                                      .where({ buildingType: BuildingType.BasicHouse })
                                      .first()));
    _.times(5, () => city.construct(_(city.getPossibleUpgrades())
                                     .reject({ buildingType: BuildingType.BasicHouse })
                                     .last()));
    var canvas = render(city);

    return expect(canvas).to.soon.be.image("expected-images/10x-new-5x-upgrade-city.png");
  });
});