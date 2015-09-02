declare module Chai {
  interface Assertion {
    approx(value: number, percentage?: number): void;
  }
}

define(["lodash"], function (_) {
  return function approxMatcher(chai) {
    chai.Assertion.addMethod('approx', function (value: number, percentage: number = 20) {
      var actualValue = this._obj;

      var expectedMessage    = `expected #{this} to be within ${percentage}% of ${value}`;
      var notExpectedMessage = `expected #{this} not to be within ${percentage}% of ${value}`;

      var upperBound = value * (1 + percentage/100);
      var lowerBound = value * (1 - percentage/100);

      var result = lowerBound <= actualValue && actualValue <= upperBound;

      this.assert(result, expectedMessage, notExpectedMessage);
    });
  };
});