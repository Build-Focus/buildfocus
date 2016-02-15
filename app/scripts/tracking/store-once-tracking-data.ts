import storeOnce = require('chrome-utilities/store-once');

function guid(): string {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function getInstallTime() {
  return storeOnce.getLocally("install-time", Date.now());
}

export function getFirstUse() {
  return storeOnce.getSynced("first-use", Date.now());
}

export function getMachineId() {
  return storeOnce.getLocally("machine-id", guid());
}

export function getUserId() {
  return storeOnce.getSynced("user-id", guid());
}
