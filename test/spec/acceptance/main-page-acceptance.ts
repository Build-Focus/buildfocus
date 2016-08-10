'use strict';

import MainPageViewModel = require('app/scripts/pages/main-page');
import PomodoroState = require("app/scripts/pomodoro/pomodoro-state");
import City = require('app/scripts/city/city');

import asPromise = require('test/helpers/as-promise');

import {
  resetTabHelper,
  activateTab,
  givenTabs,
  closeTab
} from "test/helpers/tab-helper";

import { givenBadDomains } from "test/helpers/saved-state-helper";
import { respondToLastMessageWith } from "test/helpers/messaging-helper";

var chromeStub = <typeof SinonChrome> <any> window.chrome;
var clockStub;

function pomodoroIsActive() {
  chromeStub.storage.onChanged.trigger({"pomodoro-service-state": {"newValue": PomodoroState.Active}});
}

function pomodoroIsPaused() {
  chromeStub.storage.onChanged.trigger({"pomodoro-service-state": {"newValue": PomodoroState.Paused}});
}

function breakIsActive() {
  chromeStub.storage.onChanged.trigger({"pomodoro-service-state": {"newValue": PomodoroState.Break}});
}

function countdownAt(time: number) {
  chromeStub.storage.onChanged.trigger({"pomodoro-service-time-remaining": {"newValue": time}});
}

describe('Acceptance: Main page', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  beforeEach(() => {
    resetTabHelper();
    givenTabs("http://google.com", chrome.runtime.getURL("main.html"));
    givenBadDomains("twitter.com");
  });

  var viewModel;

  describe("city", () => {
    it("should be empty initially", () => {
      viewModel = new MainPageViewModel();

      var renderedOutput = viewModel.renderCity();

      // Nine cells, three road parts
      expect(renderedOutput.length).to.equal(12);
    });

    it("should load from persisted data", () => {
      var city = new City();
      city.construct(city.getPossibleUpgrades()[0].building);

      viewModel = new MainPageViewModel();
      chromeStub.storage.local.get.yield({ "city-data": city.toJSON() });
      var renderedOutput = viewModel.renderCity();

      // Fifteen cells, one building, five road parts, one change highlight
      expect(renderedOutput.length).to.equal(22);
    });

    it("should update the city when it's updated remotely", () => {
      var cityWithNewBuilding = new City();
      cityWithNewBuilding.construct(cityWithNewBuilding.getPossibleUpgrades()[0].building);

      viewModel = new MainPageViewModel();
      chromeStub.storage.onChanged.trigger(
        { "city-data": { "newValue": cityWithNewBuilding.toJSON() } }
      );
      var renderedOutput = viewModel.renderCity();

      // Fifteen cells, one building, five road parts, one change highlight
      expect(renderedOutput.length).to.equal(22);
    });
  });

  it("should let you start anything initially", () => {
    viewModel = new MainPageViewModel();

    expect(viewModel.canStartPomodoro()).to.equal(true);
    expect(viewModel.canStartBreak()).to.equal(true);
    expect(viewModel.canSayNotNow()).to.equal(true);
  });

  describe("When start pomodoro is pressed", () => {
    beforeEach(() => {
      viewModel = new MainPageViewModel();
      viewModel.startPomodoro();
    });

    it("should send a startPomodoro message", () => {
      expect(chromeStub.runtime.sendMessage.calledOnce).to.equal(true);
      expect(chromeStub.runtime.sendMessage.calledWith({action: 'start-pomodoro'})).to.equal(true);
    });

    it("should keep the window open if 'true' is sent back from the 'start' message", () => {
      respondToLastMessageWith(true);

      return asPromise(() => expect(chromeStub.tabs.remove.called).to.equal(false));
    });

    it("should close the window if 'false' is sent back from the 'start' message", () => {
      respondToLastMessageWith(false);

      return asPromise(() => expect(chromeStub.tabs.remove.called).to.equal(true));
    });
  });

  describe("When take a break is pressed", () => {
    it("should send a startBreak message", () => {
      viewModel = new MainPageViewModel();

      viewModel.startBreak();

      expect(chromeStub.runtime.sendMessage.calledOnce).to.equal(true);
      expect(chromeStub.runtime.sendMessage.calledWith({action: 'start-break'})).to.equal(true);
    });
  });

  describe("When a pomodoro is active", () => {
    beforeEach(() => {
      viewModel = new MainPageViewModel();
      pomodoroIsActive();
    });

    it("should disable all buttons", () => {
      expect(viewModel.canStartPomodoro()).to.equal(false, "Should not be able to start a pomodoro");
      expect(viewModel.canStartBreak()).to.equal(false, "Should not be able to start a break");
      expect(viewModel.canSayNotNow()).to.equal(false, "Should not be able to 'not now'");
    });

    it("should show a pomodoro-style overlay", () => {
      expect(viewModel.overlayShown()).to.equal(true, "Should show an overlay");
      expect(viewModel.overlayStyle()).to.equal("pomodoro-overlay");
      expect(viewModel.overlayText()).to.equal("Focusing");
    });

    it("should show the time remaining", () => {
      countdownAt(1000);

      expect(viewModel.timeRemaining()).to.equal(1000);
    });
  });

  describe("When a pomodoro is paused", () => {
    beforeEach(() => {
      viewModel = new MainPageViewModel();
      pomodoroIsPaused();
    });

    it("should disable all buttons", () => {
      expect(viewModel.canStartPomodoro()).to.equal(false, "Should not be able to start a pomodoro");
      expect(viewModel.canStartBreak()).to.equal(false, "Should not be able to start a break");
      expect(viewModel.canSayNotNow()).to.equal(false, "Should not be able to 'not now'");
    });

    it("should show a pomodoro-style overlay", () => {
      expect(viewModel.overlayShown()).to.equal(true, "Should show an overlay");
      expect(viewModel.overlayStyle()).to.equal("pomodoro-overlay");
      expect(viewModel.overlayText()).to.equal("Paused");
    });

    it("should show the time remaining", () => {
      countdownAt(1000);

      expect(viewModel.timeRemaining()).to.equal(1000);
    });
  });

  describe("When a break is active", () => {
    beforeEach(() => {
      viewModel = new MainPageViewModel();
      breakIsActive();
    });

    it("should disable the break and not now buttons", () => {
      expect(viewModel.canStartPomodoro()).to.equal(true);
      expect(viewModel.canStartBreak()).to.equal(false);
      expect(viewModel.canSayNotNow()).to.equal(false);
    });

    it("should show a break-style overlay", () => {
      expect(viewModel.overlayShown()).to.equal(true, "Should show an overlay");
      expect(viewModel.overlayStyle()).to.equal("break-overlay");
      expect(viewModel.overlayText()).to.equal("On a break");
    });

    it("should show the time remaining", () => {
      countdownAt(1000);

      expect(viewModel.timeRemaining()).to.equal(1000);
    });
  });
});
