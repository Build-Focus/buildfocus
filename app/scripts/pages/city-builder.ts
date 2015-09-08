import _ = require('lodash');
import ko = require("knockout");

import Score = require('score');
import CityRenderer = require('city/rendering/city-renderer');

var score = new Score();

var cityBuilder = {
  cityRenderer: new CityRenderer(score.city),
  addRandom: function () {
    score.addSuccess();
  }
};

export = cityBuilder;