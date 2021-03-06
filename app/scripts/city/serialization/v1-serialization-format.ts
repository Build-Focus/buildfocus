import previousSerializationFormat = require('./preversion-serialization-format');

export interface CityData {
  map: previousSerializationFormat.MapData,
  version: number
}

export type MapData = previousSerializationFormat.MapData;
export type CellData = previousSerializationFormat.CellData;
export type BuildingData = previousSerializationFormat.BuildingData;
export type SpecificRoadData = previousSerializationFormat.SpecificRoadData;
export type EndlessRoadData = previousSerializationFormat.EndlessRoadData;
export type RoadData = previousSerializationFormat.RoadData;
export type CoordData = previousSerializationFormat.CoordData;