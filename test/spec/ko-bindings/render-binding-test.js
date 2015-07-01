/* global describe, it */

(function () {
  'use strict';

  var $;
  var ko;
  var easeljs;
  var binding;

  function elementWithBinding(binding) {
    var element = $("#test-element");
    element.append("<div data-bind='" + binding + "'></div>");

    return element.children()[0];
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
    before(function (done) {
      require(["jquery", "knockout", "createjs", "ko-bindings/render-binding"],
        function (loaded$, loadedKo, loadedEaselJs, loadedBinding) {
          $ = loaded$;
          ko = loadedKo;
          easeljs = loadedEaselJs;
          binding = loadedBinding;
          done();
        }
      );
    });

    afterEach(function () {
      $("#test-element").empty();
    });

    it('should call render', function () {
      var element = elementWithBinding("render: $data");

      var viewModel = { render: sinon.stub() };
      ko.applyBindings(viewModel, element);

      expect(viewModel.render.callCount).to.equal(1);
    });

    it('should provide a working easeljs stage to render()', function () {
      var renderFunction = function (stage) {
        var shape = new easeljs.Shape();
        shape.graphics.beginFill('#101010');
        shape.graphics.drawRect(9, 9, 3, 3);
        stage.addChild(shape);
      };

      ko.applyBindings({render: renderFunction}, elementWithBinding("render: $data"));


      var middlePixel = getPixelAt(10, 10);
      expect(middlePixel).to.deep.equal([16, 16, 16, 255]);
    });
  });
})();