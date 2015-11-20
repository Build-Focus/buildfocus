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
  if (_.isString(data)) {
    return migratePreversionToV1(<string> data);
  } else {
    switch (data.version) {
      case 1:
        return data;
      default:
        throw new Error("Could not parse loaded city data (only unversioned and v1 supported): " + JSON.stringify(data));
    }
  }
}

function migratePreversionToV1(data: string): serialization.CityData {
  var parsedData: preversionSerialization.CityData = JSON.parse(data);
  if ((<any>parsedData).version !== undefined) {
    throw new Error("Found preversion string-based city data, but with a version number!\n" + data);
  }

  // TODO: Update lodash type definitions so it can work out this without the explicit type
  return <serialization.CityData> _.merge(_.cloneDeep(parsedData), { version: 1 });
}

export = migrateCityData;