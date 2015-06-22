'use strict';

define(["knockout"], function (ko) {
  return function (imageUrl) {
    var observableImage = ko.observable();

    var rawImage = new Image();
    rawImage.src = imageUrl;
    rawImage.onload = function () {
      observableImage(rawImage);
    };

    return observableImage;
  };
});