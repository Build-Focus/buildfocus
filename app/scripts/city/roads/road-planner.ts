import searchGraph = require('generic-structures/search-graph');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;
import Map = require('city/map');

import RoadEdge = require('city/roads/road-edge');
import SpecificRoadEdge = require('city/roads/specific-road-edge');

class RoadPlanner {
  constructor(private costFunction: (c: Coord) => number = () => 1,
              private heuristic: (c: Coord) => number = () => 0) { }

  getCost(map: Map, building: Building): number {
    var route = this.getRoute(map, building);

    if (route !== null) return route.cost;
    else return Number.POSITIVE_INFINITY;
  }

  private getRoute(map: Map, building: Building) {
    let exitCoords = building.coords.map((c) => c.getNeighbour(building.direction));

    // If either exit is totally blocked, we immediately fail outright
    for (let exitCoord of exitCoords) {
      if (!!map.getBuildingAt(exitCoord)) return null;
    }

    var mapCellCoords = map.getCells().map((c) => c.coord);

    var goal = (c: Coord) => !!map.getRoadAt(c);
    var obstacles = (c: Coord) => !!map.getBuildingAt(c) ||
                                  _.containsEqual(building.coords, c) ||
                                  !_.containsEqual(mapCellCoords, c);

    return searchGraph(goal, obstacles, this.costFunction, this.heuristic, exitCoords);
  }

  getRoadsRequired(map: Map, building: Building): RoadEdge[] {
    var route = this.getRoute(map, building);
    if (!route) return null;
    if (route.length === 0 || route.length === 1) return [];

    var roads: SpecificRoadEdge[] = [];

    var firstCoordOfCurrentRoad = route[0];
    var previousCoord = route[0];

    for (let nextCoord of route) {
      if (firstCoordOfCurrentRoad.x !== nextCoord.x && firstCoordOfCurrentRoad.y !== nextCoord.y) {
        roads.push(new SpecificRoadEdge(firstCoordOfCurrentRoad, previousCoord));
        firstCoordOfCurrentRoad = previousCoord;
      }
      previousCoord = nextCoord;
    }
    roads.push(new SpecificRoadEdge(firstCoordOfCurrentRoad, previousCoord));

    return roads;
  }

  static SimpleRoadPlanner = new RoadPlanner();

  static GridRoadPlanner = new RoadPlanner((coord: Coord) => {
    var onXGrid = (coord.x % 3) === 0;
    var onYGrid = (coord.y % 2) === 0;

    if (!onXGrid && !onYGrid) return 100;
    if (!onXGrid || !onYGrid) return 10;
    else return 0.5;
  });
}

export = RoadPlanner;