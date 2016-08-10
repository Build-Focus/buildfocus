import ko = require("knockout");

import subscribedObservable = require("data-synchronization/subscribed-observable");
import reportChromeErrors = require("chrome-utilities/report-chrome-errors");

class ProxyBadTabsWarningService {
    isWarningActive = subscribedObservable("bad-tabs.warning-active", false);

    dismissBadTabsWarning() {
        chrome.runtime.sendMessage({"action": "start-break"},
                                   () => reportChromeErrors("Failed to dismiss warning"));
    }
}

export = ProxyBadTabsWarningService;
