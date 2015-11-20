import preversionSerialization = require('preversion-serialization-format');

export interface CityData {
  map: preversionSerialization.MapData,
  version: number
}

export type MapData = preversionSerialization.MapData;
export type CellData = preversionSerialization.CellData;
export type BuildingData = preversionSerialization.BuildingData;
export type SpecificRoadData = preversionSerialization.SpecificRoadData;
export type EndlessRoadData = preversionSerialization.EndlessRoadData;
export type RoadData = preversionSerialization.RoadData;
export type CoordData = preversionSerialization.CoordData;