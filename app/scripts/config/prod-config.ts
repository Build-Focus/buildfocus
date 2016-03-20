'use strict';

const prodConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 25,
  breakDuration: 1000 * 60 * 5,
  timerFrequency: 100,

  idleTimeout: 1000 * 90,
  goneTimeout: 1000 * 60 * 15,

  rollbarConfig: {
    accessToken: "50f66d878cc84307a37ebfc6202a7836",
    captureUncaught: true,
    payload: {
      environment: "production"
    },
    verbose: true,
    reportLevel: "warning"
  },

  trackingConfig: {
    enabled: true,
    calqWriteKey: "752a1760a1724a0f4fbf8de0c70b0caf",
    extraInfo: { prod: true }
  }
};

require(["rollbar"], function (rollbar) {
  requirejs.onError = (error) => {
    if (error.requireType === "timeout") {
      rollbar.warning("RequireJS timeout", error);
    } else {
      rollbar.error("Unknown RequireJS error", error);
    }
  };
});

export = prodConfig;
