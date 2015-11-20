'use strict';

import serialization = require("app/scripts/city/serialization/serialization-format");
import preversionSerialization = require("app/scripts/city/serialization/preversion-serialization-format");

import migrateCityData = require('app/scripts/city/serialization/migrate-city-data');

describe("Migration", () => {
  describe("from preversion string data to v1 structured data", () => {
    var preMigrationUnderlyingData: preversionSerialization.CityData;
    var preMigrationData: () => string = () => JSON.stringify(preMigrationUnderlyingData);

    before(() => {
      preMigrationUnderlyingData = {
        map: {
          cells: [
            {coord: {x: -1, y: -1}, cellType: 1}, {coord: {x: 0, y: -1}, cellType: 1}, {coord: {x: 1, y: -1}, cellType: 1}, {coord: {x: 2, y: -1}, cellType: 1},
            {coord: {x: -1, y:  0}, cellType: 1}, {coord: {x: 0, y:  0}, cellType: 1}, {coord: {x: 1, y:  0}, cellType: 1}, {coord: {x: 2, y:  0}, cellType: 1},
            {coord: {x: -1, y:  1}, cellType: 1}, {coord: {x: 0, y:  1}, cellType: 1}, {coord: {x: 1, y:  1}, cellType: 1}, {coord: {x: 2, y:  1}, cellType: 1}
          ],
          buildings: [{coords: [{x: 1, y: 0}], buildingType: 1, direction: 1}],
          roads: [{start: {x: 0, y: 0}, direction: 0}]
        }
      };
    });

    it("doesn't change any of the map data", () => {
      var migratedData = migrateCityData(preMigrationData());
      expect(migratedData.map).to.deep.equal(preMigrationUnderlyingData.map);
    });

    it("adds a version number if not version is present", () => {
      var migratedData = migrateCityData(preMigrationData());
      expect(migratedData.version).to.equal(1);
    });

    it("does nothing if we're already at v1", () => {
      var v1Data = migrateCityData(preMigrationData());
      var migratedData = migrateCityData(v1Data);
      expect(migratedData.version).to.equal(1);
    });

    it("throws an error if given an unknown version", () => {
      (<any> preMigrationUnderlyingData).version = 1000000000;

      expect(() => migrateCityData(preMigrationData())).to.throw();
    });
  });
});