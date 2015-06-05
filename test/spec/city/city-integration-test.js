/* global describe, it */

(function () {
  'use strict';

  var ko;
  var City;

  describe('City Integration - City ', function () {
    before(function (done) {
      require(["knockout", "city/city"], function (loadedKo, loadedClass) {
        City = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    it('', function () {
    });
  });
})();