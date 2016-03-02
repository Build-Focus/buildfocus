import IdleMonitor = require("app/scripts/idle-monitoring/idle-monitor");

var chromeStub = <typeof SinonChrome> <any> window.chrome;

describe("Idle monitor", () => {
  var idleMonitor: IdleMonitor;

  var idleCallback: Sinon.SinonStub;
  var activeCallback: Sinon.SinonStub;

  beforeEach(() => {
    idleCallback = sinon.stub();
    activeCallback = sinon.stub();

    idleMonitor = new IdleMonitor();
    idleMonitor.onIdle(idleCallback);
    idleMonitor.onActive(activeCallback);
  });

  it("triggers nothing initially", () => {
    expect(idleCallback.called).to.equal(false, "Should not call idle callback initially");
    expect(activeCallback.called).to.equal(false, "Should not call activeCallback callback initially");
  });

  it("triggers onIdle when going idle", () => {
    chromeStub.idle.onStateChanged.trigger("idle");

    expect(idleCallback.callCount).to.equal(1, "Should call idle callback when going idle");
    expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going idle");
  });

  it("triggers onIdle when going locked", () => {
    chromeStub.idle.onStateChanged.trigger("locked");

    expect(idleCallback.callCount).to.equal(1, "Should call idle callback when going idle");
    expect(activeCallback.callCount).to.equal(0, "Should not call active callback when going idle");
  });

  it("triggers onActive when activity is detected", () =>  {
    chromeStub.idle.onStateChanged.trigger("active");

    expect(idleCallback.callCount).to.equal(0, "Should not call idle callback when going active");
    expect(activeCallback.callCount).to.equal(1, "Should call active callback when going active");
  });

  it("triggers nothing on other weird inputs", () => {
    chromeStub.idle.onStateChanged.trigger();
    chromeStub.idle.onStateChanged.trigger("");
    chromeStub.idle.onStateChanged.trigger("blarg");

    expect(idleCallback.callCount).to.equal(0, "Should not call idle callback on weird inputs");
    expect(activeCallback.callCount).to.equal(0, "Should not call active callback on weird inputs");
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