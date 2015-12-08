import easeljs = require('createjs');
import Coord = require('city/coord');
import RoadPart = require('city/roads/road-part');
import RoadPartType = require('city/roads/road-part-type');
import Renderable = require('city/rendering/renderable');
import getBuildingConfig = require('city/rendering/building-rendering-config');

const roadImages: { [roadPartType: number]: string } = {
  [RoadPartType.EndFromNorth]: "images/city/road/north-end.png",
  [RoadPartType.EndFromEast]: "images/city/road/east-end.png",
  [RoadPartType.EndFromSouth]: "images/city/road/south-end.png",
  [RoadPartType.EndFromWest]: "images/city/road/west-end.png",

  [RoadPartType.NorthAndEastCorner]: "images/city/road/north-east-corner.png",
  [RoadPartType.EastAndSouthCorner]: "images/city/road/east-south-corner.png",
  [RoadPartType.SouthAndWestCorner]: "images/city/road/south-west-corner.png",
  [RoadPartType.WestAndNorthCorner]: "images/city/road/west-north-corner.png",

  [RoadPartType.StraightEastWest]: "images/city/road/east-west.png",
  [RoadPartType.StraightNorthSouth]: "images/city/road/north-south.png",

  [RoadPartType.NorthEastSouthJunction]: "images/city/road/north-east-south-junction.png",
  [RoadPartType.EastSouthWestJunction]: "images/city/road/east-south-west-junction.png",
  [RoadPartType.SouthWestNorthJunction]: "images/city/road/south-west-north-junction.png",
  [RoadPartType.WestNorthEastJunction]: "images/city/road/west-north-east-junction.png",

  [RoadPartType.Crossroads]: "images/city/road/crossroads.png"
};

class RenderableRoad implements Renderable {
  constructor(private road: RoadPart) { }

  get mainCoord(): Coord {
    return this.road.coord;
  }

  layerIndex = 0;
  zIndex = 1;

  render(): easeljs.DisplayObject {
    var imagePath = roadImages[this.road.type];

    if (imagePath) {
      return new easeljs.Bitmap(imagePath);
    } else {
      throw new Error("Failed to render road, unknown road type: " + this.road.type);
    }
  }

  shouldRender = true;
}

export = RenderableRoad;