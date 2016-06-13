import searchGraph = require('generic-structures/search-graph');

import Coord = require('city/coord');
import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;
import Map = require('city/map');

import {CostedRoute} from 'city/roads/costed-route';
import RoadPlan = require('city/roads/road-plan');

class RoadPlanner {
  constructor(private costFunction: (c: Coord) => number = () => 1,
              private heuristic: (c: Coord) => number = () => 0) { }

  plan(map: Map, building: Building): RoadPlan {
    let exitCoords = building.coords.map((c) => c.getNeighbour(building.direction));

    // If any exit is totally blocked, we immediately fail outright
    for (let exitCoord of exitCoords) {
      if (!!map.getBuildingAt(exitCoord)) return RoadPlan.ImpossibleRoadPlan;
    }

    var mapCellCoords = map.getCells().map((c) => c.coord);
    var obstacles = (c: Coord) => !!map.getBuildingAt(c) ||
                                  _.containsEqual(building.coords, c) ||
                                  !_.containsEqual(mapCellCoords, c);

    // Each step of the route is done if it can join the roads, or roads we
    // already want to add as part of the rest of the route
    var routes: CostedRoute[] = [];
    var routeCoords = () => _.flatten(routes);
    var goal = (c: Coord) => !!map.getRoadAt(c) || !!_.containsEqual(routeCoords(), c);
    var getNextRoute = _.partial(searchGraph, goal, obstacles, this.costFunction, this.heuristic);

    var remainingExits = () => _.reject(exitCoords, (c) => _.containsEqual(routeCoords(), c));

    while (!_.isEmpty(remainingExits())) {
      let nextRoute = getNextRoute(remainingExits());
      if (nextRoute === null || nextRoute.cost === Infinity) {
        return RoadPlan.ImpossibleRoadPlan;
      }
      else routes.push(nextRoute);
    }

    return new RoadPlan(routes);
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
