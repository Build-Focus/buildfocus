import _ = require('lodash');
import easeljs = require('createjs');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Renderable = require('city/rendering/renderable');
import getBuildingConfig = require('city/rendering/building-rendering-config');

import change = require('city/change');

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

    return this.getBitmapForChange();
  }

  private getBitmapForChange() {
    switch (this.change.type) {
      case change.Type.Created:
        return new easeljs.Bitmap("/images/city/change-created.png");
      case change.Type.Destroyed:
        return new easeljs.Bitmap("/images/city/change-destroyed.png");
      default:
        throw new Error("Failed to render change highlight, unknown change type: " + this.change.type);
    }
  }
}

export = RenderableChangeHighlight;