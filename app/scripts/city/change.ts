import Buildings = require('city/buildings/buildings');
import Building = Buildings.Building;
import serialization = require('city/serialization/serialization-format');

export enum Type {
  Created,
  Destroyed
}

export class Change {
  constructor(private _type: Type, private _building: Building) { }

  get type(): Type { return this._type; };
  get building(): Building { return this._building; };

  serialize(): serialization.ChangeData {
    return { type: this.type, building: this.building.serialize() };
  }

  static deserialize(data: serialization.ChangeData): Change {
    if (data === null) return nullChange;

    return new Change(data.type, Buildings.deserialize(data.building));
  }
}

class NullChange extends Change {
  constructor() {
    super(null, null);
  }

  get type(): Type { throw new Error("Cannot get type from null change"); }
  get building(): Building { throw new Error("Cannot get building from null change"); }

  serialize(): serialization.ChangeData { return null; }
}

export var nullChange = new NullChange();