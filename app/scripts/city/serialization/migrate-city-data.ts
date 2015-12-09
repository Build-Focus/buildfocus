import serialization = require('city/serialization/serialization-format');
import preversionSerialization = require('city/serialization/preversion-serialization-format');
import v1Serialization = require('city/serialization/v1-serialization-format');
import v2Serialization = require('city/serialization/v2-serialization-format');

import _ = require('lodash');

/**
 * Migrates the given city data to the most up to date form, if possible.
 */
function migrateCityData(data: {}): serialization.CityData {
  if (isPreversion(data)) return migrateFromPreversion(data);
  else if (isV1(data)) return migrateFromV1(data);
  else if (isV2(data)) return migrateFromV2(data);
  else throw new Error("City data is not most recent version, but could not find suitable migration: " + JSON.stringify(data));
}

// Type checks

var isPreversion = (x: any): x is string                   => _.isString(x);
var isV1         = (x: any): x is v1Serialization.CityData => x.version === 1;
var isV2         = (x: any): x is v2Serialization.CityData => x.version === 2;

// Per-source migration steps, for each possible source

var migrateFromV2 = (data: v2Serialization.CityData) => data;

var migrateFromV1 = _.compose(migrateFromV2, function v1ToV2(data: v1Serialization.CityData) {
  return _.merge(_.cloneDeep(data), { lastChange: null, version: 2 });
});

var migrateFromPreversion = _.compose(migrateFromV1, function preversionToV1(data: string) {
  var parsedData: preversionSerialization.CityData = JSON.parse(data);
  if ((<any>parsedData).version !== undefined) {
    throw new Error("Found preversion string-based city data, but with a version number!\n" + data);
  }

  return _.merge(_.cloneDeep(parsedData), { version: 1 });
});

export = migrateCityData;