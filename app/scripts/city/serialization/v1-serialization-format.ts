export interface CityData {
  map: MapData,
  version: number
}

export interface MapData {
  cells: CellData[];
  buildings: BuildingData[];
  roads: RoadData[];
}

export interface CellData {
  coord: CoordData;
  cellType: number;
}

export interface BuildingData {
  coords: CoordData[];
  buildingType: number;
  direction: number;
}

export interface SpecificRoadData {
  start: CoordData;
  end: CoordData;
}

export interface EndlessRoadData {
  start: CoordData;
  direction: number;
}

export type RoadData = SpecificRoadData | EndlessRoadData;

export interface CoordData {
  x: number;
  y: number;
}