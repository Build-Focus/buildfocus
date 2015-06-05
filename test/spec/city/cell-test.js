/* global describe, it */

(function () {
  'use strict';

  var ko;
  var Cell;

  describe('Cell', function () {
    before(function (done) {
      require(["knockout", "city/cell"], function (loadedKo, loadedClass) {
        Cell = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    it('', function () {
    });
  });
})();