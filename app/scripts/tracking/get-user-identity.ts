import storeOnceTrackingData = require("tracking/store-once-tracking-data");

interface UserIdentity {
  machineId: string;
  userId: string;
  email: string;
}

export = function getUserIdentity(): Promise<UserIdentity> {
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