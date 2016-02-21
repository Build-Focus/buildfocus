import change = require('city/change');

import PositionedImageConfig = require("positioned-image-config");

export = <{[changeType: string]: PositionedImageConfig}> {
  [change.Type.Created]: {
    imagePath: "/images/city/highlights/stars.png",
    xOffset: -148,
    yOffset: -300
  },
  [change.Type.Destroyed]: {
    imagePath: "/images/city/highlights/rubble.png",
    xOffset: 0,
    yOffset: 0
  }
}