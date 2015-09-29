import searchGraph = require('generic-structures/search-graph');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;
import Map = require('city/map');

import RoadEdge = require('city/roads/road-edge');
import SpecificRoadEdge = require('city/roads/specific-road-edge');

class RoadPlanner {
  constructor(private map: Map) { }

  getCost(building: Building): number {
    var route = this.getRoute(building);

    if (route !== null) return route.length - 1;
    else return Number.POSITIVE_INFINITY;
  }

  private getRoute(building: Building): Coord[] {
    let exitCoords = building.coords.map((c) => c.getNeighbour(building.direction));

    // If either exit is totally blocked, we immediately fail outright
    for (let exitCoord of exitCoords) {
      if (!!this.map.getBuildingAt(exitCoord)) return null;
    }

    var mapCellCoords = this.map.getCells().map((c) => c.coord);

    var goal = (c: Coord) => !!this.map.getRoadAt(c);
    var obstacles = (c: Coord) => !!this.map.getBuildingAt(c) ||
                                  _.containsEqual(building.coords, c) ||
                                  !_.containsEqual(mapCellCoords, c);
    var coordCost = () => 1;
    var heuristic = () => 0;

    return searchGraph(goal, obstacles, coordCost, heuristic, exitCoords);
  }

  getRoadsRequired(building: Building): RoadEdge[] {
    var route = this.getRoute(building);
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
}

export = RoadPlanner;