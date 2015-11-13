'use strict';

const prodConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 25,
  breakDuration: 1000 * 60 * 5,

  rollbarConfig: {
    accessToken: "50f66d878cc84307a37ebfc6202a7836",
    captureUncaught: true,
    payload: {
      environment: "production"
    },
    verbose: true,
    reportLevel: "warning"
  }
};

export = prodConfig;
