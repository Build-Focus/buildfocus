var chromeStub = <typeof SinonChrome> <any> window.chrome;

export function startPomodoro() {
    chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});
}

export function startBreak() {
    chromeStub.runtime.onMessage.trigger({"action": "start-break"});
}

export function dismissBadTabsWarning() {
    chromeStub.runtime.onMessage.trigger({"action": "dismiss-bad-tabs-warning"});
}

export function respondToLastMessageWith(response) {
    chromeStub.runtime.sendMessage.lastCall.yield(response);
}
