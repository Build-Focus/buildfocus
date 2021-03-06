'use strict';

import $ = require("jquery");
import ko = require("knockout");
import _ = require("lodash");
import easeljs = require("createjs");

function elementWithBinding(binding) {
  var testElement = $("#test-element");
  var boundElement = $("<div data-bind='" + binding + "'></div>")[0];

  boundElement.style.width = "100px";
  boundElement.style.height = "80px";

  testElement.append(boundElement);

  return boundElement;
}

function getImageData(width, height) {
  var canvas = <HTMLCanvasElement> $("#test-element canvas")[0];
  var context = canvas.getContext('2d');
  return context.getImageData(0, 0, width, height).data;
}

function getPixels(width, height) {
  var data = getImageData(width, height);
  return _(data).groupBy(function (byte, index) {
    return Math.floor(index / 4);
  }).values().value();
}

function blackDot(x, y) {
  var dot = new easeljs.Shape();
  dot.graphics.beginFill("#000000");
  dot.graphics.drawRect(x, y, 1, 1);
  return dot;
}

describe('Render binding', function () {
  beforeEach(function () {
    var testElement = document.createElement("div");
    testElement.id = "test-element";

    document.body.appendChild(testElement);
  });

  afterEach(function () {
    $("#test-element").each((i, element) => ko.cleanNode(element)).remove();

    // Clear ticker listeners, so that the stage stops getting updated
    easeljs.Ticker.removeAllEventListeners();
  });

  it('should render nothing if the observable is empty', function () {
    var element = elementWithBinding("render: { source: renderables }");

    var viewModel = { renderables: ko.observableArray( [] ) };
    ko.applyBindings(viewModel, element);

    getPixels(100, 100).forEach(function (pixel, index) {
      var coord = Math.floor(index / 100) + ", " + (index % 100);
      expect(pixel, coord).to.deep.equal([0, 0, 0, 0]);
    });
  });

  it('should render everything from the given observable to the stage', function () {
    var element = elementWithBinding("render: { source: renderables }");

    var viewModel = {
      renderables: ko.observableArray([
        blackDot(10, 10), blackDot(20, 20), blackDot(30, 30)
      ])
    };
    ko.applyBindings(viewModel, element);

    getPixels(100, 100).forEach(function (pixel, index) {
      var x = Math.floor(index / 100);
      var y = index % 100;

      if (_.isEqual([x, y], [10, 10]) || _.isEqual([x, y], [20, 20]) || _.isEqual([x, y], [30, 30])) {
        expect(pixel, x + ", " + y).to.deep.equal([0, 0, 0, 255]);
      } else {
        expect(pixel, x + ", " + y).to.deep.equal([0, 0, 0, 0]);
      }
    });
  });

  it('should update the canvas if renderables are added later', function () {
    var element = elementWithBinding("render: { source: renderables }");

    var viewModel = { renderables: ko.observableArray( [] ) };
    ko.applyBindings(viewModel, element);

    viewModel.renderables.push(blackDot(5, 5));

    getPixels(100, 100).forEach(function (pixel, index) {
      var x = Math.floor(index / 100);
      var y = index % 100;

      if (_.isEqual([x, y], [5, 5])) {
        expect(pixel, x + ", " + y).to.deep.equal([0, 0, 0, 255]);
      } else {
        expect(pixel, x + ", " + y).to.deep.equal([0, 0, 0, 0]);
      }
    });
  });

  it('should update the canvas if renderables are removed later', function () {
    var element = elementWithBinding("render: { source: renderables }");

    var viewModel = {renderables: ko.observableArray([blackDot(8, 8)])};
    ko.applyBindings(viewModel, element);

    viewModel.renderables([]);

    getPixels(100, 100).forEach(function (pixel, index) {
      var x = Math.floor(index / 100);
      var y = index % 100;
      expect(pixel, x + ", " + y).to.deep.equal([0, 0, 0, 0]);
    });
  });

  it('should call a provided callback after first rendering', function () {
    var element = elementWithBinding("render: { source: renderables, afterRender: callback }");
    var callbackStub = sinon.stub();

    var viewModel = { renderables: ko.observableArray( [] ), callback: callbackStub };
    ko.applyBindings(viewModel, element);

    expect(callbackStub.callCount).to.equal(1);
  });
});