var chromeStub = <typeof SinonChrome> <any> window.chrome;

// Note that this returns a promise, because you have to .then() to ensure
// you wait until the warning service promise in background page has resolved.
export function startPomodoro(): Promise<void> {
    chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"}, null, () => {});
    return Promise.resolve(null);
}

export function startBreak() {
    chromeStub.runtime.onMessage.trigger({"action": "start-break"}, null, () => {});
}

export function dismissBadTabsWarning() {
    chromeStub.runtime.onMessage.trigger({"action": "dismiss-bad-tabs-warning"});
}

export function respondToLastMessageWith(response) {
    chromeStub.runtime.sendMessage.lastCall.yield(response);
}
