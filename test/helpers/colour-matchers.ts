declare module Chai {
  interface Assertion {
    rgbPixel(rgb: number[]): void;
    transparent(): void;
  }
}

define(["lodash"], function (_) {
  return function colourMatchers(chai) {
    chai.Assertion.addMethod('rgbPixel', function (colour) {
      var r = colour[0],
          g = colour[1],
          b = colour[2];

      var actualPixel = this._obj;

      var rgbString = 'RGB(' + r + ',' + g + ',' + b + ')';
      var expectedMessage    = 'expected #{this} to be ' + rgbString;
      var notExpectedMessage = 'expected #{this} to not seems like ' + rgbString;

      var result = _.isEqual([r, g, b, 255], actualPixel);

      this.assert(result, expectedMessage, notExpectedMessage);
    });

    chai.Assertion.addMethod('transparent', function () {
      var actualPixel = this._obj;

      var expectedMessage    = 'expected #{this} to be transparent';
      var notExpectedMessage = 'expected #{this} to not be transparent';

      var result = (actualPixel[3] === 0);

      this.assert(result, expectedMessage, notExpectedMessage);
    })
  };
});