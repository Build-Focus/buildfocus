import Coord = require('app/scripts/city/coord');

import {CostedRoute} from 'app/scripts/city/roads/costed-route';
import RoadPlan = require('app/scripts/city/roads/road-plan');

import SpecificRoadEdge = require('app/scripts/city/roads/specific-road-edge');

function c(x: number, y: number): Coord {
  return new Coord(x, y);
}

function route(coords: Coord[], cost: number): CostedRoute {
  var route = <CostedRoute> _.clone(coords);
  route.cost = cost;
  return route;
}

function road(coordA: Coord, coordB: Coord): SpecificRoadEdge {
  return new SpecificRoadEdge(coordA, coordB);
}

describe("A road plan", () => {
  var plan: RoadPlan;

  describe("when that adds no routes", () => {
    beforeEach(() => plan = new RoadPlan([]));

    it("is free", () => {
      expect(plan.cost).to.equal(0);
    });

    it("needs no roads", () => {
      expect(plan.roadsRequired).to.deep.equal([]);
    });
  });

  describe("with a route covering only two cells, costing 2", () => {
    beforeEach(() => plan = new RoadPlan([route([c(0,0), c(0,1)], 2)]));

    it("costs 1", () => {
      expect(plan.cost).to.equal(2);
    });

    it("needs a single two cell road", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0,0), c(0,1))
      ]);
    });
  });

  describe("with a route covering three cells in a straight line", () => {
    beforeEach(() => plan = new RoadPlan([route([c(0,0), c(0,2)], 2)]));

    it("needs a single three cell road", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0,0), c(0,2))
      ]);
    });
  });

  describe("with a route covering three cells in a L shape", () => {
    beforeEach(() => plan = new RoadPlan([route([c(0,0), c(0,1), c(1,1)], 2)]));

    it("needs two roads", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0,0), c(0,1)),
        road(c(0,1), c(1,1))
      ]);
    });
  });

  describe("that is impossible", () => {
    beforeEach(() => plan = RoadPlan.ImpossibleRoadPlan);

    it("should have an infinite cost", () => {
      expect(plan.cost).to.equal(Infinity);
    });

    it("should throw if you try to read its roads", () => {
      expect(() => plan.roadsRequired).to.throw();
    });
  });
});
