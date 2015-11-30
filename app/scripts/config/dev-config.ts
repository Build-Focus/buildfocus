'use strict';

const devConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 10,
  breakDuration: 1000 * 3,

  rollbarConfig: {
    accessToken: "50f66d878cc84307a37ebfc6202a7836",
    captureUncaught: false,
    payload: {
      environment: "development"
    },
    verbose: true,
    enabled: false
  },

  trackingConfig: {
    enabled: true
  }
};

export = devConfig;