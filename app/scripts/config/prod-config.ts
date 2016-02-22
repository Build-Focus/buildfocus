'use strict';

const prodConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 25,
  breakDuration: 1000 * 60 * 5,
  timerFrequency: 100,

  idleTimeout: 1000 * 30,
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
    projectId: "56bcbc2a46f9a7051719100f",
    writeKey: "5c65a837bd9ee3ad849357d93391485b464933a63fb6c233414495d3d3ce582535cb2f6e278a09310e0d8dced2fe6fb91cb59afbb1ee9fd1b3c765dcf7281c8f5fdf5ebe029f2fff784129877ad950b81d232fec9d3ccc8f95a457745e6cb20a",
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
