import ko = require("knockout");

import IdleMonitor = require("app/scripts/idle-monitoring/idle-monitor");
import SettingsRepository = require("app/scripts/repositories/settings-repository");
import AutopauseMode = require("app/scripts/idle-monitoring/autopause-mode");

var chromeStub = <typeof SinonChrome> <any> window.chrome;

describe("Idle monitor", () => {
  var idleMonitor: IdleMonitor;
  var settings: SettingsRepository;

  var idleCallback: Sinon.SinonStub;
  var activeCallback: Sinon.SinonStub;

  beforeEach(() => {
    idleCallback = sinon.stub();
    activeCallback = sinon.stub();
    settings = <SettingsRepository> { autopauseMode: ko.observable(AutopauseMode.PauseOnIdleAndLock) };

    idleMonitor = new IdleMonitor(settings);
    idleMonitor.onIdle(idleCallback);
    idleMonitor.onActive(activeCallback);
  });

  function itFulfillsBasicContract() {
    it("triggers nothing initially", () => {
      expect(idleCallback.called).to.equal(false, "Should not call idle callback initially");
      expect(activeCallback.called).to.equal(false, "Should not call activeCallback callback initially");
    });

    it("triggers nothing on other weird inputs", () => {
      chromeStub.idle.onStateChanged.trigger();
      chromeStub.idle.onStateChanged.trigger("");
      chromeStub.idle.onStateChanged.trigger("blarg");

      expect(idleCallback.callCount).to.equal(0, "Should not call idle callback on weird inputs");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback on weird inputs");
    });
  }

  describe("if configured to pause on idle", () => {
    beforeEach(() => settings.autopauseMode(AutopauseMode.PauseOnIdleAndLock));

    itFulfillsBasicContract();

    it("triggers onIdle when going idle", () => {
      chromeStub.idle.onStateChanged.trigger("idle");

      expect(idleCallback.callCount).to.equal(1, "Should call idle callback when going idle");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going idle");
    });

    it("triggers onIdle when going locked", () => {
      chromeStub.idle.onStateChanged.trigger("locked");

      expect(idleCallback.callCount).to.equal(1, "Should call idle callback when locked");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when locked");
    });

    it("triggers onActive when activity is detected (after idle)", () =>  {
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(activeCallback.callCount).to.equal(1, "Should call active callback when going active after idle");
    });

    it("triggers onActive when unlocked", () =>  {
      chromeStub.idle.onStateChanged.trigger("locked");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(activeCallback.callCount).to.equal(1, "Should call active callback when going active after lock");
    });

    it("repeatedly triggers callbacks on future activity", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");
      chromeStub.idle.onStateChanged.trigger("locked");
      chromeStub.idle.onStateChanged.trigger("active");
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(idleCallback.callCount).to.equal(3, "Should call idle callback for every idle or lock event");
      expect(activeCallback.callCount).to.equal(3, "Should call active callback on every active event");
    });
  });

  describe("if configured to pause on lock only", () => {
    beforeEach(() => settings.autopauseMode(AutopauseMode.PauseOnLock));

    itFulfillsBasicContract();

    it("does not trigger onIdle when going idle", () => {
      chromeStub.idle.onStateChanged.trigger("idle");

      expect(idleCallback.callCount).to.equal(0, "Should not call idle callback when going idle");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going idle");
    });

    it("triggers onIdle when going locked", () => {
      chromeStub.idle.onStateChanged.trigger("locked");

      expect(idleCallback.callCount).to.equal(1, "Should call idle callback when locked");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when locked");
    });

    it("does not trigger onActive when activity is detected (after idle)", () =>  {
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going active");
    });

    it("triggers onActive when unlocked", () =>  {
      chromeStub.idle.onStateChanged.trigger("locked");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(activeCallback.callCount).to.equal(1, "Should call active callback when going active");
    });

    it("repeatedly triggers callbacks on future activity", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");
      chromeStub.idle.onStateChanged.trigger("locked");
      chromeStub.idle.onStateChanged.trigger("active");
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(idleCallback.callCount).to.equal(1, "Should call idle callback for every lock event");
      expect(activeCallback.callCount).to.equal(1, "Should call active callback on every active event");
    });
  });

  describe("if configured to never pause", () => {
    beforeEach(() => settings.autopauseMode(AutopauseMode.NeverPause));

    itFulfillsBasicContract();

    it("does not trigger onIdle when going idle", () => {
      chromeStub.idle.onStateChanged.trigger("idle");

      expect(idleCallback.callCount).to.equal(0, "Should not call idle callback when going idle");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going idle");
    });

    it("does not trigger onIdle when going locked", () => {
      chromeStub.idle.onStateChanged.trigger("locked");

      expect(idleCallback.callCount).to.equal(0, "Should not call idle callback when locked");
      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when locked");
    });

    it("does not trigger onActive when activity is detected (after idle)", () =>  {
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going active");
    });

    it("does not trigger onActive when unlocked)", () =>  {
      chromeStub.idle.onStateChanged.trigger("locked");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(activeCallback.callCount).to.equal(0, "Should not call active callback when unlocked");
    });

    it("never triggers anything", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");
      chromeStub.idle.onStateChanged.trigger("locked");
      chromeStub.idle.onStateChanged.trigger("active");
      chromeStub.idle.onStateChanged.trigger("idle");
      chromeStub.idle.onStateChanged.trigger("active");

      expect(idleCallback.callCount).to.equal(0, "Should never trigger any events");
      expect(activeCallback.callCount).to.equal(0, "Should never trigger any events");
    });
  });
});