'use strict';

require(["knockout", "pages/options-page", "rollbar"], function (ko, OptionsPageViewModel) {
  ko.applyBindings(new OptionsPageViewModel());
});