import Coord = require('app/scripts/city/coord');
import RoadPart = require('app/scripts/city/roads/road-part');
import RoadPartType = require('app/scripts/city/roads/road-part-type');

import RenderableRoad = require('app/scripts/city/rendering/renderable-road');

function c(x: number, y: number): Coord {
  return new Coord(x, y);
}

describe("A road part", () => {
  it("has a type", () => {
    var road = new RoadPart(c(0, 0), RoadPartType.StraightEastWest);
    expect(road.type).to.equal(RoadPartType.StraightEastWest);
  });

  it("has a coord", () => {
    var road = new RoadPart(c(0, 0), RoadPartType.StraightEastWest);
    expect(road.coord).to.deep.equal(c(0, 0));
  });

  describe("combination", () => {
    it("should be the common type if the two parts are the same", () => {
      var roadA = new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth);
      var roadB = new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth);

      expect(roadA.combinedWith(roadB)).to.deep.equal(roadA);
    });

    it("should not work if the roads have different coordinates", () => {
      var roadA = new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth);
      var roadB = new RoadPart(c(1, 1), RoadPartType.StraightNorthSouth);

      expect(() => roadA.combinedWith(roadB)).to.throw();
    });

    it("should build crossroads from opposing straight sections", () => {
      var roadA = new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth);
      var roadB = new RoadPart(c(0, 0), RoadPartType.StraightEastWest);

      var expectedRoad = new RoadPart(c(0, 0), RoadPartType.Crossroads);
      expect(roadA.combinedWith(roadB)).to.deep.equal(expectedRoad);
    });

    it("should build corners from two road ends", () => {
      var roadA = new RoadPart(c(0, 0), RoadPartType.EndFromEast);
      var roadB = new RoadPart(c(0, 0), RoadPartType.EndFromSouth);

      var expected = new RoadPart(c(0, 0), RoadPartType.EastAndSouthCorner);
      expect(roadA.combinedWith(roadB)).to.deep.equal(expected);
    });

    it("should build junctions from road end and straight road", () => {
      var roadA = new RoadPart(c(0, 0), RoadPartType.EndFromEast);
      var roadB = new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth);

      var expected = new RoadPart(c(0, 0), RoadPartType.NorthEastSouthJunction);
      expect(roadA.combinedWith(roadB)).to.deep.equal(expected);
    });

    it("should build crossroads from opposing straight sections", () => {
      var roadA = new RoadPart(c(0, 0), RoadPartType.StraightNorthSouth);
      var roadB = new RoadPart(c(0, 0), RoadPartType.StraightEastWest);

      var expectedRoad = new RoadPart(c(0, 0), RoadPartType.Crossroads);
      expect(roadA.combinedWith(roadB)).to.deep.equal(expectedRoad);
    });

    it("should never generate types outside the type enum", () => {
      var allRoadPartTypes = RoadPartType.allValues();
      var allRoadParts: RoadPart[] = allRoadPartTypes.map((v) => new RoadPart(c(0, 0), v));

      for (let p1 of allRoadParts) {
        for (let p2 of allRoadParts) {
          var result = p1.combinedWith(p2);
          expect(allRoadPartTypes).to.include(result.type);
        }
      }
    });
  });

  it("should be renderable", () => {
    var allRoadPartTypes = RoadPartType.allValues();
    var allRoadParts: RoadPart[] = allRoadPartTypes.map((v) => new RoadPart(c(0, 0), v));

    for (let part of allRoadParts) {
      var renderResult = new RenderableRoad(part).render();

      expect(renderResult).not.to.be.null;
    }
  });
});