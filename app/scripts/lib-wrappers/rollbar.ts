'use strict';

define(["raw-rollbar", "config"], function (Rollbar, config) {
  var rollbar = Rollbar.init(config.rollbarConfig);

  chrome.identity.getProfileUserInfo((userInfo) => {
    if (userInfo.id) {
      rollbar.configure({payload: {person: {id: userInfo.id, email: userInfo.email}}});
    }
  });

  return rollbar;
});