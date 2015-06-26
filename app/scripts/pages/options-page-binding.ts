'use strict';

require(["knockout", "pages/options-page"], function (ko, OptionsPageViewModel) {
  ko.applyBindings(new OptionsPageViewModel());
});