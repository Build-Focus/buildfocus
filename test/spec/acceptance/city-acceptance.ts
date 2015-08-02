/* global describe, it */

define(["jquery", "createjs", "knockout", "city/city", "city/rendering/city-renderer"],
  function ($, easeljs, ko, City, CityRenderer) {
    'use strict';

    function render(city) {
      var element = document.createElement("div");
      testDiv.appendChild(element);
      element.setAttribute("data-bind", "render: render");
      element.style.width = "500px";
      element.style.height = "500px";

      ko.applyBindings(new CityRenderer(city), element);

      return $(element).find("canvas")[0];
    }

    var testDiv;

    describe('Acceptance: City', function () {
      beforeEach(function () {
        testDiv = document.createElement("div");
        testDiv.style.display = "block";
        testDiv.style.visibility = "hidden";
        document.body.appendChild(testDiv);
      });

      afterEach(function () {
        testDiv.parentElement.removeChild(testDiv);
      });

      it("should render a building", function () {
        var city = new City();

        city.construct(city.getPossibleUpgrades()[0]);
        var canvas = render(city);

        return expect(canvas).to.soon.be.image("expected-images/single-building.png");
      });

      it("should show an empty cell correctly", function () {
        var city = new City();

        var canvas = render(city);

        return expect(canvas).to.soon.be.image("expected-images/empty-cell.png");
      });

      it("should render a block correctly", function () {
        var city = new City();

        for (var i = 0; i < 10; i++) {
          city.construct(city.getPossibleUpgrades()[0]);
        }

        var canvas = render(city);

        return expect(canvas).to.soon.be.image("expected-images/10x-0th-upgrade-city.png");
      });

      it("should update as new buildings are added", function () {
        var city = new City();
        var canvas = render(city);

        city.construct(city.getPossibleUpgrades()[0]);

        return expect(canvas).to.soon.be.image("expected-images/single-building.png");
      });
    });
  }
);