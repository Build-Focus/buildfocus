import ko = require("knockout");

import BadTabsWarningViewModel = require("app/scripts/bad-tabs-warning/bad-tabs-warning-viewmodel");
import BadTabsWarningAction = require("app/scripts/bad-tabs-warning/bad-tabs-warning-action");
import ProxyPomodoroService = require("app/scripts/pomodoro/proxy-pomodoro-service");
import Tab = require("app/scripts/url-monitoring/tab");
import SettingsRepository = require("app/scripts/settings-repository");
import Domain = require("app/scripts/url-monitoring/domain");

var chromeStub = <typeof SinonChrome> <any> window.chrome;

describe('Bad tabs warning popup', () => {
  var viewModel: BadTabsWarningViewModel;
  var pomodoroService: ProxyPomodoroService;
  var tabs: KnockoutObservableArray<Tab>;
  var settings: SettingsRepository;

  const ExtensionTab = { url: "chrome-extension://this-extension/main.html", id: 1 };
  const TwitterTab = { url: "http://twitter.com", id: 2 };
  const GoogleTab = { url: "http://google.com", id: 3 };

  beforeEach(() => {
    chromeStub.tabs.getCurrent.yields(ExtensionTab);
    chromeStub.tabs.remove.reset();

    tabs = ko.observableArray([]);
    pomodoroService = <ProxyPomodoroService> { isActive: ko.observable(false) };
    settings = <SettingsRepository> {
      badDomains: ko.observable([new Domain("twitter.com")]),
      badTabsWarningAction: ko.observable(BadTabsWarningAction.Prompt)
    };
    viewModel = new BadTabsWarningViewModel(pomodoroService, tabs, settings);
  });

  describe("with an active pomodoro and no distracting tabs", () => {
    beforeEach(() => pomodoroService.isActive(true));

    it("should not be shown", () => {
      expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup");
    });

    it("should not be shown, if distracting tabs appear later", () => {
      tabs([ExtensionTab, TwitterTab]);
      expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup");
    });
  });

  describe("with distracting tabs initially open", () => {
    beforeEach(() => tabs([ExtensionTab, TwitterTab]));

    it("should not appear before a pomodoro is started", () => {
      expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup");
    });

    it("should say it would be shown if triggered", () => {
      expect(viewModel.shouldShowIfTriggered()).to.equal(true, "Should say it *would* be shown, if triggered");
    });

    describe("when a pomodoro is started in this tab", () => {
      beforeEach(() => {
        viewModel.trigger();
        pomodoroService.isActive(true);
      });

      it("should be shown by default", () => {
        expect(viewModel.isShowing()).to.equal(true, "Should show a warning popup");
      });

      it("should disappear if the bad tabs are closed", () => {
        tabs([ExtensionTab]);
        expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup if bad tabs are closed");
      });

      it("should disappear when the pomodoro finishes", () => {
        pomodoroService.isActive(false);
        expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup after the pomodoro");
      });

      describe("and 'Leave them' is clicked", () => {
        beforeEach(() => viewModel.leaveDistractingTabs());

        it("should close no tabs", () => {
          expect(chromeStub.tabs.remove.called).to.equal(false, "Should not close anything if distracting tabs are left");
        });

        it("should disappear", () => {
          expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup");
        });

        it("should not change the default setting, by default", () => {
          expect(settings.badTabsWarningAction()).to.equal(BadTabsWarningAction.Prompt);
        });
      });

      describe("and 'Close them' is clicked", () => {
        beforeEach(() => viewModel.closeDistractingTabs());

        it("should close the distracting tabs", () => {
          expect(chromeStub.tabs.remove.calledWith([TwitterTab.id])).to.equal(true, "Should close distracting tabs");
        });

        it("should close the current tab if it's not the only tab", () => {
          chromeStub.tabs.query.yield([ExtensionTab, GoogleTab]);
          expect(chromeStub.tabs.remove.calledWith(ExtensionTab.id)).to.equal(true, "Should auto-close own tab");
        });

        it("should not close the current tab if it is the only tab", () => {
          chromeStub.tabs.query.yield([ExtensionTab]);
          expect(chromeStub.tabs.remove.calledWith(ExtensionTab.id)).to.equal(false, "Should not auto-close own tab if it's the only one");
        });

        it("should disappear", () => {
          expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup");
        });

        it("should not change the default setting, by default", () => {
          expect(settings.badTabsWarningAction()).to.equal(BadTabsWarningAction.Prompt);
        });
      });
    });

    describe("when a pomodoro is started elsewhere", () => {
      beforeEach(() => pomodoroService.isActive(true));

      it("should not be shown", () => {
        expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup if this page didn't actively trigger it");
      });
    });

    describe("if Leave Them is set as the default when the pomodoro is started", () => {
      beforeEach(() => {
        settings.badTabsWarningAction(BadTabsWarningAction.LeaveThem);
        viewModel.trigger();
        pomodoroService.isActive(true);
      });

      it("should not show a popup", () => {
        expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup if 'Leave Them' is set");
      });

      it("should not close any tabs", () => {
        expect(chromeStub.tabs.remove.called).to.equal(false, "Should not close anything if 'Leave Them' is set");
      });
    });

    describe("if Close Them is set as the default when the pomodoro is started", () => {
      beforeEach(() => {
        settings.badTabsWarningAction(BadTabsWarningAction.CloseThem);
        viewModel.trigger();
        pomodoroService.isActive(true);
      });

      it("should not show a popup", () => {
        expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup if 'Close Them' is set");
      });

      it("should close this tab automatically", () => {
        chromeStub.tabs.query.yield([ExtensionTab, GoogleTab]);
        expect(chromeStub.tabs.remove.calledWith(ExtensionTab.id)).to.equal(true, "Should auto-close own tab");
      });

      it("should close the distracting tabs automatically", () => {
        expect(chromeStub.tabs.remove.calledWith([TwitterTab.id])).to.equal(true, "Should close distracting tabs");
      });
    });
  });

  describe("with 'remember this in future' ticked", () => {
    beforeEach(() => viewModel.rememberInFuture(true));

    it("'Close them' should save its setting", () => {
      viewModel.closeDistractingTabs();
      expect(settings.badTabsWarningAction()).to.equal(BadTabsWarningAction.CloseThem);
    });

    it("'Leave them' should save its setting", () => {
      viewModel.leaveDistractingTabs();
      expect(settings.badTabsWarningAction()).to.equal(BadTabsWarningAction.LeaveThem);
    });
  });
});