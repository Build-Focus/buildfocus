import _ = require('lodash');

class WeightedValue<T> {
  constructor(private _value: T, private _weight: number) { }

  get value() {
    return this._value;
  }

  get weight() {
    return this._weight;
  }
}

class WeightedList<T> {
  private weightedValues: WeightedValue<T>[] = [];

  push(value: T, weight: number) {
    this.weightedValues.push(new WeightedValue(value, weight));
  }

  get length(): number {
    return this.weightedValues.length;
  }

  private get totalWeight(): number {
    return _.sum(this.weightedValues, 'weight');
  }

  get(): T {
    var randomWeightedPosition = Math.random() * this.totalWeight;

    var cumulativeWeight = 0;

    for (var weightedValue of this.weightedValues) {
      cumulativeWeight += weightedValue.weight;

      if (cumulativeWeight >= randomWeightedPosition) {
        return weightedValue.value;
      }
    }
    return null;
  }
}

export = WeightedList;