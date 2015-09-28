import _ = require('lodash');
import Heap = require('heap');

import Coord = require('city/coord');

interface CostedCoord {
  coord: Coord;
  cost: number;
}

class Graph {
  // Note that this algorithm *requires* that the heuristic be consistent (never decreasing)
  constructor(private goalTest: (c: Coord) => boolean,
              private obstacleTest: (c: Coord) => boolean,
              private coordCost: (c: Coord) => number,
              private heuristic: (c: Coord) => number) { }

  // *Lots* of potential perf optimizations here, particularly to stop fully searching exploredCoords from
  // scratch, to stop recalculating coord costs all the time (in calculateCoordCost), and to track backpointers
  // so that backtracking becomes trivial
  getRouteFrom(...startCoords: Coord[]): Coord[] {
    // Coords already explored, thus having a known cost from a start point
    var exploredCoords: CostedCoord[] = [];

    // Coords 'fringe' - the next set of coords to look at, in a heap sorted by their estimated costs
    var explorableCoords: Heap<CostedCoord> = new Heap<CostedCoord>((c1, c2) => c1.cost - c2.cost);
    startCoords.forEach((c) => explorableCoords.push({ coord: c, cost: this.heuristic(c) }));

    while (!explorableCoords.empty()) {
      let current = explorableCoords.pop();
      let currentCoord = current.coord;

      if (this.goalTest(currentCoord)) {
        return this.backtrackToGetRoute(currentCoord, exploredCoords, startCoords);
      }

      let finalCost = _.contains(startCoords, currentCoord) ? 0 : this.calculateCoordCost(currentCoord, exploredCoords);

      let unexploredNeighbours = currentCoord.getDirectNeighbours()
                                             .filter((c) => !_.findWhere(exploredCoords, { coord: c }));

      // Add all unexplored neighbours to explorable, with initial cost estimates
      for (let neighbour of unexploredNeighbours) {
        if (this.obstacleTest(neighbour)) continue;

        let estimatedCost = finalCost + this.coordCost(neighbour) + this.heuristic(neighbour);
        let currentExplorable = _.findWhere(explorableCoords.toArray(), { coord: neighbour });

        if (currentExplorable) {
          if (currentExplorable.cost > estimatedCost) {
            currentExplorable.cost = estimatedCost;
            explorableCoords.updateItem(currentExplorable);
          }
        } else {
          explorableCoords.push({coord: neighbour, cost: estimatedCost});
        }
      }

      exploredCoords.push({ coord: currentCoord, cost: finalCost });
    }

    return null;
  }

  private calculateCoordCost(coord: Coord, exploredCoords: CostedCoord[]): number {
    let neighbours = coord.getDirectNeighbours();

    let minNeighbourCost = neighbours.reduce((minCost, neighbour) => {
      let exploredResult = _.findWhere(exploredCoords, { coord: neighbour });
      if (exploredResult) return Math.min(minCost, exploredResult.cost);
      else return minCost;
    }, Number.POSITIVE_INFINITY);

    return minNeighbourCost + this.coordCost(coord);
  }

  private backtrackToGetRoute(currentCoord: Coord, exploredCoords: CostedCoord[], startCoords: Coord[]): Coord[] {
    let route = [currentCoord];
    let previous = currentCoord;

    while (!_.findWhere(startCoords, previous)) {
      let neighbours = previous.getDirectNeighbours();
      let exploredNeighbours = neighbours.map((neighbour) => _.findWhere(exploredCoords, {coord: neighbour}))
                                         .filter((exploredResult) => !!exploredResult);

      previous = _.min(exploredNeighbours, (exploredResult) => {
        return exploredResult.cost;
      }).coord;

      route.push(previous);
    }

    return route.reverse();
  }
}

export = Graph;