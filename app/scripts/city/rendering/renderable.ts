import easeljs = require('createjs');
import Coord = require('city/coord');

interface Renderable {
  /**
   * Coord at which to render from, and to use for sorting
   */
  mainCoord: Coord;

  /**
   * Overall layer to render in (each layer is rendered sequentially)
   */
  layerIndex: number;

  /**
   * Index for rendering within the given coord
   */
  zIndex: number;

  /**
   * Method to return the display object rendered for this item
   */
  render(): easeljs.DisplayObject;

  /**
   * Whether this renderable should be rendered
   * If this returns false, render() may explode.
   */
  shouldRender: boolean;
}

export = Renderable;