import rollbar = require('rollbar');

import _ = require('lodash');
import config = require('config');
import synchronizedObservable = require('observables/synchronized-observable');
import storeOnceTrackingData = require("tracking/store-once-tracking-data");

import Keen = require('keen');

function setUpCalq() {
  (function(e, t) {
    if (!t.__SV) {
      (<any>window).calq = t;
      var n = e.createElement("script");
      n.type = "text/javascript";
      n.src = chrome.extension.getURL("scripts/dependencies/calq-core-1.0.js");
      n.async = !0;
      var r = e.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(n, r);
      t.init = function(e, o) {
        if (t.writeKey) return;
        t.writeKey = e;
        t._initOptions = o;
        t._execQueue = [];
        var m = "action.track action.trackSale action.trackHTMLLink action.trackPageView action.setGlobalProperty user.profile user.identify user.clear".split(" ");
        for (var n = 0; n < m.length; n++) {
          var f = function() {
            var r = m[n];
            var s = function() {
              t._execQueue.push({
                m: r,
                args: arguments
              })
            };
            var i = r.split(".");
            if (i.length == 2) {
              if (!t[i[0]]) {
                t[i[0]] = []
              }
              t[i[0]][i[1]] = s
            } else {
              t[r] = s
            }
          }();
        }
      };
      t.__SV = 1
    }
  })(document, (<any>window).calq || []);

  calq.init(config.trackingConfig.calqWriteKey);
}

function setUpKeen(): KeenClient {
  return new Keen({
    projectId: config.trackingConfig.keenProjectId,
    writeKey: config.trackingConfig.keenWriteKey
  });
}

interface UserIdentity {
  machineId: string;
  userId: string;
  email: string;
}

function getUserIdentity(): Promise<UserIdentity> {
  return Promise.all<string|chrome.identity.UserInfo>([
    storeOnceTrackingData.getMachineId(),
    storeOnceTrackingData.getUserId(),
    new Promise<chrome.identity.UserInfo>((resolve, reject) => {
      chrome.identity.getProfileUserInfo((userInfo) => resolve(userInfo));
    })
  ]).then((rawData) => {
    var machineId = <string> rawData[0];
    var userId = <string> rawData[1];
    var chromeUserInfo = <chrome.identity.UserInfo> rawData[2];

    return {
      machineId: machineId,
      userId: chromeUserInfo.id || userId,
      email: chromeUserInfo.email
    };
  });
}

function identifyCurrentUser(keen: KeenClient) {
  return getUserIdentity().then((userIdentity) => {
    calq.user.identify(userIdentity.userId);
    if (userIdentity.email) calq.user.profile({ "$email": userIdentity.email });
    calq.action.setGlobalProperty(config.trackingConfig.extraInfo);

    keen.setGlobalProperties((eventCollectionName) => {
      return {
        "email": userIdentity.email || "UNKNOWN",
        "user_id": userIdentity.userId,
        "machine_id": userIdentity.machineId,
        "extra_info": config.trackingConfig.extraInfo,

        "user_agent": "${keen.user_agent}",
        "ip_address": "${keen.ip}",

        "keen": {
          "addons": [
            { "name": "keen:ua_parser", "input": { "ua_string": "user_agent" }, "output": "parsed_user_agent"},
            { "name": "keen:ip_to_geo", "input": { "ip": "ip_address" }, "output": "ip_geo_info"}
          ]
        }
      };
    });
  });
}

function trackInstallsAndUpdates() {
  chrome.runtime.onInstalled.addListener((installReason) => tracking.trackEvent("install", installReason));
  chrome.runtime.onUpdateAvailable.addListener((updateData) => tracking.trackEvent("update-available", updateData));
}

function trackExtensionLoad() {
  return Promise.all([
    storeOnceTrackingData.getFirstUse(),
    storeOnceTrackingData.getInstallTime()
  ]).then((rawData) => {
    tracking.trackEvent("page-load", {
      "url": window.location.href,
      "first_use": rawData[0],
      "install_time": rawData[1],
      "manifest": chrome.runtime.getManifest()
    });
  });
}

interface Tracking {
  trackEvent(eventName: string, eventData?: { [key: string]: any }): Promise<void>;
}

var tracking: Tracking;

if (config.trackingConfig.enabled) {
  setUpCalq();
  var keenClient = setUpKeen();

  tracking = {
    trackEvent: function (eventName:string, eventData?:{ [key: string]: any }): Promise<void> {
      return new Promise<void>(function (resolve, reject) {
        var timerId = setTimeout(() => {
          timerId = null;
          resolve();
        }, 500);

        calq.action.track(eventName, eventData);
        keenClient.addEvent(eventName, eventData, (err) => {
          if (err) {
            rollbar.error("Tracking error", {err: err, name: eventName, data: eventData});
          }

          if (timerId) {
            clearTimeout(timerId);
            resolve();
          }
        });
      });
    }
  };

  identifyCurrentUser(keenClient).then(trackExtensionLoad).then(trackInstallsAndUpdates);
} else {
  tracking = { trackEvent: () => Promise.resolve<void>() };
}

export = tracking;