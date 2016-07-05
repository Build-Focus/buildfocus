import config = require("config");
import { subscribableEvent } from "data-synchronization/subscribable-event";
import tracking = require("tracking/tracking");

import IdleMonitor = require("idle-monitoring/idle-monitor");

class GoneMonitor {
  onGone = subscribableEvent();
  onBack = subscribableEvent();

  constructor(idleMonitor: IdleMonitor) {
    var goneTimeoutId: number = null;
    var currentlyGone = false;

    idleMonitor.onIdle(() => {
      if (goneTimeoutId !== null) return;

      goneTimeoutId = setTimeout(() => {
        this.onGone.trigger();
        currentlyGone = true;
        goneTimeoutId = null;
      }, config.goneTimeout);
    });

    idleMonitor.onActive(() => {
      if (currentlyGone) {
        this.onBack.trigger();
        currentlyGone = false;
      } else if (goneTimeoutId !== null) {
        clearTimeout(goneTimeoutId);
        goneTimeoutId = null;
      }
    });
  }
}

export = GoneMonitor;
