import $ = require('jquery');
import ko = require('raw-knockout');
import easeljs = require('createjs');

ko.bindingHandlers['render'] = {
  init: function (element: HTMLElement, valueAccessor) {
    var render = valueAccessor();
    var width = element.clientWidth;

    var canvas = <HTMLCanvasElement> document.createElement("canvas");
    canvas.width = width;
    canvas.height = width * 0.8;
    $(element).append(canvas);

    var stage = new easeljs.Stage(canvas);
    render(stage);
    stage.update();

    easeljs.Ticker.framerate = 24;
    easeljs.Ticker.addEventListener("tick", (event) => {
      var bounds = stage.getBounds();
      if (bounds && !bounds.isEmpty()) {
        var scaleFactor = Math.min(canvas.width / bounds.width,
                                   canvas.height / bounds.height);
        stage.scaleX = scaleFactor;
        stage.scaleY = scaleFactor;

        stage.x = -bounds.x * scaleFactor;
        stage.y = -bounds.y * scaleFactor;
      }
      stage.update();
    });
  }
};