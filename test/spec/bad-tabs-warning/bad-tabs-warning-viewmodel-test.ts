import ko = require("knockout");

import BadTabsWarningViewModel = require("app/scripts/bad-tabs-warning/bad-tabs-warning-viewmodel");
import BadTabsWarningAction = require("app/scripts/bad-tabs-warning/bad-tabs-warning-action");

import ProxyBadTabsWarningService = require("app/scripts/bad-tabs-warning/proxy-bad-tabs-warning-service");
import ProxyPomodoroService = require("app/scripts/pomodoro/proxy-pomodoro-service");

var chromeStub = <typeof SinonChrome> <any> window.chrome;

describe('Bad tabs warning popup', () => {
  var viewModel: BadTabsWarningViewModel;
  var badTabsService: ProxyBadTabsWarningService;

  beforeEach(() => {
    badTabsService = <ProxyBadTabsWarningService> { isWarningActive: ko.observable(false) };
    viewModel = new BadTabsWarningViewModel(badTabsService);
  });

  describe("initially", () => {
    it("should not be shown", () => {
      expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup");
    });
  });

  describe("when a warning is active", () => {
    beforeEach(() => badTabsService.isWarningActive(true));

    it("should be shown", () => {
      expect(viewModel.isShowing()).to.equal(true, "Should show a warning popup");
    });

    it("should disappear when the warning becomes inactive", () => {
      badTabsService.isWarningActive(false);
      expect(viewModel.isShowing()).to.equal(false, "Should not show a warning popup if bad tabs are closed");
    });

    describe("and 'Leave them' is clicked", () => {
      beforeEach(() => viewModel.leaveDistractingTabs());

      it("should send only one message", () => {
        expect(chromeStub.runtime.sendMessage.callCount).to.equal(1);
      });

      it("should send a 'leave them' message", () => {
        expect(chromeStub.runtime.sendMessage.args[0][0].action).to.equal("bad-tabs.leave");

      });

      it("should not remember the option chosen, by default", () => {
        expect(chromeStub.runtime.sendMessage.args[0][0].remember).to.equal(false);
      });
    });

    describe("and 'Close them' is clicked", () => {
      beforeEach(() => viewModel.closeDistractingTabs());

      it("should send only one message", () => {
        expect(chromeStub.runtime.sendMessage.callCount).to.equal(1);
      });

      it("should send a 'leave them' message", () => {
        expect(chromeStub.runtime.sendMessage.args[0][0].action).to.equal("bad-tabs.close");
      });

      it("should not remember the option chosen, by default", () => {
        expect(chromeStub.runtime.sendMessage.args[0][0].remember).to.equal(false);
      });
    });
  });

  describe("with 'remember this in future' ticked", () => {
    beforeEach(() => viewModel.rememberInFuture(true));

    it("'Close them' should save its setting", () => {
      viewModel.closeDistractingTabs();
      expect(chromeStub.runtime.sendMessage.args[0][0].remember).to.equal(true);
    });

    it("'Leave them' should save its setting", () => {
      viewModel.leaveDistractingTabs();
      expect(chromeStub.runtime.sendMessage.args[0][0].remember).to.equal(true);
    });
  });
});
