'use strict';

import ko = require('knockout');

export = function ObservableImage(imageUrl) {
  var observableImage: KnockoutObservable<HTMLImageElement> = ko.observable(null);

  var rawImage = new Image();
  rawImage.src = imageUrl;
  rawImage.onload = function () {
    observableImage(rawImage);
  };

  return observableImage;
};
