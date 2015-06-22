'use strict';

define({
  pomodoroDuration: 1000 * 10,
  breakDuration: 1000 * 3,

  rollbarConfig: {
    accessToken: "50f66d878cc84307a37ebfc6202a7836",
    captureUncaught: true,
    payload: {
      environment: "development"
    },
    verbose: true,
    enabled: false
  }
});