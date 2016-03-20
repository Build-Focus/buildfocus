'use strict';

const devConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 10,
  breakDuration: 1000 * 5,
  timerFrequency: 100,

  idleTimeout: 1000 * 15,
  goneTimeout: 1000 * 15,

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
    enabled: true,
    calqWriteKey: "37302fcac17cba3d918bb740fbb6bad5",
    extraInfo: { dev: true }
  }
};

export = devConfig;