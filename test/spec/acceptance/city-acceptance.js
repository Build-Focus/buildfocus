/* global describe, it, xit */

define(["jquery", "createjs", "knockout", "city/city", "city/rendering/city-renderer"],
  function ($, easeljs, ko, City, CityRenderer) {
    'use strict';

    function render(city) {
      var element = $("<div data-bind='render: render'></div>")[0];

      ko.applyBindings(new CityRenderer(city), element);

      return $(element).find("canvas")[0];
    }

    describe.only('Acceptance: City', function () {
      it("should render a building", function () {
        var city = new City();

        city.construct(city.getPossibleUpgrades()[0]);
        var canvas = render(city);

        return expect(canvas).to.soon.be.image("expected-images/single-building.png");
      });

      xit("should show an empty cell correctly", function () { });

      xit("should show a single building correctly", function () { });

      xit("should render a block correctly", function () { });

      xit("should be scaled to the size available", function () { });
    });
  }
);