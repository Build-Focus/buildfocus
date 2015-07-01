import $ = require('jquery');
import ko = require('knockout');
import easeljs = require('createjs');

ko.bindingHandlers['render'] = {
  init: function (element, valueAccessor) {
    var viewModel = valueAccessor();
    var canvas = $("<canvas width='100' height='100'>")[0];
    $(element).append(canvas);

    var stage = new easeljs.Stage(canvas);
    viewModel.render(stage);
    stage.update();

    easeljs.Ticker.framerate = 24;
    easeljs.Ticker.addEventListener("tick", (event) => stage.update());
  }
};