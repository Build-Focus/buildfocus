'use strict';

export enum CellSurface {
  Null,
  Grass
}

export class Cell {
  public x: number;
  public y: number;

  private surface: CellSurface;

  constructor(x: number, y: number, surface: CellSurface) {
    this.x = x;
    this.y = y;
    this.surface = surface;
  }
}

export class NullCell extends Cell {
  constructor(x: number, y: number) {
    super(x, y, CellSurface.Null);
  }
}