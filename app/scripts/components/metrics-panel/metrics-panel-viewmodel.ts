import moment = require("moment");
import ko = require("raw-knockout");

import { MetricsRepository } from "repositories/metrics-repository";

// Make 'today' observable, to ensure the below
// updates when the day ticks over.
var today = ko.observable(moment.today());
setInterval(() => today(moment.today()), 1000);

ko.components.register("metrics-panel", {
  viewModel: function(params) {
    var metrics = new MetricsRepository();

    this.successesToday = ko.computed(
      () => metrics.successes
                   .on(today())
                   .length
    );
    this.successesThisWeek = ko.computed(
      () => metrics.successes
                   .between(moment.daysAgo(7), moment.today().endOf('day'))
                   .length
    );
    this.successesLastWeek = ko.computed(
      () => metrics.successes
                   .between(moment.daysAgo(14), moment.daysAgo(7))
                   .length
    );
  },
  template: { element: "metrics-panel-template" }
});
