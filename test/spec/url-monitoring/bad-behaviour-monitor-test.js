/* global describe, it */

(function () {
  'use strict';

  var ko;
  var BadBehaviourMonitor;
  var badBehaviourCallback;

  function allDomainsBad() {
    return {
      badDomains: ko.observableArray([
        {
          matches: function () {
            return true;
          }
        }
      ])
    };
  }

  function noBadDomains() {
    return {
      badDomains: ko.observableArray([])
    };
  }

  function matchBadDomain(badUrl) {
    return {
      badDomains: ko.observableArray([
        {
          matches: function (url) {
            return url === badUrl;
          }
        }
      ])
    };
  }

  describe('Bad behaviour monitor', function () {
    before(function (done) {
      require(["knockout", "url-monitoring/bad-behaviour-monitor"], function (loadedKo, loadedClass) {
        BadBehaviourMonitor = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    beforeEach(function () {
      badBehaviourCallback = sinon.stub();
    });

    it('should not fire bad behaviour callbacks initially on good sites', function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, noBadDomains());

      monitor.onBadBehaviour(badBehaviourCallback);

      expect(badBehaviourCallback.called).to.equal(false);
    });

    it('should not fire bad behaviour callbacks initially on bad sites', function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, allDomainsBad());

      monitor.onBadBehaviour(badBehaviourCallback);

      expect(badBehaviourCallback.called).to.equal(false);
    });

    it('should fire bad behaviour callbacks when moving from good to bad sites', function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, matchBadDomain("facebook.com"));
      monitor.onBadBehaviour(badBehaviourCallback);

      currentUrls(["facebook.com"]);

      expect(badBehaviourCallback.called).to.equal(true);
    });

    it('should not fire bad behaviour callbacks when moving from good to good sites', function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, matchBadDomain("facebook.com"));
      monitor.onBadBehaviour(badBehaviourCallback);

      currentUrls(["bbc.co.uk"]);

      expect(badBehaviourCallback.called).to.equal(false);
    });

    it('should fire bad behaviour callbacks if new bad tab appears', function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, matchBadDomain("facebook.com"));
      monitor.onBadBehaviour(badBehaviourCallback);

      currentUrls.push("facebook.com");

      expect(badBehaviourCallback.called).to.equal(true);
    });

    it('should not fire bad behaviour callbacks if new good tab appears', function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, matchBadDomain("facebook.com"));
      monitor.onBadBehaviour(badBehaviourCallback);

      currentUrls.push("bbc.co.uk");

      expect(badBehaviourCallback.called).to.equal(false);
    });

    it("should not trigger callbacks that have been unregistered", function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, matchBadDomain("facebook.com"));
      var callback = monitor.onBadBehaviour(badBehaviourCallback);

      monitor.removeBadBehaviourCallback(callback);
      currentUrls.push("facebook.com");

      expect(badBehaviourCallback.called).to.equal(false);
    });

    it("should fail loudly if you attempt to remove an unregistered callback", function () {
      var currentUrls = ko.observableArray(["google.com"]);
      var monitor = new BadBehaviourMonitor(currentUrls, noBadDomains());

      expect(function () {
        monitor.removeBadBehaviourCallback(badBehaviourCallback);
      }).to.throw(/wasn't registered/);
    });
  });
}());