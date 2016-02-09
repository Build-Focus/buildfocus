'use strict';

define(["raw-rollbar", "config"], function (Rollbar, config: ApplicationConfig) {
  var rollbar = Rollbar.init(config.rollbarConfig);

  chrome.identity.getProfileUserInfo((userInfo) => {
    if (userInfo.id) {
      rollbar.configure({payload: {person: {id: userInfo.id, email: userInfo.email}}});
    }
  });

  // Lets us make a clear readable call that stops TypeScript from automatically dropping
  // Rollbar imports that don't get used. Sadly it's a totally useless call, but otherwise a lovely fix.
  rollbar.enable = () => rollbar;

  return rollbar;
});