import $ = require('jquery');
import ko = require('raw-knockout');
import easeljs = require('createjs');

ko.bindingHandlers['render'] = {
  init: function (element, valueAccessor) {
    var render = valueAccessor();
    var canvas = <HTMLCanvasElement> $("<canvas width='100' height='100'>")[0];
    $(element).append(canvas);

    var stage = new easeljs.Stage(canvas);
    render(stage);
    stage.update();

    easeljs.Ticker.framerate = 24;
    easeljs.Ticker.addEventListener("tick", (event) => {
      var bounds = stage.getBounds();
      if (bounds && !bounds.isEmpty()) {
        stage.scaleX = canvas.width / bounds.width;
        stage.scaleY = canvas.height / bounds.height;
      }
      stage.update();
    });
  }
};