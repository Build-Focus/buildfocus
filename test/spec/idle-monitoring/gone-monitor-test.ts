import { subscribableEvent } from "app/scripts/data-synchronization/subscribable-event";
import GoneMonitor = require("app/scripts/idle-monitoring/gone-monitor");

const TOTALLY_IDLE_TIMEOUT = 1000 * 60 * 15;

var clockStub: Sinon.SinonFakeTimers;

describe("Gone monitor", () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  var goneMonitor: GoneMonitor;
  var idleMonitorStub;

  var goneCallback: Sinon.SinonStub;
  var backCallback: Sinon.SinonStub;

  beforeEach(() => {
    goneCallback = sinon.stub();
    backCallback = sinon.stub();

    idleMonitorStub = { onIdle: subscribableEvent(), onActive: subscribableEvent() };

    goneMonitor = new GoneMonitor(idleMonitorStub);
    goneMonitor.onGone(goneCallback);
    goneMonitor.onBack(backCallback);
  });

  it("triggers nothing initially", () => {
    expect(goneCallback.called).to.equal(false, "Should not call gone callback initially");
    expect(backCallback.called).to.equal(false, "Should not call back callback initially");
  });

  it("triggers nothing when the user goes idle, but before the timeout", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT - 1);

    expect(goneCallback.called).to.equal(false, "Should not call gone callback initially");
    expect(backCallback.called).to.equal(false, "Should not call back callback initially");
  });

  it("triggers the Gone callback after the user goes idle if the timeout has passed", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT);

    expect(goneCallback.called).to.equal(true, "Should call gone callback initially after the post-idle timeout");
  });

  it("uses the initial idle time for the Gone timeout if multiple idle events are fired", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT - 1);
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(1);

    expect(goneCallback.called).to.equal(true, "Should call gone callback after timeout from the first idle event");
  });

  it("doesn't trigger the Gone callback if the user becomes active again before the idle timeout", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT - 1);
    idleMonitorStub.onActive.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT);

    expect(goneCallback.called).to.equal(false, "Should not call gone callback if the user returns before the timeout");
  });

  it("triggers on Back callback when the user returns if they were Gone", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT);
    idleMonitorStub.onActive.trigger();

    expect(backCallback.called).to.equal(true, "Should trigger the Back callback");
  });

  it("doesn't trigger the Back callback when the user returns before the Gone timeout", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT - 1);
    idleMonitorStub.onActive.trigger();

    expect(backCallback.called).to.equal(false, "Should not trigger the Back callback");
  });

  it("doesn't trigger the Back callback if the user returns and wasn't idle at all", () => {
    idleMonitorStub.onActive.trigger();

    expect(backCallback.called).to.equal(false, "Should not trigger the Back callback");
  });

  it("should trigger Gone and Back events after a series of previous idle and active events", () => {
    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT - 1);
    idleMonitorStub.onActive.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT);

    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT * 2);
    // Should have fired Gone there.
    idleMonitorStub.onActive.trigger();
    // Should fire Back here.

    idleMonitorStub.onIdle.trigger();
    clockStub.tick(TOTALLY_IDLE_TIMEOUT * 2);
    // Should have fired Gone there.
    idleMonitorStub.onActive.trigger();
    // Should fire Back here.

    expect(goneCallback.callCount).to.equal(2, "Should have been Gone twice");
    expect(backCallback.callCount).to.equal(2, "Should have come Back twice");
  });
});
