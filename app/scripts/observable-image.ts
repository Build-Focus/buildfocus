'use strict';

import ko = require('knockout');

export = function ObservableImage(imageUrl) {
  var observableImage = ko.observable();

  var rawImage = new Image();
  rawImage.src = imageUrl;
  rawImage.onload = function () {
    observableImage(rawImage);
  };

  return observableImage;
};