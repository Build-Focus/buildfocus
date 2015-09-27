import Coord = require('app/scripts/city/coord');
import Direction = require('app/scripts/city/direction');
import Map = require('app/scripts/city/map');

import EndlessRoadEdge = require('app/scripts/city/roads/endless-road-edge');
import RoadPart = require('app/scripts/city/roads/road-part');
import RoadPartType = require('app/scripts/city/roads/road-part-type');

function c(x: number, y: number): Coord {
  return new Coord(x, y);
}

function mapStub(...coords): Map {
  return <any> {
    getCells: sinon.stub().returns(coords.map((coord) => { return { coord: coord }; }))
  };
}

describe("An endless edge of road", () => {
  it("can be built in a straight line", () => {
    new EndlessRoadEdge(c(0, 0), Direction.East, mapStub());
    new EndlessRoadEdge(c(0, 0), Direction.North, mapStub());
  });

  it("can calculate the coords covered in a straight line vertically", () => {
    var map = mapStub(c(0, 0), c(0, 1), c(0, -1), c(1, 0), c(-1, 0));
    var road = new EndlessRoadEdge(c(0, 0), Direction.North, map);

    expect(road.coords).to.deep.equal([c(0, 0), c(0, 1), c(0, -1)]);
  });

  it("can calculate the coords covered in a straight line horizontally", () => {
    var map = mapStub(c(0, 0), c(0, 1), c(0, -1), c(1, 0), c(-1, 0));
    var road = new EndlessRoadEdge(c(0, 0), Direction.East, map);

    expect(road.coords).to.deep.equal([c(0, 0), c(1, 0), c(-1, 0)]);
  });

  it("can calculate the parts involved in a east-bound road", () => {
    var map = mapStub(c(0, 0), c(0, 1), c(0, -1), c(1, 0), c(-1, 0));
    var road = new EndlessRoadEdge(c(0, 0), Direction.East, map);

    expect(road.parts).to.deep.equal([
      new RoadPart(c(0, 0), RoadPartType.StraightEastWest),
      new RoadPart(c(1, 0), RoadPartType.StraightEastWest),
      new RoadPart(c(-1, 0), RoadPartType.StraightEastWest)
    ]);
  });

  it("can calculate the parts involved in a south-bound road", () => {
    var map = mapStub(c(0, 0), c(0, 1), c(0, -1), c(1, 0), c(-1, 0));
    var road = new EndlessRoadEdge(c(0, 0), Direction.South, map);

    expect(road.parts).to.deep.equal([
      new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, 1), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, -1), RoadPartType.StraightNorthSouth)
    ]);
  });

  it("can calculate the parts involved in a west-bound road", () => {
    var map = mapStub(c(0, 0), c(0, 1), c(0, -1), c(1, 0), c(-1, 0));
    var road = new EndlessRoadEdge(c(0, 0), Direction.West, map);

    expect(road.parts).to.deep.equal([
      new RoadPart(c(0, 0), RoadPartType.StraightEastWest),
      new RoadPart(c(1, 0), RoadPartType.StraightEastWest),
      new RoadPart(c(-1, 0), RoadPartType.StraightEastWest)
    ]);
  });

  it("can calculate the parts involved in a north-bound road", () => {
    var map = mapStub(c(0, 0), c(0, 1), c(0, -1), c(1, 0), c(-1, 0));
    var road = new EndlessRoadEdge(c(0, 0), Direction.North, map);

    expect(road.parts).to.deep.equal([
      new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, 1), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, -1), RoadPartType.StraightNorthSouth)
    ]);
  });
});