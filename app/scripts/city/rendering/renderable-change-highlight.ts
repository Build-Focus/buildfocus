import _ = require('lodash');
import easeljs = require('createjs');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Renderable = require('city/rendering/renderable');
import getBuildingConfig = require('city/rendering/building-rendering-config');

import change = require('city/change');

function coordXPosition(c: Coord): number {
  return c.x - c.y;
}

function coordYPosition(c: Coord): number {
  return c.y + c.x;
}

class RenderableChangeHighlight implements Renderable {
  constructor(private change: change.Change) { }

  get mainCoord(): Coord {
    return _.last(this.change.building.coords.sort(Coord.diagonalCompare));
  }

  layerIndex = 1;
  zIndex = 1;

  get shouldRender(): boolean {
    return this.change !== change.nullChange;
  }

  render(): easeljs.DisplayObject {
    if (!this.shouldRender) throw new Error("Attempted to render invalid change highlight");

    let bitmap = this.getBitmapForChange();

    let coordXPositions = this.change.building.coords.map(coordXPosition);
    let coordYPositions = this.change.building.coords.map(coordXPosition);
    let buildingWidth = _.max(coordXPositions) - _.min(coordXPositions);
    let buildingHeight = _.max(coordYPositions) - _.min(coordYPositions);

    let xScaleFactor = 1 + buildingWidth/2;

    bitmap.scaleX = bitmap.scaleY = xScaleFactor;
    bitmap.x = bitmap.x * xScaleFactor;

    let yScaleFactor = 1 + buildingHeight; // This is poorly justified, but makes it come out pretty nicely, so oh well
    bitmap.y = bitmap.y * yScaleFactor;

    return bitmap;
  }

  private getBitmapForChange() {
    if (this.change.type === change.Type.Created) {
      let bitmap = new easeljs.Bitmap("/images/city/highlights/stars.png");
      bitmap.x = -148;
      bitmap.y = -300;
      return bitmap;

    } else if (this.change.type === change.Type.Destroyed) {
      let bitmap = new easeljs.Bitmap("/images/city/change-destroyed.png");
      return bitmap;

    } else throw new Error("Failed to render change highlight, unknown change type: " + this.change.type);
  }
}

export = RenderableChangeHighlight;