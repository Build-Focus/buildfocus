'use strict';

import ko = require("knockout");
import _ = require("lodash");

import Coord = require("app/scripts/city/coord");
import City = require("app/scripts/city/city");
import Direction = require("app/scripts/city/direction");

import Buildings = require("app/scripts/city/buildings/buildings");
import BuildingType = require("app/scripts/city/buildings/building-type");

import BasicHouse = require("app/scripts/city/buildings/basic-house");
import NiceHouse = require("app/scripts/city/buildings/nice-house");
import FancyHouse = require("app/scripts/city/buildings/fancy-house");

function c(x, y) {
  return new Coord(x, y);
}

describe('City Integration - City', () => {
  it('should start with nine cells, and a road through the middle', () => {
    var city = new City();

    expect(city.getCells().length).to.equal(9);
    expect(city.getRoads().length).to.equal(3);
    expect(city.getBuildings().length).to.equal(0);
  });

  describe("buildings", () => {
    it('should be constructable', () => {
      var city = new City();

      var building = new BasicHouse(c(1, 0), Direction.South);
      city.construct(building);

      expect(city.getBuildings()).to.deep.equal([building]);
    });

    it('should fire a changed event when constructed', () => {
      var city = new City();
      var building = new BasicHouse(c(1, 0), Direction.South);
      var listener = sinon.stub();

      city.onChanged(listener);
      city.construct(building);

      expect(listener.calledOnce).to.equal(true);
    });

    it('should be deletable', () => {
      var city = new City();
      var building = new BasicHouse(c(1, 0), Direction.South);
      city.construct(building);

      city.remove(city.getBuildings()[0]);

      expect(city.getBuildings()).to.deep.equal([]);
    });

    it('should fire a changed event when removed', () => {
      var city = new City();
      var building = new BasicHouse(c(1, 0), Direction.South);
      city.construct(building);

      var listener = sinon.stub();
      city.onChanged(listener);
      city.remove(city.getBuildings()[0]);

      expect(listener.calledOnce).to.equal(true);
    });

    it('should add new surrounding cells after construction', () => {
      var city = new City();

      city.construct(new BasicHouse(c(1, 0), Direction.West));

      expect(_.pluck(city.getCells(), 'coord').sort()).to.deep.equal([
        c(-1, -1), c(0, -1), c(1, -1), c(2, -1),
        c(-1, 0),  c(0, 0),  c(1, 0),  c(2, 0),
        c(-1, 1),  c(0, 1),  c(1, 1),  c(2, 1)
      ].sort());
    });
  });

  function buildTwoNiceHouses(city) {
    city.construct(new BasicHouse(c(1, 0), Direction.South));
    city.construct(new BasicHouse(c(2, 0), Direction.South));
    city.construct(new NiceHouse(c(1, 0), Direction.South));
    city.construct(new NiceHouse(c(2, 0), Direction.South));
  }

  describe("upgrade offers", () => {
    it('should offer new basic houses on all empty cells where roads can be built', () => {
      var city = new City();
      city.construct(new BasicHouse(c(1, 0), Direction.West));

      var potentialBuildings = city.getPossibleUpgrades().map((upgrade) => upgrade.building);

      var basicHouseUpgradeCoords = _(potentialBuildings)
        .where({buildingType: BuildingType.BasicHouse})
        .pluck('coords')
        .unique((coord) => coord.toString())
        .flatten()
        .value()
        .sort();

      expect(basicHouseUpgradeCoords).to.deep.equal([
        c(-1, -1),           c(1, -1), c(2, -1),
        c(-1, 0),                      c(2, 0),
        c(-1, 1),            c(1, 1),  c(2, 1)
      ].sort());
    });

    it('should offer to combine two nice houses into one fancy one, in both directions', () => {
      var city = new City();
      buildTwoNiceHouses(city);

      var fancyHouseUpgrades = _.where(city.getPossibleUpgrades().map((upgrade) => upgrade.building),
                                       { buildingType: BuildingType.FancyHouse });

      expect(fancyHouseUpgrades.length).to.equal(2);
      expect(fancyHouseUpgrades[0]).to.deep.equal(new FancyHouse(c(1, 0), c(2, 0), Direction.North));
      expect(fancyHouseUpgrades[1]).to.deep.equal(new FancyHouse(c(1, 0), c(2, 0), Direction.South));
    });
  });

  describe("upgrade validation", () => {
    it('should allow combining two nice houses into one fancy one', () => {
      var city = new City();
      buildTwoNiceHouses(city);

      var fancyBuilding = new FancyHouse(c(1, 0), c(2, 0), Direction.South);
      city.construct(fancyBuilding);

      expect(city.getBuildings()).to.deep.equal([fancyBuilding]);
    });

    it("should not allow building a fancy building without two basic houses to upgrade", () => {
      var city = new City();

      var fancyBuilding = new FancyHouse(c(1, 0), c(2, 0), Direction.North);

      expect(() => city.construct(fancyBuilding)).to.throw();
    });
  });

  it("should successfully serialize every reachable form of building", () => {
    var possibleBuildings = getAllReachableBuildings();

    for (let building of possibleBuildings) {
      expect(Buildings.deserialize(building.serialize())).to.deep.equal(building);
    }
  });

  function getAllReachableBuildings() {
    let unexpanded: Buildings.Building[] = [new BasicHouse(c(1, 0), Direction.South)];
    let foundBuildings: Buildings.Building[] = [];

    while (unexpanded.length > 0) {
      let building = unexpanded.pop();
      unexpanded = _(unexpanded).concat(building.getPotentialUpgrades())
                                .unique((building) => building.buildingType)
                                .reject((building) => _.any(foundBuildings, {buildingType: building.buildingType}))
                                .value();
      foundBuildings.push(building);
    }

    return foundBuildings;
  }
});