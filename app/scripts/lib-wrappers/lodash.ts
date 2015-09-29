'use strict';

interface Equalable {
  equals(other: any): boolean;
}

declare module _ {
  interface LoDashStatic {
    containsEqual<T extends Equalable>(objectArray: T[], object: T): boolean;
  }
}

define(["raw-lodash"], function (_) {
  _.containsEqual = function <T extends Equalable>(objectArray: T[], objectWanted: T): boolean {
    for (let object of objectArray) {
      if (objectWanted.equals(object)) return true;
    }

    return false;
  };

  return _;
});