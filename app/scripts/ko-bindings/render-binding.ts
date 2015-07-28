import $ = require('jquery');
import ko = require('raw-knockout');
import easeljs = require('createjs');

const STAGE_DATA_KEY = "easeljs-stage";

interface Renderable {
  (): easeljs.DisplayObject[] | KnockoutObservableArray<easeljs.DisplayObject>
}

ko.bindingHandlers['render'] = {
  init: function (element: HTMLElement, valueAccessor: () => Renderable) {
    var width = element.clientWidth;

    var canvas = <HTMLCanvasElement> document.createElement("canvas");
    canvas.width = width;
    canvas.height = width * 0.8;
    $(element).append(canvas);

    var stage = new easeljs.Stage(canvas);
    ko.utils.domData.set(element, STAGE_DATA_KEY, stage);

    easeljs.Ticker.framerate = 24;
    easeljs.Ticker.addEventListener("tick", (event) => {
      var bounds = stage.getBounds();
      if (bounds && !bounds.isEmpty()) {
        var scaleFactor = Math.min(canvas.width / bounds.width,
                                   canvas.height / bounds.height);
        stage.scaleX = scaleFactor;
        stage.scaleY = scaleFactor;

        // Position the stage with the bounds at the top-left
        stage.x = -bounds.x * scaleFactor;
        stage.y = -bounds.y * scaleFactor;

        // Offset position to center the rendering
        stage.x += (canvas.width - (bounds.width * scaleFactor)) / 2;
        stage.y += (canvas.height - (bounds.height * scaleFactor)) / 2;
      }
      stage.update();
    });
  },
  update: function (element: HTMLElement, valueAccessor: () => Renderable) {
    var getRenderables = valueAccessor();
    var stage = ko.utils.domData.get(element, STAGE_DATA_KEY);

    // One day we might want this to be more nuanced, but for now wipe and redraw is fine.
    stage.removeAllChildren();
    ko.unwrap(getRenderables()).forEach(function (renderable) {
      stage.addChild(renderable);
    });

    stage.update();
  }
};