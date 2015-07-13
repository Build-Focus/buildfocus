/* global describe, it */

(function () {
  'use strict';

  var ko;
  var _;

  var Cell;
  var Building;
  var BuildingType;

  var City;

  describe('City Integration - City', function () {
    before(function (done) {
      require(["knockout", "lodash", "city/city", "city/cell",
               "city/building", "city/building-type"],
        function (loadedKo, loadedLodash, loadedCityClass, loadedCellClass,
                  loadedBuildingClass, loadedBuildingTypes) {
          City = loadedCityClass;
          Cell = loadedCellClass;
          Building = loadedBuildingClass;
          BuildingType = loadedBuildingTypes;
          ko = loadedKo;
          _ = loadedLodash;
          done();
        }
      );
    });

    it('should start with one empty cell', function () {
      var city = new City();

      expect(city.getCells().length).to.equal(1);
      expect(city.getBuildings().length).to.equal(0);
    });

    it('should construct provided buildings', function () {
      var city = new City();
      var onlyCell = city.getCells()[0];

      var building = new Building([onlyCell], BuildingType.BasicHouse);
      city.construct(building);

      expect(city.getBuildings()).to.deep.equal([building]);
    });

    function asCoords(cells) {
      return _(cells).pluck('coord').map(function (coord) {
        return [coord.x, coord.y];
      }).value();
    }

    it('should add new surrounding cells after the first building is added', function () {
      var city = new City();
      var onlyCell = city.getCells()[0];

      city.construct(new Building([onlyCell], BuildingType.BasicHouse));

      expect(asCoords(city.getCells()).sort()).to.deep.equal([
        [-1, -1], [0, -1], [1, -1],
        [-1, 0],  [0, 0],  [1, 0],
        [-1, 1],  [0, 1],  [1, 1]
      ].sort());
    });
  });
})();