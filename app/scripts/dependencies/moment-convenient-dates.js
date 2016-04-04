/**
 * A selection of convenient helpers to get hold of commonly useful dates.
 * All dates are returned in local time
 */

// TODO - Open-source this.

(function(root, factory) {
  if(typeof exports === 'object') {
    module.exports = factory(require('moment'));
  } else if(typeof define === 'function' && define.amd) {
    define(['moment'], factory);
  } else {
    root.moment = factory(root.moment);
  }
}(this, function(moment) {

  // Days

  moment.today = function () {
    return moment().startOf('day');
  };

  moment.yesterday = function () {
    return moment.today().subtract(1, "days");
  };

  moment.tomorrow = function () {
    return moment.today().add(1, "days");
  };

  moment.daysAgo = function (number) {
    return moment.today().subtract(number, "days");
  };

  moment.daysAway = function (number) {
    return moment.today().add(number, "days");
  };

  // Weeks

  moment.aWeekAgo = function () {
    return moment.weeksAgo(1);
  };

  moment.weeksAgo = function (number) {
    return moment.today().subtract(number, "weeks");
  };

  moment.weeksAway = function (number) {
    return moment.today().add(number, "weeks");
  };

  // Months

  moment.aMonthAgo = function () {
    return moment.monthsAgo(1);
  };

  moment.monthsAgo = function (number) {
    return moment.today().subtract(number, "months");
  };

  moment.monthsAway = function (number) {
    return moment.today().add(number, "months");
  };

  // Years

  moment.aYearAgo = function () {
    return moment.yearsAgo(1);
  };

  moment.yearsAgo = function (number) {
    return moment.today().subtract(number, "years");
  };

  moment.yearsAway = function (number) {
    return moment.today().add(number, "years");
  };

}));