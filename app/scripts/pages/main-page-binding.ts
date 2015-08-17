'use strict';

require(["knockout", "pages/main-page", "rollbar"], function (ko, MainPageViewModel) {
  ko.applyBindings(new MainPageViewModel());
});