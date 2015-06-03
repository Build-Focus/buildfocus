'use strict';

define({
  pomodoroDuration: 1000 * 60 * 20,
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
});