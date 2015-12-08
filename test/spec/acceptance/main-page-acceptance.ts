'use strict';

import MainPageViewModel = require('app/scripts/pages/main-page');
import City = require('app/scripts/city/city');

var chromeStub = <typeof SinonChrome> <any> window.chrome;
var clockStub;

describe('Acceptance: Main page', function () {
  before(function () {
    clockStub = sinon.useFakeTimers();
  });

  beforeEach(function () {
    chromeStub.reset();

    chromeStub.storage.sync.get.yields({});
    chromeStub.storage.local.get.yields({});
    chromeStub.tabs.getCurrent.yields({});
  });

  after(function () {
    clockStub.restore();
  });

  describe("city", function () {
    it("should be empty initially", function () {
      var viewModel = new MainPageViewModel();

      var renderedOutput = viewModel.renderCity();

      // Nine cells, three road parts
      expect(renderedOutput.length).to.equal(12);
    });

    it("should load from persisted data", function () {
      var city = new City();
      city.construct(city.getPossibleUpgrades()[0].building);

      var viewModel = new MainPageViewModel();
      chromeStub.storage.local.get.yield({ "city-data": city.toJSON() });
      var renderedOutput = viewModel.renderCity();

      // Fifteen cells, one building, five road parts, one change highlight
      expect(renderedOutput.length).to.equal(22);
    });

    it("should update the city when it's updated remotely", function () {
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

  it("should let you start anything initially", function () {
    var viewModel = new MainPageViewModel();

    expect(viewModel.canStartPomodoro()).to.equal(true);
    expect(viewModel.canStartBreak()).to.equal(true);
    expect(viewModel.canSayNotNow()).to.equal(true);
  });

  function shouldCloseTabsIffOtherTabsArePresent(triggerMethodName) {
    it("should close the tab, if other tabs are present", function () {
      chromeStub.tabs.query.yields([{ id: "this-tab" }, { id: "other-tab" }]);
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.tabs.remove.called).to.equal(true);
    });

    it("should not close the tab if it's the only tab", function () {
      chromeStub.tabs.query.yields([{ id: "this-tab" }]);
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.tabs.remove.called).to.equal(false);
    });
  }

  function shouldSendMessage(triggerMethodName, messageAction) {
    it("should send a " + messageAction + " message when clicked", function () {
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.runtime.sendMessage.calledOnce).to.equal(true);
      expect(chromeStub.runtime.sendMessage.calledWith({action: messageAction})).to.equal(true);
    });
  }

  describe("When start pomodoro is pressed", function () {
    shouldSendMessage('startPomodoro', 'start-pomodoro');
    shouldCloseTabsIffOtherTabsArePresent('startPomodoro');
  });

  describe("When take a break is pressed", function () {
    shouldSendMessage('startBreak', 'start-break');
    shouldCloseTabsIffOtherTabsArePresent('startBreak');
  });

  describe("When a pomodoro is active", function () {
    it("should disable all buttons", function () {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": true}});

      expect(viewModel.canStartPomodoro()).to.equal(false);
      expect(viewModel.canStartBreak()).to.equal(false);
      expect(viewModel.canSayNotNow()).to.equal(false);
    });
  });

  describe("When a break is active", function () {
    it("should disable the break and not now buttons", function () {
      var viewModel = new MainPageViewModel();

      chromeStub.storage.onChanged.trigger({"break-is-active": {"newValue": true}});

      expect(viewModel.canStartPomodoro()).to.equal(true);
      expect(viewModel.canStartBreak()).to.equal(false);
      expect(viewModel.canSayNotNow()).to.equal(false);
    });
  });
});