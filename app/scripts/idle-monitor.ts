import rollbar = require("rollbar");
import subscribableEvent = require("subscribable-event");

class IdleMonitor {
  onIdle = subscribableEvent();
  onActive = subscribableEvent();

  constructor() {
    chrome.idle.setDetectionInterval(30); // TODO: Add Selenium tests to actually check this works right

    chrome.idle.onStateChanged.addListener((newState: string) => {
      if (newState === "lock" || newState === "idle") {
        this.onIdle.trigger();
      } else if (newState === "active") {
        this.onActive.trigger();
      } else {
        rollbar.warn("Unexpected idle state change", {newState: newState});
      }
    });
  }
}

export = IdleMonitor;