import rollbar = require("rollbar");
import config = require("config");
import { subscribableEvent } from "data-synchronization/subscribable-event";

import SettingsRepository = require("settings-repository");
import AutopauseMode = require("idle-monitoring/autopause-mode");

class IdleMonitor {
  onIdle = subscribableEvent();
  onActive = subscribableEvent();

  constructor(settings: SettingsRepository) {
    var idleTimeout = config.idleTimeout / 1000;
    chrome.idle.setDetectionInterval(idleTimeout);

    var previousState = "active"; // Very likely correct, but trigger a check below just in case.
    chrome.idle.queryState(idleTimeout, (currentState) => previousState = currentState);

    chrome.idle.onStateChanged.addListener((newState: string) => {
      if (newState === "idle") {
        if (settings.autopauseMode() === AutopauseMode.PauseOnIdleAndLock) this.onIdle.trigger();
      } else if (newState === "locked") {
        if (settings.autopauseMode() === AutopauseMode.PauseOnIdleAndLock ||
            settings.autopauseMode() === AutopauseMode.PauseOnLock) {
          this.onIdle.trigger();
        }
      } else if (newState === "active") {
        if (previousState === "idle") {
          if (settings.autopauseMode() === AutopauseMode.PauseOnIdleAndLock) this.onActive.trigger();
        } else if (previousState === "locked") {
          if (settings.autopauseMode() === AutopauseMode.PauseOnIdleAndLock ||
              settings.autopauseMode() === AutopauseMode.PauseOnLock) {
            this.onActive.trigger();
          }
        } else {
          // Weird, but might mean we were initially not active, and we haven't seen the real value yet.
          // Trigger active anyway; shouldn't have any downsides.
          this.onActive.trigger();
        }
      } else {
        rollbar.warn("Unexpected idle state change", {newState: newState});
      }

      previousState = newState;
    });
  }
}

export = IdleMonitor;
