/* global describe, it */

(function () {
  'use strict';

  var $;
  var ko;
  var binding;

  function elementWithBinding(binding) {
    var element = $("#test-element");
    element.append("<div data-bind='" + binding + "'></div>");

    return element.children()[0];
  }

  describe('Render binding', function () {
    before(function (done) {
      require(["jquery", "knockout", "ko-bindings/render-binding"], function (loaded$, loadedKo, loadedBinding) {
        $ = loaded$;
        ko = loadedKo;
        binding = loadedBinding;
        done();
      });
    });

    afterEach(function () {
      $("#test-element").empty();
    });

    it('should successfully bind an element', function () {
      var element = elementWithBinding("render: $data");

      var viewModel = { render: sinon.stub() };
      ko.applyBindings(viewModel, element);

      expect(viewModel.render.callCount).to.equal(1);
    });
  });
})();