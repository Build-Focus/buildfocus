import _ = require('lodash');
import Heap = require('heap');

import Coord = require('city/coord');

interface CostedCoord {
  coord: Coord;
  cost: number;
}

interface CostedRoute extends Array<Coord> {
  cost: number;
}

function findCostedCoord(costedCoordArray: CostedCoord[], coordWanted: Coord): CostedCoord {
  for (let costedCoord of costedCoordArray) {
    if (costedCoord.coord.equals(coordWanted)) return costedCoord;
  }
  return undefined;
}

function containsCostedCoord(costedCoordArray: CostedCoord[], coordWanted: Coord): boolean {
  return !!findCostedCoord(costedCoordArray, coordWanted);
}

// *Lots* of potential perf optimizations here, particularly to stop fully searching exploredCoords from
// scratch, to stop recalculating coord costs all the time (in calculateCoordCost), and to track backpointers
// so that backtracking becomes trivial
function searchGraph(goalTest: (c: Coord) => boolean,
                     obstacleTest: (c: Coord) => boolean,
                     coordCost: (c: Coord) => number,
                     heuristic: (c: Coord) => number,
                     startCoords: Coord[]): CostedRoute {
  // Coords already explored, thus having a known cost from a start point
  var exploredCoords: CostedCoord[] = [];

  // Coords 'fringe' - the next set of coords to look at, in a heap sorted by their estimated costs
  var explorableCoords: Heap<CostedCoord> = new Heap<CostedCoord>((c1, c2) => c1.cost - c2.cost);
  startCoords.forEach((c) => explorableCoords.push({ coord: c, cost: heuristic(c) }));

  while (!explorableCoords.empty()) {
    let currentCoord = explorableCoords.pop().coord;

    let finalCost = _.containsEqual(startCoords, currentCoord) ?
                    0 : (getCheapestNeighbourCost(currentCoord, exploredCoords) + coordCost(currentCoord));

    if (goalTest(currentCoord)) {
      var route = backtrackToGetRoute(currentCoord, exploredCoords, startCoords);

      var nonStartCoords = route.filter((c) => !_.containsEqual(startCoords, c));
      var cost = _.sum(nonStartCoords, coordCost);

      // TODO: Use new intersection types to improve Lodash types here
      return <CostedRoute> _.merge(route, { cost: cost });
    }

    let unexploredNeighbours = currentCoord.getDirectNeighbours()
                                           .filter((c) => !containsCostedCoord(exploredCoords, c));

    // Add all unexplored neighbours to explorable, with initial cost estimates
    for (let neighbour of unexploredNeighbours) {
      if (obstacleTest(neighbour)) continue;

      let estimatedCost = finalCost + coordCost(neighbour) + heuristic(neighbour);
      let currentExplorable = findCostedCoord(explorableCoords.toArray(), neighbour);

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

function getCheapestNeighbourCost(coord: Coord, exploredCoords: CostedCoord[]): number {
  let neighbours = coord.getDirectNeighbours();

  let minNeighbourCost = neighbours.reduce((minCost, neighbour) => {
    let exploredResult = findCostedCoord(exploredCoords, neighbour);
    if (exploredResult) return Math.min(minCost, exploredResult.cost);
    else return minCost;
  }, Number.POSITIVE_INFINITY);

  return minNeighbourCost;
}

function backtrackToGetRoute(currentCoord: Coord, exploredCoords: CostedCoord[], startCoords: Coord[]): Coord[] {
  let route = [currentCoord];
  let previous = currentCoord;

  while (!_.containsEqual(startCoords, previous)) {
    let neighbours = previous.getDirectNeighbours();
    let exploredNeighbours = neighbours.map((neighbour) => findCostedCoord(exploredCoords, neighbour))
                                       .filter((exploredResult) => !!exploredResult);

    previous = _.min(exploredNeighbours, (exploredResult) => {
      return exploredResult.cost;
    }).coord;

    route.push(previous);
  }

  return route.reverse();
}

export = searchGraph;