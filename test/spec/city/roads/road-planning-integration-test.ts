import Direction = require('app/scripts/city/direction');
import Coord = require('app/scripts/city/coord');

import Buildings = require('app/scripts/city/buildings/buildings');
import Building = Buildings.Building;
import RoadEdge = require('app/scripts/city/roads/road-edge')
import SpecificRoadEdge = require('app/scripts/city/roads/specific-road-edge');
import Map = require('app/scripts/city/map');

import BasicHouse = require('app/scripts/city/buildings/basic-house');
import FancyHouse = require('app/scripts/city/buildings/fancy-house');

import RoadPlanner = require('app/scripts/city/roads/road-planner');
import RoadPlan = require('app/scripts/city/roads/road-plan');

function c(x: number, y: number): Coord {
  return new Coord(x, y);
}

function road(coordA: Coord, coordB: Coord): SpecificRoadEdge {
  return new SpecificRoadEdge(coordA, coordB);
}

const twentyByTwentyCells: { coord: Coord }[] = _.combinations(_.range(0, 20), _.range(0, 20)).map((xy) => {
  var [x, y] = xy;
  return { coord: new Coord(x, y) };
});

function mapStub() {
  var stub = {
    buildingCoords: <Coord[]> [],
    roadCoord: c(0, 0),
    getBuildingAt: (c: Coord) => _.containsEqual(stub.buildingCoords, c) ? {} : null,
    getRoadAt: (c: Coord) => stub.roadCoord.equals(c) ? {} : null,
    getCells: () => twentyByTwentyCells
  };

  return <any> stub;
}

describe("Integration: Road planning ", () => {
  var map: any;
  var planner: RoadPlanner;
  var plan: RoadPlan;

  beforeEach(() => {
    map = mapStub();
    planner = new RoadPlanner(() => 1);
  });

  function itShouldBeImpossible() {
    it("should be infinitely expensive", () => {
      expect(plan.cost).to.equal(Infinity);
    });

    it("should throw if you try and get specific roads", () => {
      expect(() => plan.roadsRequired).to.throw();
    });
  }

  describe("when the only exit is blocked initially", () => {
    beforeEach(() => {
      map.buildingCoords.push(c(0, -1));
      plan = planner.plan(map, new BasicHouse(c(0, 0), Direction.North));
    });

    itShouldBeImpossible();
  });

  describe("when the one exit of many is blocked initially", () => {
    beforeEach(() => {
      map.buildingCoords.push(c(1, 1));
      plan = planner.plan(map, new FancyHouse(c(0, 0), c(0, 1), Direction.East));
    });

    itShouldBeImpossible();
  });

  describe("when the exit is unreachable", () => {
    beforeEach(() => {
      map.buildingCoords.push(c(0, -1));
      map.buildingCoords.push(c(-1, 0));
      map.buildingCoords.push(c(1, 0));
      map.buildingCoords.push(c(-1, 1));
      map.buildingCoords.push(c(1, 1));
      map.buildingCoords.push(c(0, 2));

      /*******************
       2    b   S <-- target building
       1  b   b
       0  b R b <-- the only road (cut off)
      -1    b

         -1 0 1 2
       *******************/

      plan = planner.plan(map, new BasicHouse(c(2, 2), Direction.South));
    });

    itShouldBeImpossible();
  });

  describe("when planning an already connected building", () => {
    beforeEach(() => {
      plan = planner.plan(map, new BasicHouse(c(0, 1), Direction.North));
    });

    it("should cost nothing", () => {
      expect(plan.cost).to.equal(0);
    });

    it("should require no roads", () => {
      expect(plan.roadsRequired).to.deep.equal([]);
    });
  });

  describe("when planning a building one cell away from a road", () => {
    beforeEach(() => {
      plan = planner.plan(map, new BasicHouse(c(2, 0), Direction.West));
    });

    it("should cost 1", () => {
      expect(plan.cost).to.equal(1);
    });

    it("should require one two cell road", () => {
      expect(plan.roadsRequired).to.deep.equal([new SpecificRoadEdge(c(1, 0), c(0, 0))]);
    });
  });

  describe("when the proposed building is in the way", () => {
    beforeEach(() => {
      plan = planner.plan(map, new BasicHouse(c(0, 1), Direction.South));

      /*******************
       2    # #
       1    S #
       0    R #

         -1 0 1 2 3
       *******************/
    });

    it("should cost the total distance to route around the proposed building", () => {
      expect(plan.cost).to.equal(4);
    });

    it("should route roads around the proposed building", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0, 2), c(1, 2)),
        road(c(1, 2), c(1, 0)),
        road(c(1, 0), c(0, 0))
      ]);
    });
  });

  describe("when there are obstacles in the way", () => {
    beforeEach(() => {
      map.buildingCoords.push(c(-1, 1));
      map.buildingCoords.push(c(0, 1));
      map.buildingCoords.push(c(1, 1));

      plan = planner.plan(map, new BasicHouse(c(0, 3), Direction.North));

      /*******************
       4
       3    S
       2    # # #
       1  b b b #
       0    R # #

         -1 0 1 2 3
       *******************/
    });

    it("should cost the total distance to route around them", () => {
      expect(plan.cost).to.equal(6);
    });

    it("should route roads around obstacles", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0, 2), c(2, 2)),
        road(c(2, 2), c(2, 0)),
        road(c(2, 0), c(0, 0))
      ]);
    });
  });

  describe("when the route would go outside the map's coords", () => {
    beforeEach(() => {
      var cellsWithHole = _.compact(_.combinations(_.range(-1, 10), _.range(-1, 10)).map((xy) => {
        var [x, y] = xy;
        var coord = new Coord(x, y);

        if (coord.x !== -1 && coord.y === 1) return null;
        else return { coord: new Coord(x, y) };
      }));
      map.getCells = () => cellsWithHole;

      plan = planner.plan(map, new BasicHouse(c(0, 2), Direction.East));

      /*******************
       3  # # #
       2  # S #
       1  # * * * * * * ... <-- holes in the map
       0  # R

         -1 0 1 2 3
       *******************/
    });

    it("should plan roads inside the map only", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(1, 2), c(1, 3)),
        road(c(1, 3), c(-1, 3)),
        road(c(-1, 3), c(-1, 0)),
        road(c(-1, 0), c(0, 0))
      ]);
    });
  });

  describe("when planning a initially half-connected multi-celled building", () => {
    beforeEach(() => {
      var building = new FancyHouse(c(-1, 1), c(-1, 0), Direction.East);
      plan = planner.plan(map, building);

      /*******************
       2
       1  S #
       0  S R

         -1 0 1 2
       *******************/
    });

    it("should plan the extra roads to full connect the building", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0, 1), c(0, 0))
      ]);
    });

    it("should calculate the cost for each cell required as normal", () => {
      expect(plan.cost).to.equal(1);
    });
  });

  describe("when planning an initially unconnected multi-celled building", () => {
    beforeEach(() => {
      var building = new FancyHouse(c(-1, 2), c(-1, 1), Direction.East);
      plan = planner.plan(map, building);

      /*******************
       2  S #
       1  S #
       0    R

         -1 0 1 2
       *******************/
    });

    it("should plan the extra roads to full connect the building", () => {
      expect(plan.roadsRequired).to.deep.equal([
        road(c(0, 2), c(0, 1)),
        road(c(0, 1), c(0, 0))
      ]);
    });

    it("should calculate the cost for each cell required as normal", () => {
      expect(plan.cost).to.equal(2);
    });
  });
});
