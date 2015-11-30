'use strict';

const testConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 20,
  breakDuration: 1000 * 60 * 5,

  rollbarConfig: {
    enabled: false
  },

  trackingConfig: {
    enabled: false,
    extraProfileInfo: { }
  }
};

export = testConfig;