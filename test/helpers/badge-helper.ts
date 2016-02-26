import ko = require("knockout");

export const POMODORO_COLOUR = [224, 5, 5];
export const BREAK_COLOUR = [34, 187, 4];
export const BADGE_BACKGROUND_COLOUR = [251, 184, 65];
export const BADGE_TEXT_COLOUR = [0, 0, 0];

var chromeStub = <typeof SinonChrome> <any> window.chrome;

export function getBadgeImageData() {
  var lastSetIconCall = chromeStub.browserAction.setIcon.lastCall;

  if (lastSetIconCall) {
    return lastSetIconCall.args[0].imageData;
  } else {
    throw new Error("Attempted to get badge image data, but nothing's been drawn yet");
  }
}

export function getBadgePixel(x, y) {
  var image = getBadgeImageData();
  var data = image.data;

  var pixelIndex = image.width * y + x;
  var pixelByteIndex = pixelIndex * 4;
  return [data[pixelByteIndex],
    data[pixelByteIndex+1],
    data[pixelByteIndex+2],
    data[pixelByteIndex+3]];
}

export function badgeTextColour() {
  return getBadgePixel(11, 5); // Top left of the B
}