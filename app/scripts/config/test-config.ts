'use strict';

const testConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 25,
  breakDuration: 1000 * 60 * 5,
  timerFrequency: 1000,

  idleTimeout: 1000 * 90,
  goneTimeout: 1000 * 60 * 15,

  rollbarConfig: {
    enabled: false
  },

  trackingConfig: {
    enabled: false,
    calqWriteKey: "37302fcac17cba3d918bb740fbb6bad5",
    extraInfo: { }
  }
};

export = testConfig;