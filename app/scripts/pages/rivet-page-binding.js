'use strict';

require(["knockout", "pages/rivet-page", "rollbar"], function (ko, RivetPageViewModel) {
  ko.applyBindings(new RivetPageViewModel());
});