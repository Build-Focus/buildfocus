import serialization = require('city/serialization/serialization-format');
import preversionSerialization = require('city/serialization/preversion-serialization-format');
import v1Serialization = require('city/serialization/v1-serialization-format');
import v2Serialization = require('city/serialization/v2-serialization-format');

import _ = require('lodash');

function isPreversion(data: any): data is preversionSerialization.CityData {
  return _.isString(data);
}

function isV1(data: any): data is v1Serialization.CityData {
  return data.version === 1;
}

function isV2(data: any): data is v2Serialization.CityData {
  return data.version === 2;
}

/**
 * Migrates the given city data to the most up to date form, if possible.
 *
 * Note that it's important this returns the exact same referrentially equal object
 * that it's given if there are no changes required; we use that in Score to detect
 * whether migration was necessary (and thus whether to propagate an update immediately).
 */
function migrateCityData(data: any): serialization.CityData {
  if (isPreversion(data)) return migrateFromPreversion(data);
  else if (isV1(data)) return migrateFromV1(data);
  else if (isV2(data)) return migrateFromV2(data);
  else throw new Error("City data is not most recent version, but could not find suitable migration: " + JSON.stringify(data));
}

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