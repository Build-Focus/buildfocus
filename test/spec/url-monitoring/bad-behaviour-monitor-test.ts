'use strict';

import ko = require('knockout');
import SettingsRepository = require("app/scripts/settings-repository");
import BadBehaviourMonitor = require("app/scripts/url-monitoring/bad-behaviour-monitor")

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
  it('should not fire bad behaviour callbacks initially on good sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, noBadDomains());

    expect(monitor.currentBadTabs()).to.deep.equal([ ]);
  });

  it('should list bad tabs when initially present', function () {
    var currentTabs = tabs("reddit.com");
    var monitor = new BadBehaviourMonitor(currentTabs, allDomainsBad());

    expect(monitor.currentBadTabs()).to.deep.equal([tab("reddit.com")]);
  });

  it('should list bad tabs when moving from good to bad sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));

    currentTabs([tab("facebook.com")]);

    expect(monitor.currentBadTabs()).to.deep.equal([tab("facebook.com")]);
  });

  it('should not list have any bad tabs when moving from good to good sites', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));

    currentTabs([tab("bbc.co.uk")]);

    expect(monitor.currentBadTabs()).to.deep.equal([ ]);
  });

  it('should list bad tab if new bad tab appears', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));

    currentTabs.push(tab("facebook.com"));

    expect(monitor.currentBadTabs()).to.deep.equal([tab("facebook.com")]);
  });

  it('should not list any bad tabs if new good tab appears', function () {
    var currentTabs = tabs("google.com");
    var monitor = new BadBehaviourMonitor(currentTabs, matchBadDomain("facebook.com"));

    currentTabs.push(tab("bbc.co.uk"));

    expect(monitor.currentBadTabs()).to.deep.equal([ ]);
  });
});