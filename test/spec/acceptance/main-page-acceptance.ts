'use strict';

import MainPageViewModel = require('app/scripts/pages/main-page');
import City = require('app/scripts/city/city');

var chromeStub = <typeof SinonChrome> <any> window.chrome;
var clockStub;

describe('Acceptance: Main page', () => {
  before(() => {
    clockStub = sinon.useFakeTimers();
  });

  beforeEach(() => {
    chromeStub.reset();

    chromeStub.storage.sync.get.yields({});
    chromeStub.storage.local.get.yields({});
    chromeStub.tabs.getCurrent.yields({});
  });

  after(() => {
    clockStub.restore();
  });

  describe("city", () => {
    it("should be empty initially", () => {
      var viewModel = new MainPageViewModel();

      var renderedOutput = viewModel.renderCity();

      // Nine cells, three road parts
      expect(renderedOutput.length).to.equal(12);
    });

    it("should load from persisted data", () => {
      var city = new City();
      city.construct(city.getPossibleUpgrades()[0].building);

      var viewModel = new MainPageViewModel();
      chromeStub.storage.local.get.yield({ "city-data": city.toJSON() });
      var renderedOutput = viewModel.renderCity();

      // Fifteen cells, one building, five road parts, one change highlight
      expect(renderedOutput.length).to.equal(22);
    });

    it("should update the city when it's updated remotely", () => {
      var cityWithNewBuilding = new City();
      cityWithNewBuilding.construct(cityWithNewBuilding.getPossibleUpgrades()[0].building);

      var viewModel = new MainPageViewModel();
      chromeStub.storage.onChanged.trigger(
        { "city-data": { "newValue": cityWithNewBuilding.toJSON() } }
      );
      var renderedOutput = viewModel.renderCity();

      // Fifteen cells, one building, five road parts, one change highlight
      expect(renderedOutput.length).to.equal(22);
    });
  });

  it("should let you start anything initially", () => {
    var viewModel = new MainPageViewModel();

    expect(viewModel.canStartPomodoro()).to.equal(true);
    expect(viewModel.canStartBreak()).to.equal(true);
    expect(viewModel.canSayNotNow()).to.equal(true);
  });

  function shouldCloseTabsIffOtherTabsArePresent(triggerMethodName) {
    it("should close the tab, if other tabs are present", () => {
      chromeStub.tabs.query.yields([{ id: "this-tab" }, { id: "other-tab" }]);
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.tabs.remove.called).to.equal(true);
    });

    it("should not close the tab if it's the only tab", () => {
      chromeStub.tabs.query.yields([{ id: "this-tab" }]);
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.tabs.remove.called).to.equal(false);
    });
  }

  function shouldSendMessage(triggerMethodName, messageAction) {
    it("should send a " + messageAction + " message when clicked", () => {
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.runtime.sendMessage.calledOnce).to.equal(true);
      expect(chromeStub.runtime.sendMessage.calledWith({action: messageAction})).to.equal(true);
    });
  }

  describe("When start pomodoro is pressed", () => {
    shouldSendMessage('startPomodoro', 'start-pomodoro');
    shouldCloseTabsIffOtherTabsArePresent('startPomodoro');
  });

  describe("When take a break is pressed", () => {
    shouldSendMessage('startBreak', 'start-break');
    shouldCloseTabsIffOtherTabsArePresent('startBreak');
  });

  describe("When a pomodoro is active", () => {
    it("should disable all buttons", () => {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": true}});

      expect(viewModel.canStartPomodoro()).to.equal(false, "Should not be able to start a pomodoro");
      expect(viewModel.canStartBreak()).to.equal(false, "Should not be able to start a break");
      expect(viewModel.canSayNotNow()).to.equal(false, "Should not be able to 'not now'");
    });

    it("should show a pomodoro-style overlay", () => {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": true}});

      expect(viewModel.overlayShown()).to.equal(true, "Should show an overlay");
      expect(viewModel.overlayStyle()).to.equal("pomodoro-overlay");
      expect(viewModel.overlayText()).to.equal("Focusing");
    });

    it("should show the time remaining", () => {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({
        "pomodoro-is-active": {"newValue": true},
        "pomodoro-service-time-remaining": {"newValue": 1000}
      });

      expect(viewModel.timeRemaining()).to.equal(1000);
    });
  });

  describe("When a break is active", () => {
    it("should disable the break and not now buttons", () => {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({"break-is-active": {"newValue": true}});

      expect(viewModel.canStartPomodoro()).to.equal(true);
      expect(viewModel.canStartBreak()).to.equal(false);
      expect(viewModel.canSayNotNow()).to.equal(false);
    });

    it("should show a break-style overlay", () => {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({"break-is-active": {"newValue": true}});

      expect(viewModel.overlayShown()).to.equal(true, "Should show an overlay");
      expect(viewModel.overlayStyle()).to.equal("break-overlay");
      expect(viewModel.overlayText()).to.equal("On a break");
    });

    it("should show the time remaining", () => {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({
        "break-is-active": {"newValue": true},
        "pomodoro-service-time-remaining": {"newValue": 1000}
      });

      expect(viewModel.timeRemaining()).to.equal(1000);
    });
  });
});