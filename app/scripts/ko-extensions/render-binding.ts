import $ = require('jquery');
import ko = require('raw-knockout');
import easeljs = require('createjs');

const STAGE_DATA_KEY = "easeljs-stage";

interface RenderBindingOptions {
  source: Renderable;
  afterRender?: () => void
}

interface Renderable {
  (): easeljs.DisplayObject[] | KnockoutObservableArray<easeljs.DisplayObject>
}

function updateStageToFit(stage: easeljs.Stage, canvas: HTMLCanvasElement) {
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

    stage.update();
  }
}

function resizeToFit(canvas: HTMLCanvasElement, parent: HTMLElement) {
  // Reset our height first, so that any effect we're having on the size of the page is removed.
  canvas.width = 0;
  canvas.height = 0;
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight;
}

ko.bindingHandlers['render'] = {
  init: function (element: HTMLElement, valueAccessor: () => RenderBindingOptions) {
    var canvas = document.createElement("canvas");
    resizeToFit(canvas, element);
    $(element).append(canvas);

    var stage = new easeljs.Stage(canvas);
    ko.utils.domData.set(element, STAGE_DATA_KEY, stage);

    var tickCallback = () => updateStageToFit(stage, canvas);
    easeljs.Ticker.framerate = 24;
    easeljs.Ticker.addEventListener("tick", tickCallback);

    window.addEventListener("resize", () => {
      if (!canvasSizeNeedsUpdate) requestAnimationFrame(updateCanvasSize);
      canvasSizeNeedsUpdate = true;
    });

    var canvasSizeNeedsUpdate = false;
    var updateCanvasSize = () => {
      resizeToFit(canvas, canvas.parentElement);
      updateStageToFit(stage, canvas);
      canvasSizeNeedsUpdate = false;
    };

    ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
      easeljs.Ticker.removeEventListener("tick", tickCallback);
      window.removeEventListener("resize", updateCanvasSize);
      stage.enableDOMEvents(false);
    });
  },

  update: function (element: HTMLElement, valueAccessor: () => RenderBindingOptions) {
    var options = valueAccessor();
    var getRenderables = options.source;
    var stage = ko.utils.domData.get(element, STAGE_DATA_KEY);

    // One day we might want this to be more nuanced, but for now wipe and redraw is fine.
    stage.removeAllChildren();
    ko.unwrap(getRenderables()).forEach(function (renderable) {
      stage.addChild(renderable);
    });

    var canvas = <HTMLCanvasElement> element.querySelector("canvas");
    updateStageToFit(stage, canvas);

    stage.update();

    if (options.afterRender) options.afterRender();
  }
};