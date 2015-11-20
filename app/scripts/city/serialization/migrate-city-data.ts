import serialization = require('city/serialization/serialization-format');
import preversionSerialization = require('city/serialization/preversion-serialization-format');

import _ = require('lodash');

/**
 * Migrates the given city data to the most up to date form, if possible.
 *
 * Note that it's important this returns the exact same referrentially equal object
 * that it's given if there are no changes required; we use that in Score to detect
 * whether migration was necessary (and thus whether to propagate an update immediately).
 */
function migrateCityData(data: any): serialization.CityData {
  switch (data.version) {
    case 1:
      return data;
    case undefined:
      return migratePreversionToV1(data);
    default:
      throw new Error("Could not parse loaded city data (only unversioned and v1 supported): " + JSON.stringify(data));
  }
}

function migratePreversionToV1(data: preversionSerialization.CityData): serialization.CityData {
  // TODO: Update lodash type definitions so it can work out this without the explicit type
  return <serialization.CityData> _.merge(_.cloneDeep(data), { version: 1 });
}

export = migrateCityData;