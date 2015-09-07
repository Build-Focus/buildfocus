export interface CityData {
  map: MapData
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
  direction: number
}

export interface RoadData {
  start: CoordData;
  end: CoordData;
}

export interface CoordData {
  x: number;
  y: number;
}