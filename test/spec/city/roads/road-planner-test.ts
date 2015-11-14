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

function c(x: number, y: number): Coord {
  return new Coord(x, y);
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

describe("Road planner", () => {
  describe("cost calculations", () => {
    it("should reject buildings where the exit is blocked", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.buildingCoords.push(c(0, -1));
      var cost = planner.getCost(map, new BasicHouse(c(0, 0), Direction.North));

      expect(cost).to.equal(Number.POSITIVE_INFINITY);
    });

    it("should reject multi-coord buildings where either cell's exit is blocked", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.buildingCoords.push(c(1, 1));
      var cost = planner.getCost(map, new FancyHouse(c(0, 0), c(0, 1), Direction.East));

      expect(cost).to.equal(Number.POSITIVE_INFINITY);
    });

    it("should return 0 for buildings already connected to roads", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.roadCoord = c(0, -1);
      var cost = planner.getCost(map, new BasicHouse(c(0, 0), Direction.North));

      expect(cost).to.equal(0);
    });

    it("should return 1 for a building one step from being connected", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      var cost = planner.getCost(map, new BasicHouse(c(2, 0), Direction.West));

      expect(cost).to.equal(1);
    });

    it("should track distances routing around obstacles for buildings that are clearly not connected", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.buildingCoords.push(c(-1, 1));
      map.buildingCoords.push(c(0, 1));
      map.buildingCoords.push(c(1, 1));
      var cost = planner.getCost(map, new BasicHouse(c(0, 3), Direction.South));

      /*******************
       4    # #
       3    s #
       2      # #
       1  b b b #
       0    r # #

         -1 0 1 2 3
       *******************/
      expect(cost).to.equal(8);
    });

    // TODO: Deal with generating multiple exit-coord routes in the happy case
    it("should return the maximum distance for multi-cell buildings only half connected to roads");
  });

  describe("route planning", () => {
    it("should return null for immediately blocked buildings", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.buildingCoords.push(c(0, -1));
      var roads = planner.getRoadsRequired(map, new BasicHouse(c(0, 0), Direction.North));

      expect(roads).to.deep.equal(null);
    });

    it("should return null for impossible to connect buildings", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.buildingCoords.push(c(0, -1));
      map.buildingCoords.push(c(-1, 0));
      map.buildingCoords.push(c(1, 0));
      map.buildingCoords.push(c(-1, 1));
      map.buildingCoords.push(c(1, 1));
      map.buildingCoords.push(c(0, 2));
      var roads = planner.getRoadsRequired(map, new BasicHouse(c(0, 0), Direction.South));

      expect(roads).to.deep.equal(null);
    });

    it("should return an empty route for already connected buildings", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.roadCoord = c(0, -1);
      var roads = planner.getRoadsRequired(map, new BasicHouse(c(0, 0), Direction.North));

      expect(roads).to.deep.equal([]);
    });

    it("should return a valid road edge to connect to the nearest road", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      var roads = planner.getRoadsRequired(map, new BasicHouse(c(0, 2), Direction.North));

      expect(roads).to.deep.equal([new SpecificRoadEdge(c(0, 1), c(0, 0))]);
    });

    it("should return multiple road edges if corners are required", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      var roads = planner.getRoadsRequired(map, new BasicHouse(c(2, 1), Direction.West));

      expect(roads).to.deep.equal([new SpecificRoadEdge(c(1, 1), c(1, 0)),
                                   new SpecificRoadEdge(c(1, 0), c(0, 0))]);
    });

    it("should handle complicated route cases with a series of corners", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      map.buildingCoords.push(c(11, 0));
      var roads = planner.getRoadsRequired(map, new BasicHouse(c(10, 5), Direction.East));

      expect(roads).to.deep.equal([new SpecificRoadEdge(c(11, 5), c(11, 1)),
                                   new SpecificRoadEdge(c(11, 1), c(10, 1)),
                                   new SpecificRoadEdge(c(10, 1), c(10, 0)),
                                   new SpecificRoadEdge(c(10, 0), c(0, 0))]);
    });

    it("should run routes around the hypothetical building proposed", () => {
      var map = mapStub();
      var planner = new RoadPlanner(() => 1);

      var roads = planner.getRoadsRequired(map, new BasicHouse(c(0, 2), Direction.South));

      expect(roads).to.deep.equal([new SpecificRoadEdge(c(0, 3), c(1, 3)),
                                   new SpecificRoadEdge(c(1, 3), c(1, 0)),
                                   new SpecificRoadEdge(c(1, 0), c(0, 0))]);
    });

    it("should not create routes outside the map's coords", () => {
      var map = mapStub();
      var cellsWithHole = _.compact(_.combinations(_.range(0, 10), _.range(0, 10)).map((xy) => {
        var [x, y] = xy;
        if (x === 0 && y === 1) return null;
        else return { coord: new Coord(xy[0], xy[1]) };
      }));
      map.getCells = () => cellsWithHole;
      var planner = new RoadPlanner(() => 1);

      var roads = planner.getRoadsRequired(map, new BasicHouse(c(0, 3), Direction.North));

      expect(roads).to.deep.equal([new SpecificRoadEdge(c(0, 2), c(1, 2)),
                                   new SpecificRoadEdge(c(1, 2), c(1, 0)),
                                   new SpecificRoadEdge(c(1, 0), c(0, 0))]);
    });

    // TODO: Deal with generating multiple exit-coord routes in the happy case
    it("should return a route that reaches both cells for multi-cell buildings only half connected to roads");
  })
});