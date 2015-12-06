'use strict';

import serialization = require("app/scripts/city/serialization/serialization-format");
import preversionSerialization = require("app/scripts/city/serialization/preversion-serialization-format");

import City = require("app/scripts/city/city");
import migrateCityData = require('app/scripts/city/serialization/migrate-city-data');

const newestVersion = 2;

describe("Migration", () => {
  function supportsVersion<T>(version: any, data: T, specificTests?: (data: T) => void) {
    describe(`from ${version} data`, () => {
      it("works successfully", () => {
        var migratedData = migrateCityData(data);
        expect(() => new City().updateFromJSON(migratedData)).not.to.throw();
      });

      it("gets all the way to the newest version", () => {
        var migratedData = migrateCityData(data);
        expect(migratedData.version).to.equal(newestVersion);
      });

      it("gets all the way to the newest version", () => {
        var migratedData = migrateCityData(data);
        expect(migratedData.version).to.equal(newestVersion);
      });

      it("run repeatedly returns the exact same object", () => {
        var migratedData = migrateCityData(data);
        var remigratedData = migrateCityData(migratedData);

        expect(migratedData).to.equal(remigratedData);
      });

      if (specificTests) specificTests(data);
    });
  }

  it("does nothing given raw data from a fresh city", () => {
    var freshData = new City().toJSON();
    var migratedData = migrateCityData(freshData);

    expect(freshData).to.equal(migratedData);
  });

  it("throws an error if given an unknown version", () => {
    var data = new City().toJSON();
    data.version = 1000000000;

    expect(() => migrateCityData(data)).to.throw();
  });

  supportsVersion("preversion", JSON.stringify({
    map: {
      cells: [
        {coord: {x: -1, y: -1}, cellType: 1}, {coord: {x: 0, y: -1}, cellType: 1}, {coord: {x: 1, y: -1}, cellType: 1}, {coord: {x: 2, y: -1}, cellType: 1},
        {coord: {x: -1, y:  0}, cellType: 1}, {coord: {x: 0, y:  0}, cellType: 1}, {coord: {x: 1, y:  0}, cellType: 1}, {coord: {x: 2, y:  0}, cellType: 1},
        {coord: {x: -1, y:  1}, cellType: 1}, {coord: {x: 0, y:  1}, cellType: 1}, {coord: {x: 1, y:  1}, cellType: 1}, {coord: {x: 2, y:  1}, cellType: 1}
      ],
      buildings: [{coords: [{x: 1, y: 0}], buildingType: 1, direction: 1}],
      roads: [{start: {x: 0, y: 0}, direction: 0}]
    }
  }));

  supportsVersion("v1", {
    map: {
      cells: [
        {coord: {x: -1, y: -1}, cellType: 1}, {coord: {x: 0, y: -1}, cellType: 1}, {coord: {x: 1, y: -1}, cellType: 1}, {coord: {x: 2, y: -1}, cellType: 1},
        {coord: {x: -1, y:  0}, cellType: 1}, {coord: {x: 0, y:  0}, cellType: 1}, {coord: {x: 1, y:  0}, cellType: 1}, {coord: {x: 2, y:  0}, cellType: 1},
        {coord: {x: -1, y:  1}, cellType: 1}, {coord: {x: 0, y:  1}, cellType: 1}, {coord: {x: 1, y:  1}, cellType: 1}, {coord: {x: 2, y:  1}, cellType: 1}
      ],
      buildings: [{coords: [{x: 1, y: 0}], buildingType: 1, direction: 1}],
      roads: [{start: {x: 0, y: 0}, direction: 0}]
    },
    version: 1
  }, (data) => {
    it("adds a null lastChange", () => {
      var migratedData = migrateCityData(data);
      expect(migratedData.lastChange).to.be.null;
    });
  });
});