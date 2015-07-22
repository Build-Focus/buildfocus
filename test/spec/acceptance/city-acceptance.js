/* global describe, it, xit */

define(["jquery", "createjs", "knockout", "pages/rivet-page"],
  function ($, easeljs, ko, RivetPageViewModel) {
    'use strict';

    function render(viewModel) {
      var element = $("<div data-bind='render: renderScore'></div>")[0];

      ko.applyBindings(viewModel, element);

      return $(element).find("canvas")[0];
    }

    describe('Acceptance: City', function () {
      it.only("should render a building", function () {
        var viewModel = new RivetPageViewModel();
        var canvas = render(viewModel);

        return expect(canvas).to.soon.be.image("expected-images/single-building.png");
      });

      xit("should show an empty cell correctly", function () { });

      xit("should show a single building correctly", function () { });

      xit("should render a block correctly", function () { });

      xit("should be scaled to the size available", function () { });
    });
  }
);