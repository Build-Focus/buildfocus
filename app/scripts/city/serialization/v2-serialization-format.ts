import previousSerializationFormat = require('./v1-serialization-format');

export var version = 2;

export interface CityData {
  map: previousSerializationFormat.MapData,
  version: number,
  lastChange: ChangeData
}

export type ChangeData = { type: number, building: BuildingData };

export type MapData = previousSerializationFormat.MapData;
export type CellData = previousSerializationFormat.CellData;
export type BuildingData = previousSerializationFormat.BuildingData;
export type SpecificRoadData = previousSerializationFormat.SpecificRoadData;
export type EndlessRoadData = previousSerializationFormat.EndlessRoadData;
export type RoadData = previousSerializationFormat.RoadData;
export type CoordData = previousSerializationFormat.CoordData;