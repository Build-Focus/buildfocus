import RoadPartType = require('city/roads/road-part-type');

export = <{ [roadPartType: string]: string }> {
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