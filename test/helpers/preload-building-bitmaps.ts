import _ = require("lodash");

import buildingConfig = require("app/scripts/city/rendering/config/building-rendering-config");
import roadConfig = require("app/scripts/city/rendering/config/road-rendering-config");
import cellConfig = require("app/scripts/city/rendering/config/cell-rendering-config");
import changeConfig = require("app/scripts/city/rendering/config/change-highlight-rendering-config");

import PositionedImageConfig = require("app/scripts/city/rendering/config/positioned-image-config");

import easeljs = require("createjs");

var buildingImages = _.flatten(_.map(buildingConfig, (singleBuildingConfig) =>
  _.map(singleBuildingConfig, (singleBuildingAndDirectionConfig) => new easeljs.Bitmap(singleBuildingAndDirectionConfig.imagePath))
));

var changeImages = _.map(changeConfig, (singleChangeConfig) => new easeljs.Bitmap(singleChangeConfig.imagePath));

var roadImages = _.map(roadConfig, (imagePath) => new easeljs.Bitmap(imagePath));
var cellImages = _.flatten(_.map(cellConfig, (cellConfigByShade) => _.map(cellConfigByShade, (imagePath) => new easeljs.Bitmap(imagePath))));

var canvas = document.createElement("canvas");
var stage = new easeljs.Stage(canvas);

_.forEach(buildingImages.concat(changeImages).concat(roadImages).concat(cellImages), (image: any) => stage.addChild(image));