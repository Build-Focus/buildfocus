/* global resemble */

// TODO: This needs lots of refactoring and cleanup to work out what's actually necessary

var ImageMatchers = function imageMatchers(chai) {
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function renderImageToCanvas(image, width, height) {
    var canvas = $("<canvas>")[0];
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  function getImageData(image, width, height) {
    var canvas = renderImageToCanvas(image, width, height);
    return canvas.getContext("2d").getImageData(0, 0, width, height);
  }

  function appendDebugInfo(imagePath, actualImage, expectedImage, diffData) {
    var debugOutput = document.createElement("p");
    debugOutput.appendChild($("<span>Actual:</span>")[0]);
    debugOutput.appendChild(actualImage);

    debugOutput.appendChild(document.createElement("br"));

    debugOutput.appendChild($("<span>Expected " + imagePath + ":</span>")[0]);
    debugOutput.appendChild(expectedImage);

    debugOutput.appendChild(document.createElement("br"));

    debugOutput.appendChild($("<span>Diff:</span>")[0]);
    var diffImage = document.createElement("img");
    diffImage.src = diffData.getImageDataUrl();
    debugOutput.appendChild(diffImage);

    document.body.appendChild(debugOutput);
  }

  // Asserts on a canvas and takes an image path, ensures they contain the exact same data
  chai.Assertion.addMethod('image', function (imagePath) {
    var assertion = this;

    var actualCanvas = assertion._obj;
    var width = actualCanvas.width;
    var height = actualCanvas.height;

    // We can't just pull the image data from the canvas, we need to copy it to a new canvas first, because
    // PNG encoding issues (?) mean we get ever so slightly different results for identical images otherwise.
    var assertionPromise = Promise.all([loadImage(actualCanvas.toDataURL()), loadImage(imagePath)]).then(function (images) {
      var actualImageData = getImageData(images[0], width, height);
      var expectedImageData = getImageData(images[1], width, height);

      resemble(actualImageData).compareTo(expectedImageData).onComplete(function (result) {
        try {
          assertion.assert(result.misMatchPercentage < 1,
            "Expected canvas to match " + imagePath +
              " but was " + result.misMatchPercentage + "% different",
            "Expected canvas not to match " + imagePath);
        } catch (e) {
          appendDebugInfo(imagePath, images[0], images[1], result);
          throw e;
        }
      });
    });

    // Turn the assertion itself into a promise, so Mocha can wait for it.
    assertion.then = assertionPromise.then.bind(assertionPromise);
    assertion.catch = assertionPromise.catch.bind(assertionPromise);
  });
};