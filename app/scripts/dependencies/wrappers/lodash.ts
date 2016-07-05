'use strict';

interface Equalable {
  equals(other: any): boolean;
}

declare module _ {
  interface LoDashStatic {
    containsEqual<T extends Equalable>(objectArray: T[], object: T): boolean;
    combinations<A, B>(arrayA: A[], arrayB: B[]): [A, B][];
  }
}

define(["raw-lodash"], function (_) {
  _.containsEqual = function <T extends Equalable>(objectArray: T[], objectWanted: T): boolean {
    for (let object of objectArray) {
      if (objectWanted.equals(object)) return true;
    }

    return false;
  };

  _.combinations = function <A, B>(arrayA: A[], arrayB: B[]): [A, B][] {
    var result: [A, B][] = [];
    for (let a of arrayA) {
      for (let b of arrayB) {
        result.push([a, b]);
      }
    }
    return result;
  };

  return _;
});