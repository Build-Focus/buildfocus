enum RoadPartType {
  // Four directions each represented by a bit flag
  EndFromNorth = 1,
  EndFromEast = 2,
  EndFromSouth = 4,
  EndFromWest = 8,

  // Every other value comes directly from the combination of the bit flags above
  NorthAndEastCorner = 3,
  EastAndSouthCorner = 6,
  SouthAndWestCorner = 12,
  WestAndNorthCorner = 9,

  StraightEastWest = 10,
  StraightNorthSouth = 5,

  NorthEastSouthJunction = 7,
  EastSouthWestJunction = 14,
  SouthWestNorthJunction = 13,
  WestNorthEastJunction = 11,

  Crossroads = 15
}

module RoadPartType {
  export function combine(typeA: RoadPartType, typeB: RoadPartType): RoadPartType {
    return typeA | typeB;
  }

  export function allValues(): RoadPartType[] {
    return (<any[]> Object.keys(RoadPartType)).filter((t) => !isNaN(t))
                                              .map((t) => parseInt(t, 10));
  }
}

export = RoadPartType;