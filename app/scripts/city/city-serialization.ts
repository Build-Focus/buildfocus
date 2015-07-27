export interface CityData {
  map: MapData
}

export interface MapData {
  cells: CellData[];
  buildings: BuildingData[];
}

export interface CellData {
  coord: CoordData;
  cellType: number;
}

export interface BuildingData {
  coords: CoordData[];
  buildingType: number;
}

export interface CoordData {
  x: number;
  y: number;
}