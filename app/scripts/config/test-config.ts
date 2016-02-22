'use strict';

const testConfig: ApplicationConfig = {
  pomodoroDuration: 1000 * 60 * 25,
  breakDuration: 1000 * 60 * 5,
  timerFrequency: 1000,

  idleTimeout: 1000 * 30,
  totallyIdleTimeout: 1000 * 60 * 15,

  rollbarConfig: {
    enabled: false
  },

  trackingConfig: {
    enabled: false,
    projectId: "56be0fec59949a03c35c0474",
    writeKey: "5c65a837bd9ee3ad849357d93391485b464933a63fb6c233414495d3d3ce582535cb2f6e278a09310e0d8dced2fe6fb91cb59afbb1ee9fd1b3c765dcf7281c8f5fdf5ebe029f2fff784129877ad950b81d232fec9d3ccc8f95a457745e6cb20a",
    extraInfo: { }
  }
};

export = testConfig;