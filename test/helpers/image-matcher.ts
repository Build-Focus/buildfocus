declare module Chai {
  interface Assertion {
    image(expectedImagePath: string): Promise<void>;
  }
}

define(function () {
  function loadImage(src) {
    return new Promise(function (resolve: (HTMLImageElement) => void, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function renderImageToCanvas(image) {
    var canvas = <HTMLCanvasElement> $("<canvas>")[0];
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    return canvas;
  }

  function getImageData(image) {
    var canvas = renderImageToCanvas(image);
    return canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
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

  return function imageMatchers(chai) {
    // Asserts on a canvas and takes an image path, ensures they contain the exact same data
    chai.Assertion.addMethod('image', function (expectedImagePath) {
      var assertion = this;
      var actualCanvas = assertion._obj;

      var assertionPromise = loadImage(expectedImagePath).then(function (expectedImage) {
        var expectedImageData = getImageData(expectedImage);

        resemble(actualCanvas.toDataURL()).compareTo(expectedImageData).onComplete(function (result) {
          try {
            var difference = result.misMatchPercentage;
            assertion.assert(difference < 0.5,
              "Expected canvas to match " + expectedImagePath + " but was " + difference + "% different",
              "Expected canvas not to match " + expectedImagePath + " but was only " + difference + "% different");
          } catch (e) {
            appendDebugInfo(expectedImagePath, actualCanvas, renderImageToCanvas(expectedImage), result);
            throw e;
          }
        });
      });

      // Turn the assertion itself into a promise, so Mocha can wait for it.
      assertion.then = assertionPromise.then.bind(assertionPromise);
      assertion.catch = assertionPromise.catch.bind(assertionPromise);
    });
  };
});