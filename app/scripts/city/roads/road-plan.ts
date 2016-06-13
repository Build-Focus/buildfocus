import RoadEdge = require('city/roads/road-edge');
import SpecificRoadEdge = require('city/roads/specific-road-edge');

import {CostedRoute} from "city/roads/costed-route";

class RoadPlan {
    constructor(private routes: CostedRoute[]) {
        if (routes === null) {
            throw new Error(
                "Can't create a plan with null routes (try RoadPlan.ImpossibleRoadPlan?)"
            );
        }
    }

    get cost(): number {
        return _.sum(this.routes, (r) => r.cost);
    }

    get roadsRequired(): RoadEdge[] {
        return _.reduceRight(this.routes, (roadsRequired: RoadEdge[], route: CostedRoute) => {
          if (route.length === 0 || route.length === 1) return roadsRequired;

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

          return roadsRequired.concat(roads);
        }, []);
    }

    static get ImpossibleRoadPlan(): RoadPlan {
        var plan = { cost: Infinity };
        Object.defineProperty(plan, 'roadsRequired', {
            get: () => {
                throw new Error("Can't get roads for an impossible road plan")
            }
        });
        return <RoadPlan> plan;
    }
}

export = RoadPlan;
