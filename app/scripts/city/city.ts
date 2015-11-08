'use strict';

import _ = require("lodash");
import ko = require("knockout");

import subscribableEvent = require('subscribable-event');
import Map = require('city/map');
import Coord = require('city/coord');
import Cell = require('city/cell');
import CellType = require('city/cell-type');
import Direction = require('city/direction');

import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;

import RoadPart = require('city/roads/road-part');

import RoadPlanner = require('city/roads/road-planner');

import BasicHouse = require('city/buildings/basic-house');

function canonicalForm(building: Building) {
  var data = building.serialize();
  data.coords = _.sortBy(data.coords, (coord) => JSON.stringify(coord));
  return JSON.stringify(data);
}

const GridRoadPlanner = new RoadPlanner();

// Handles setup and defines the external API of the city model
class City {
  private cellFactory: (Coord) => Cell;
  private map: Map;
  private roadPlanner: RoadPlanner;

  constructor() {
    this.cellFactory = (coord: Coord) => new Cell(coord, CellType.Grass);
    this.map = new Map(this.cellFactory);
    this.roadPlanner = GridRoadPlanner;

    ko.track(this);
  }

  getCells(): Cell[] {
    return this.map.getCells();
  }

  getBuildings(): Building[] {
    return this.map.getBuildings();
  }

  getRoads(): RoadPart[] {
    var allRoadParts = _.flatten(this.map.getRoads().map((r) => r.parts));

    var roadPartsByCoord = _.groupBy(allRoadParts, (rp) => rp.coord);

    var roadParts = _.map(roadPartsByCoord, (parts) => _.reduce(parts, (nextPart, combinedPart) => {
      return combinedPart.combinedWith(nextPart);
    }, parts[0]));

    return roadParts;
  }

  private getPossibleNewBuildings(): Building[] {
    var buildingCoords = _(this.getBuildings()).pluck('coords').flatten().value();
    var buildableCells = _.reject(this.getCells(), (cell) => this.map.getBuildingAt(cell.coord) ||
                                                             this.map.getRoadAt(cell.coord));

    return _(buildableCells).map((cell) => [new BasicHouse(cell.coord, Direction.North),
                                            new BasicHouse(cell.coord, Direction.South),
                                            new BasicHouse(cell.coord, Direction.East),
                                            new BasicHouse(cell.coord, Direction.West)])
                            .flatten().value();
  }

  private getPossibleBuildingUpgrades(): Building[] {
    return _(this.getBuildings()).map((building) => building.getPotentialUpgrades())
                                 .flatten()
                                 .unique((building: Building) => JSON.stringify(canonicalForm(building)))
                                 .filter((building) => building.canBeBuiltOn(this.map))
                                 .value();
  }

  getPossibleUpgrades(): Building[] {
    return this.getPossibleNewBuildings()
               .concat(this.getPossibleBuildingUpgrades())
               .filter((building) => this.roadPlanner.getCost(this.map, building) < Number.POSITIVE_INFINITY);
  }

  onChanged = subscribableEvent();

  construct(building: Building): void {
    if (!building.canBeBuiltOn(this.map)) {
      throw new Error("Attempt to build invalid building: " + JSON.stringify(building));
    }

    building.coords.map((coord) => this.map.getBuildingAt(coord))
                   .filter((existingBuilding) => existingBuilding !== undefined)
                   .forEach((existingBuilding) => this.map.remove(existingBuilding));

    this.map.construct(building);

    var requiredRoads = this.roadPlanner.getRoadsRequired(this.map, building);
    requiredRoads.forEach((road) => this.map.addRoad(road));

    this.onChanged.trigger();
  }

  remove(building: Building): void {
    this.map.remove(building);
    this.onChanged.trigger();
  }

  updateFromJSON(json: string): void {
    var data = JSON.parse(json);
    this.map = Map.deserialize(data.map, this.cellFactory);
  }

  toJSON(): string {
    return JSON.stringify({
      map: this.map.serialize()
    });
  }
}

export = City;