import ko = require("knockout");

import publishedObservable = require("data-synchronization/published-observable");
import reportChromeErrors = require("chrome-utilities/report-chrome-errors");

class ProxyBadTabsWarningService {
    isWarningActive = publishedObservable("bad-tabs.warning-active", ko.observable(false));

    dismissBadTabsWarning() {
        chrome.runtime.sendMessage({"action": "start-break"},
                                   () => reportChromeErrors("Failed to dismiss warning"));
    }
}

export = ProxyBadTabsWarningService;
