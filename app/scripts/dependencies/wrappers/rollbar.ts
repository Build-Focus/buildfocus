'use strict';

define(["raw-rollbar", "config"], function (Rollbar, config) {
  var rollbar = Rollbar.init(config.rollbarConfig);

  chrome.identity.getProfileUserInfo((userInfo) => {
    if (userInfo.id) {
      rollbar.configure({
        payload: {
          manifest: chrome.runtime.getManifest(),
          person: {
            id: userInfo.id,
            email: userInfo.email
          }
        },
        client: {
          javascript: {
            source_map_enabled: true,
            guess_uncaught_frames: true
          }
        }
      });
    }
  });

  return rollbar;
});