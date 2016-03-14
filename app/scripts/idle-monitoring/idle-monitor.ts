import rollbar = require("rollbar");
import config = require("config");
import subscribableEvent = require("subscribable-event");
import tracking = require("tracking/tracking");

class IdleMonitor {
  onIdle = subscribableEvent();
  onActive = subscribableEvent();

  constructor() {
    chrome.idle.setDetectionInterval(config.idleTimeout / 1000);

    chrome.idle.onStateChanged.addListener((newState: string) => {
      if (newState === "locked" || newState === "idle") {
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