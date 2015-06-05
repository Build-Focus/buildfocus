'use strict';

define(["knockout", "lodash", "city/null-cell"], function (ko, _, NullCell) {
  return function Map(cells) {
    var self = this;

    var cellLookup = [];
    _.forEach(cells, function (cell) {
      if (getCell(cell.x, cell.y) !== undefined) {
        throw "Duplicate cell coordinates: " + cell.x + "," + cell.y;
      } else {
        setCell(cell);
      }
    });

    function setCell(cell) {
      if (!cellLookup[cell.x]) {
        cellLookup[cell.x] = [];
      }
      cellLookup[cell.x][cell.y] = cell;
    }

    function getCell(x, y) {
      var row = cellLookup[x] || [];
      return row[y];
    }

    self.cells = function () {
      return _.flatten(cellLookup);
    };

    self.getCell = function (x, y) {
      return getCell(x, y) || new NullCell(x, y);
    };
  };
});