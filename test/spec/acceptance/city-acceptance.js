/* global describe, it */

(function () {
  'use strict';

  var clockStub;

  describe('Acceptance: City', function () {
    before(function (done) {
      // Have to wait a little to let require load, and need to stub clock only after that
      setTimeout(function () {
        clockStub = sinon.useFakeTimers();
        done();
      }, 500);
    });

    after(function () {
      clockStub.restore();
    });

    it('', function () {
    });
  });
})();