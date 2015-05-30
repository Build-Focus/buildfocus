'use strict';

require(["knockout", "pages/rivet-page"], function (ko, RivetPageViewModel) {
  ko.applyBindings(new RivetPageViewModel());
});