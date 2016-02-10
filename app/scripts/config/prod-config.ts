'use strict';

const prodConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 25,
  breakDuration: 1000 * 60 * 5,
  timerFrequency: 100,

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
