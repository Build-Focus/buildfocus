'use strict';

import MainPageViewModel = require('app/scripts/pages/main-page');
import City = require('app/scripts/city/city');

import {
  resetTabHelper,
  activateTab,
  givenTabs,
  closeTab,
  givenBadDomains
} from "test/helpers/tab-helper";

function pomodoroIsActive() {
  chromeStub.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": true}});
}

function pomodoroIsInactive() {
  chromeStub.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": false}});
}

function breakIsActive() {
  chromeStub.storage.onChanged.trigger({"break-is-active": {"newValue": true}});
}

function breakIsInactive() {
  chromeStub.storage.onChanged.trigger({"break-is-active": {"newValue": false}});
}

function countdownAt(time: number) {
  chromeStub.storage.onChanged.trigger({"pomodoro-service-time-remaining": {"newValue": time}});
}

var chromeStub = <typeof SinonChrome> <any> window.chrome;
var clockStub;

describe('Acceptance: Main page', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  beforeEach(() => {
    resetTabHelper();
    givenBadDomains("twitter.com");
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
      givenTabs("http://google.com", "chrome-extension://this-extension/main.html");
      var viewModel = new MainPageViewModel();

      viewModel[triggerMethodName]();

      expect(chromeStub.tabs.remove.called).to.equal(true);
    });

    it("should not close the tab if it's the only tab", () => {
      givenTabs("chrome-extension://this-extension/main.html");
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
    var viewModel;

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

    it("should not show a 'Look out!' popup, if there are no distracting tabs open", () => {
      expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
    });

    it("should not show a 'Look out!' popup, if distracting appear later whilst focusing", () => {
      givenTabs("http://twitter.com");
      expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
    });
  });

  describe("When a break is active", () => {
    var viewModel;

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

  describe("If there are distracting tabs already open", () => {
    var viewModel;

    beforeEach(() => {
      givenTabs("chrome-extension://this-extension/main.html", "http://twitter.com");
      viewModel = new MainPageViewModel();
    });

    it("a 'Look out!' popup should not be shown before the pomodoro is started", () => {
      expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
    });

    it("starting a pomodoro should not close the tab", () => {
      viewModel.startPomodoro();
      expect(chromeStub.tabs.remove.called).to.equal(false, "Tab should not autoclose if there are distractions open");
    });

    it("a 'Look out!' popup should appear when a pomodoro is started", () => {
      viewModel.startPomodoro();
      expect(viewModel.warningPopupShown()).to.equal(true, "Should show a warning popup");
    });

    it("the 'Look out!' popup should disappear if the bad tabs are closed", () => {
      viewModel.startPomodoro();
      givenTabs("chrome-extension//this-extension/main.html");

      expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
    });

    it("the 'Look out!' popup should disappear when the pomodoro finishes", () => {
      viewModel.startPomodoro();
      pomodoroIsActive();
      pomodoroIsInactive();

      expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
    });

    describe("and 'Leave them' is selected", () => {
      beforeEach(() => {
        viewModel.startPomodoro();
        viewModel.leaveDistractingTabs()
      });

      it("not tabs should not be closed", () => {
        expect(chromeStub.tabs.remove.called).to.equal(false, "Should not close anything if distracting tabs are left");
      });

      it("the 'Look out!' popup should disappear", () => {
        expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
      });
    });

    describe("and 'Close them' is selected", () => {
      beforeEach(() => {
        viewModel.startPomodoro();
        viewModel.closeDistractingTabs()
      });

      it("the distracting tabs should be closed", () => {
        expect(chromeStub.tabs.remove.calledWith([1])).to.equal(true, "Should close distracting tabs");
      });

      it("the tab should be closed", () => {
        expect(chromeStub.tabs.remove.calledWith("current-tab-id")).to.equal(true,
          "Should auto-close own tab and distracting tabs");
      });

      it("the 'Look out!' popup should disappear", () => {
        expect(viewModel.warningPopupShown()).to.equal(false, "Should not show a warning popup");
      });
    });
  });
});