import Coord = require('app/scripts/city/coord');
import SpecificRoadEdge = require('app/scripts/city/roads/specific-road-edge');
import RoadPart = require('app/scripts/city/roads/road-part');
import RoadPartType = require('app/scripts/city/roads/road-part-type');

function c(x: number, y: number): Coord {
  return new Coord(x, y);
}

describe("An edge of road", () => {
  it("can be built in a straight line", () => {
    new SpecificRoadEdge(c(0, 0), c(5, 0));
    new SpecificRoadEdge(c(0, 0), c(0, 5));
  });

  it("refuses to be built as a non-straight line", () => {
    expect(() => new SpecificRoadEdge(c(0, 0), c(5, 5))).to.throw();
    expect(() => new SpecificRoadEdge(c(0, 0), c(5, 1))).to.throw();
    expect(() => new SpecificRoadEdge(c(0, 0), c(1, 5))).to.throw();
  });

  it("refuses to be built with no length (start === end)", () => {
    expect(() => new SpecificRoadEdge(c(0, 0), c(0, 0))).to.throw();
  });

  it("can calculate the coords covered in a straight line vertically", () => {
    var edge = new SpecificRoadEdge(c(10, 0), c(10, 5));

    expect(edge.coords).to.deep.equal([c(10, 0), c(10, 1), c(10, 2), c(10, 3), c(10, 4), c(10, 5)]);
  });

  it("can calculate the coords covered in a straight line horizontally", () => {
    var edge = new SpecificRoadEdge(c(5, 0), c(-1, 0));

    expect(edge.coords).to.deep.equal([c(5, 0), c(4, 0), c(3, 0), c(2, 0), c(1, 0), c(0, 0), c(-1, 0)]);
  });

  it("can calculate the parts involved in a east-bound road", () => {
    var edge = new SpecificRoadEdge(c(0, 0), c(2, 0));

    expect(edge.parts).to.deep.equal([
      new RoadPart(c(0, 0), RoadPartType.EndFromEast),
      new RoadPart(c(1, 0), RoadPartType.StraightEastWest),
      new RoadPart(c(2, 0), RoadPartType.EndFromWest)
    ]);
  });

  it("can calculate the parts involved in a south-bound road", () => {
    var edge = new SpecificRoadEdge(c(0, 0), c(0, 3));

    expect(edge.parts).to.deep.equal([
      new RoadPart(c(0, 0), RoadPartType.EndFromSouth),
      new RoadPart(c(0, 1), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, 2), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, 3), RoadPartType.EndFromNorth)
    ]);
  });

  it("can calculate the parts involved in a west-bound road", () => {
    var edge = new SpecificRoadEdge(c(2, 0), c(0, 0));

    expect(edge.parts).to.deep.equal([
      new RoadPart(c(2, 0), RoadPartType.EndFromWest),
      new RoadPart(c(1, 0), RoadPartType.StraightEastWest),
      new RoadPart(c(0, 0), RoadPartType.EndFromEast)
    ]);
  });

  it("can calculate the parts involved in a north-bound road", () => {
    var edge = new SpecificRoadEdge(c(0, 3), c(0, 0));

    expect(edge.parts).to.deep.equal([
      new RoadPart(c(0, 3), RoadPartType.EndFromNorth),
      new RoadPart(c(0, 2), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, 1), RoadPartType.StraightNorthSouth),
      new RoadPart(c(0, 0), RoadPartType.EndFromSouth)
    ]);
  });
});