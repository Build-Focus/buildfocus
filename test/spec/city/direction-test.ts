'use strict';

define(["lodash", "city/direction"], function (_, Direction) {
  describe('Direction', () => {
    it('should rotate right', () => {
      expect(Direction.rightOf(Direction.North)).to.equal(Direction.East);
    });

    it('should rotate left', () => {
      expect(Direction.leftOf(Direction.North)).to.equal(Direction.West);
    });

    it('should rotate correctly right 360', () => {
      var startDirection = Direction.North;

      var direction = startDirection;
      _.times(4, () => direction = Direction.rightOf(direction));

      expect(direction).to.equal(startDirection);
    });

    it('should rotate correctly left 360', () => {
      var startDirection = Direction.North;

      var direction = startDirection;
      _.times(4, () => direction = Direction.leftOf(direction));

      expect(direction).to.equal(startDirection);
    });
  });
});