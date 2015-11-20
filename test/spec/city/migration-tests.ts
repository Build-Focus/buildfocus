'use strict';

import Serialization = require("app/scripts/city/serialization/serialization-format");
import PreversionSerialization = require("app/scripts/city/serialization/preversion-serialization-format");

import migrateCityData = require('app/scripts/city/serialization/migrate-city-data');

describe("Migration", () => {
  describe("from pre-migration version to v1", () => {
    var preMigrationData: PreversionSerialization.CityData;

    before(() =>
      preMigrationData = {
        map: {
          cells: [
            {coord: {x: -1, y: -1}, cellType: 1}, {coord: {x: 0, y: -1}, cellType: 1}, {coord: {x: 1, y: -1}, cellType: 1}, {coord: {x: 2, y: -1}, cellType: 1},
            {coord: {x: -1, y:  0}, cellType: 1}, {coord: {x: 0, y:  0}, cellType: 1}, {coord: {x: 1, y:  0}, cellType: 1}, {coord: {x: 2, y:  0}, cellType: 1},
            {coord: {x: -1, y:  1}, cellType: 1}, {coord: {x: 0, y:  1}, cellType: 1}, {coord: {x: 1, y:  1}, cellType: 1}, {coord: {x: 2, y:  1}, cellType: 1}
          ],
          buildings: [{coords: [{x: 1, y: 0}], buildingType: 1, direction: 1}],
          roads: [{start: {x: 0, y: 0}, direction: 0}]
        }
      }
    );

    it("doesn't change any of the map data", () => {
      var migratedData = migrateCityData(preMigrationData);
      expect(migratedData.map).to.deep.equal(preMigrationData.map);
    });

    it("adds a version number if not version is present", () => {
      var migratedData = migrateCityData(preMigrationData);
      expect(migratedData.version).to.equal(1);
    });

    it("does nothing if we're already at v1", () => {
      (<any> preMigrationData).version = 1;
      var migratedData = migrateCityData(preMigrationData);
      expect(migratedData.version).to.equal(1);
    });

    it("throws an error if given an unknown version", () => {
      (<any> preMigrationData).version = 1000000000;

      expect(() => migrateCityData(preMigrationData)).to.throw();
    });
  });
});