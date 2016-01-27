import ko = require('raw-knockout');
import moment = require('moment');
import _ = require('lodash');

function format(durationInMillis: number): string {
  var duration = moment.duration(durationInMillis);
  var minutes = Math.floor(duration.asMinutes());
  var seconds = Math.floor(duration.subtract(minutes, 'm').asSeconds());

  return _.padLeft(minutes.toString(), 2, "0") +
         ":" +
         _.padLeft(seconds.toString(), 2, "0");
}

ko.bindingHandlers['duration'] = {
  init: function (element: HTMLElement, valueAccessor: () => number) {
    ko.bindingHandlers.text.init.call(this, element, () => format(ko.unwrap(valueAccessor())));
  },
  update: function (element: HTMLElement, valueAccessor: () => number) {
    ko.bindingHandlers.text.update.call(this, element, () => format(ko.unwrap(valueAccessor())));
  }
};