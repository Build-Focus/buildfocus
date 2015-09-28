import Coord = require('app/scripts/city/coord');
import Graph = require('app/scripts/generic-structures/graph');

function c(x: number, y: number): Coord {
  return new Coord(x, y);
}

function always<T>(value: T): () => T {
  return () => value;
}

function matchOnly(goalCoord: Coord): (c: Coord) => boolean {
  return ((c) => goalCoord.x === c.x && goalCoord.y === c.y);
}

describe("Graph", () => {
  it("can find a one step route", () => {
    var graph = new Graph(matchOnly(c(1, 0)), always(false), always(1), always(0));

    var route = graph.getRouteFrom(c(0, 0));

    expect(route).to.deep.equal([c(0, 0), c(1, 0)]);
  });

  it("can find a two step route", () => {
    var graph = new Graph(matchOnly(c(0, -2)), always(false), always(1), always(0));

    var route = graph.getRouteFrom(c(0, 0));

    expect(route).to.deep.equal([c(0, 0), c(0, -1), c(0, -2)]);
  });

  it("can route around obstacles", () => {
    var graph = new Graph(matchOnly(c(0, -2)), matchOnly(c(0, -1)), always(1), always(0));

    var route = graph.getRouteFrom(c(0, 0));

    expect(route).to.deep.equal([c(0, 0), c(1, 0), c(1, -1), c(1, -2), c(0, -2)]);
  });

  it("returns null if there's no route available", () => {
    var rejectAllOutsideCenter = (coord: Coord) => Math.abs(coord.x) < 2 && Math.abs(coord.y) < 2;
    var graph = new Graph(matchOnly(c(10, 10)), rejectAllOutsideCenter, always(1), always(0));

    var route = graph.getRouteFrom(c(0, 0));

    expect(route).to.equal(null);
  });

  it("avoids overly expensive routes", () => {
    var oneExpensiveSquare = (coord: Coord) => coord.x === 0 && coord.y === -1 ? 4 : 1;
    var graph = new Graph(matchOnly(c(0, -2)), always(false), oneExpensiveSquare, always(0));

    var route = graph.getRouteFrom(c(0, 0));

    expect(route).to.deep.equal([c(0, 0), c(1, 0), c(1, -1), c(1, -2), c(0, -2)]);
  });

  it("never explores the wrong cells, if given a good heuristic", () => {
    var manhattanDistanceToGoal = (c: Coord) => Math.abs(10 - c.x) + Math.abs(10 - c.y);
    var goalCheckStub = sinon.spy(matchOnly(c(10, 10)));
    var graph = new Graph(goalCheckStub, always(false), always(1), manhattanDistanceToGoal);

    var route = graph.getRouteFrom(c(0, 0));

    var expandedCoords: Coord[] = goalCheckStub.args.map((args) => args[0]);
    expect(_.findWhere(expandedCoords, c(5, 5))).not.to.equal(undefined);
    expect(_.findWhere(expandedCoords, c(-2, -2))).to.equal(undefined);
  });
});