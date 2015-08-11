enum Direction {
  North,
  East,
  South,
  West
}

function positiveModulus(x, n) {
  return ((x % n) + n) % n;
}

module Direction {
  export function rightOf(direction: Direction): Direction {
    return positiveModulus((direction + 1), 4);
  }
  export function leftOf(direction: Direction): Direction {
    return positiveModulus((direction - 1), 4);
  }
}

export = Direction;