import previousSerializationFormat = require('./v2-serialization-format');

export var version = 3;

export interface CityData {
  name: string;
  map: previousSerializationFormat.MapData,
  version: number,
  lastChange: previousSerializationFormat.ChangeData
}

export type ChangeData = previousSerializationFormat.ChangeData;
export type MapData = previousSerializationFormat.MapData;
export type CellData = previousSerializationFormat.CellData;
export type BuildingData = previousSerializationFormat.BuildingData;
export type SpecificRoadData = previousSerializationFormat.SpecificRoadData;
export type EndlessRoadData = previousSerializationFormat.EndlessRoadData;
export type RoadData = previousSerializationFormat.RoadData;
export type CoordData = previousSerializationFormat.CoordData;