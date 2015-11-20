import serialization = require('city/serialization/serialization-format');
import preversionSerialization = require('city/serialization/preversion-serialization-format');

import _ = require('lodash');

export function migrateCityData(data: any): serialization.CityData {
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