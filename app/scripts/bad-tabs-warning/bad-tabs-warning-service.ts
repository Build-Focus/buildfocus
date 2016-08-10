import ko = require("knockout");

import publishedObservable = require("data-synchronization/published-observable");
import { subscribableEvent } from "data-synchronization/subscribable-event";
import Tab = require("url-monitoring/tab");
import BadBehaviourMonitor = require("url-monitoring/bad-behaviour-monitor");

class BadTabsWarningService {
    constructor(private badBehaviourMonitor: BadBehaviourMonitor,
                private allTabs: KnockoutObservableArray<Tab>) { }

    isWarningActive = publishedObservable("bad-tabs.warning-active",
                                          ko.observable(false));

    warnIfRequired(): Promise<void> {
        if (this.badBehaviourMonitor.currentBadTabs().length > 0) {
            this.isWarningActive(true);
        }

        // This promise may *never* resolve, by design. If the warning service
        // is reset, outstanding promises are cancelled (i.e. forever pending)
        return new Promise<void>((resolve, reject) => {
            var unsubscribePromise = () => {
                badTabSubscription.dispose();
                this.resetEvent.remove(resetSubscription);
            }

            var resetSubscription = this.resetEvent(unsubscribePromise);

            var badTabsObservable = this.badBehaviourMonitor.currentBadTabs;
            var badTabSubscription = badTabsObservable.triggerableSubscribe((badTabs) => {
                if (badTabs.length === 0) {
                    unsubscribePromise();
                    this.isWarningActive(false);
                    resolve();
                } else {
                    this.isWarningActive(true);
                }
            });
            badTabSubscription.trigger();
        });
    }

    /**
     * Reset disables any existing warnings, and ensures that any currently outstanding
     * requests for operations to occur after bad tabs have been warned about *never* fire.
     */
    reset() {
        this.resetEvent.trigger();
        this.isWarningActive(false);
    }

    private resetEvent = subscribableEvent();
}

export = BadTabsWarningService;
