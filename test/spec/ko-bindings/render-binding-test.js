/* global describe, it */

define(["jquery", "knockout", "createjs"],
  function ($, ko, easeljs) {
    'use strict';

    function elementWithBinding(binding) {
      var testElement = $("#test-element");
      var boundElement = $("<div data-bind='" + binding + "'></div>")[0];
      testElement.append(boundElement);
      return boundElement;
    }

    function getImageData(width, height) {
      var canvas = $("#test-element canvas")[0];
      var context = canvas.getContext('2d');
      return context.getImageData(0, 0, width, height).data;
    }

    function getPixelAt(x, y) {
      var imageData = getImageData(x+1, y+1);

      var pixelIndex = ((x+1) * y) + x;
      var byteIndex = pixelIndex * 4;

      return [imageData[byteIndex],
              imageData[byteIndex+1],
              imageData[byteIndex+2],
              imageData[byteIndex+3]];
    }

    describe('Render binding', function () {
      beforeEach(function () {
        document.body.appendChild($("<div id='test-element'></div>")[0]);
      });

      afterEach(function () {
        $("#test-element").remove();
      });

      it('should call render', function () {
        var element = elementWithBinding("render: renderMethod");

        var viewModel = { renderMethod: sinon.stub() };
        ko.applyBindings(viewModel, element);

        expect(viewModel.renderMethod.callCount).to.equal(1);
      });

      it('should provide a working easeljs stage to render()', function () {
        var renderFunction = function (stage) {
          var shape = new easeljs.Shape();
          shape.graphics.beginFill('#090909');
          shape.graphics.drawRect(9, 9, 3, 3);
          stage.addChild(shape);
        };

        ko.applyBindings({renderMethod: renderFunction},
          elementWithBinding("render: renderMethod"));

        var middlePixel = getPixelAt(10, 10);
        expect(middlePixel).to.deep.equal([9, 9, 9, 255]);
      });
    });
  }
);