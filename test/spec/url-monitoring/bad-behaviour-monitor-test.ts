'use strict';

import ko = require('knockout');
import SettingsRepository = require("app/scripts/repositories/settings-repository");
import BadBehaviourMonitor = require("app/scripts/url-monitoring/bad-behaviour-monitor")
var badBehaviourCallback;

function allDomainsBad() {
  return <SettingsRepository> <any> {
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
  return <SettingsRepository> <any> {
    badDomains: ko.observableArray([])
  };
}

function matchBadDomain(badUrl) {
  return <SettingsRepository> <any> {
    badDomains: ko.observableArray([
      {
        matches: function (url) {
          return url === badUrl;
        }
      }
    ])
  };
}

function tabs(...urls: string[]): KnockoutObservableArray<{url: string, id: number}> {
  return ko.observableArray(urls.map(tab));
}

function tab(url: string, id: number = 0) {
  return {
    url: url,
    id: id
  };
}

describe('Bad behaviour monitor', function () {
  beforeEach(function () {
    badBehaviourCallback = sinon.stub();
  });

  it('should not fire bad behaviour callbacks initially on good sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, noBadDomains());

    monitor.onBadBehaviour(badBehaviourCallback);

    expect(badBehaviourCallback.called).to.equal(false);
  });

  it('should not fire bad behaviour callbacks initially on bad sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, allDomainsBad());

    monitor.onBadBehaviour(badBehaviourCallback);

    expect(badBehaviourCallback.called).to.equal(false);
  });

  it('should fire bad behaviour callbacks when moving from good to bad sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));
    monitor.onBadBehaviour(badBehaviourCallback);

    currentTabs([tab("facebook.com")]);

    expect(badBehaviourCallback.called).to.equal(true);
    expect(badBehaviourCallback.lastCall.args[1]).to.equal("facebook.com");
  });

  it('should not fire bad behaviour callbacks when moving from good to good sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));
    monitor.onBadBehaviour(badBehaviourCallback);

    currentTabs([tab("bbc.co.uk")]);

    expect(badBehaviourCallback.called).to.equal(false);
  });

  it('should fire bad behaviour callbacks if new bad tab appears', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));
    monitor.onBadBehaviour(badBehaviourCallback);

    currentTabs.push(tab("facebook.com"));

    expect(badBehaviourCallback.called).to.equal(true);
    expect(badBehaviourCallback.lastCall.args[1]).to.equal("facebook.com");
  });

  it('should not fire bad behaviour callbacks if new good tab appears', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));
    monitor.onBadBehaviour(badBehaviourCallback);

    currentTabs.push(tab("bbc.co.uk"));

    expect(badBehaviourCallback.called).to.equal(false);
  });

  it("should not trigger callbacks that have been unregistered", function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));
    var callback = monitor.onBadBehaviour(badBehaviourCallback);

    monitor.onBadBehaviour.remove(callback);
    currentTabs.push(tab("facebook.com"));

    expect(badBehaviourCallback.called).to.equal(false);
  });

  it("should fail loudly if you attempt to remove an unregistered callback", function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, noBadDomains());

    expect(function () {
      monitor.onBadBehaviour.remove(badBehaviourCallback);
    }).to.throw(/wasn't registered/);
  });
});