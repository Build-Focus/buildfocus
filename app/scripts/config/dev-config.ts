'use strict';

const devConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 45,
  breakDuration: 1000 * 5,
  timerFrequency: 100,

  idleTimeout: 1000 * 15,
  goneTimeout: 1000 * 30,

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
    projectId: "56be109646f9a70514ff7fc2",
    writeKey: "f9f92f4bc146f4060bdbde782a1ef92d0997ce7798986e98f8819ef89e167be947c8390940a3fa84babe8366cb97ff78f7d70264a32983961cc409415f5c1d276b12c3abd391912e64408d907114d487513a1e52110145cc9fc58fde250d8556",
    extraInfo: { dev: true }
  }
};

export = devConfig;