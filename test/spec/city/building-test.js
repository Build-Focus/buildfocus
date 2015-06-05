/* global describe, it */

(function () {
  'use strict';

  var ko;
  var Building;

  describe('Building', function () {
    before(function (done) {
      require(["knockout", "city/cell"], function (loadedKo, loadedClass) {
        Building = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    it('', function () {
    });
  });
})();