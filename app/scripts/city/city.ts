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
import CostedBuilding = Buildings.CostedBuilding;

import RoadPart = require('city/roads/road-part');

import RoadPlanner = require('city/roads/road-planner');

import BasicHouse = require('city/buildings/basic-house');

import serialization = require('city/serialization/serialization-format');

function canonicalForm(building: Building) {
  var data = building.serialize();
  data.coords = _.sortBy(data.coords, (coord) => JSON.stringify(coord));
  return JSON.stringify(data);
}

// Handles setup and defines the external API of the city model
class City {
  private cellFactory: (Coord) => Cell;
  private map: Map;
  private roadPlanner: RoadPlanner;

  constructor() {
    this.cellFactory = (coord: Coord) => new Cell(coord, CellType.Grass);
    this.map = new Map(this.cellFactory);
    this.roadPlanner = RoadPlanner.GridRoadPlanner;

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
                                 .unique(canonicalForm)
                                 .filter((building) => building.canBeBuiltOn(this.map))
                                 .value();
  }

  getPossibleUpgrades(): Buildings.CostedBuilding[] {
    return this.getPossibleNewBuildings()
               .concat(this.getPossibleBuildingUpgrades())
               .map((building) => { return {
                 building: building,
                 cost: this.roadPlanner.getCost(this.map, building)
               } })
               .filter((upgrade) => upgrade.cost < Number.POSITIVE_INFINITY);
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

  updateFromJSON(data: serialization.CityData): void {
    this.map = Map.deserialize(data.map, this.cellFactory);
  }

  toJSON(): serialization.CityData {
    return {
      map: this.map.serialize(),
      version: 1
    };
  }
}

export = City;