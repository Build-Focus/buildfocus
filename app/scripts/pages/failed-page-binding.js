'use strict';

require(["knockout", "pages/failed-page"], function (ko, FailedPageViewModel) {
  ko.applyBindings(new FailedPageViewModel());
});