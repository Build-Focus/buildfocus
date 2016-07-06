import ko = require("knockout");

import { isBadTabWarningActive } from "test/helpers/saved-state-helper";
import { dismissBadTabsWarning } from "test/helpers/messaging-helper";

import Tab = require("app/scripts/url-monitoring/tab");
import BadBehaviourMonitor = require("app/scripts/url-monitoring/bad-behaviour-monitor");

import BadTabsWarningService = require("app/scripts/bad-tabs-warning/bad-tabs-warning-service");

describe("Bad tabs warning service", () => {
    var allTabs: KnockoutObservableArray<Tab>;
    var badTabs: KnockoutObservableArray<Tab>;
    var showMainPage: Sinon.SinonStub;

    var service: BadTabsWarningService;

    beforeEach(() => {
        allTabs = ko.observableArray([]);
        badTabs = ko.observableArray([]);

        var badBehaviourMonitor = <BadBehaviourMonitor> <any> { currentBadTabs: badTabs };
        showMainPage = sinon.stub();

        service = new BadTabsWarningService(badBehaviourMonitor, allTabs, showMainPage);
    });

    it("should initially not be showing a warning", () => {
        expect(isBadTabWarningActive()).to.equal(false);
    });

    it("should immediately resolve the warning promise when no bad tabs are open", () => {
        return expect(service.warnIfRequired()).to.eventually.be.fulfilled;
    });

    xdescribe("if a distracting page is open, and no Build Focus pages", () => {
        beforeEach(() => {
            badTabs(["http://twitter.com"]);
            allTabs(badTabs());
        });

        it("should open a warning page when one is opened", () => {
            expect(showMainPage.called).to.equal(true);
        });

        it("should close the Build Focus page when distracting tabs disappear");

        it("should close the Build Focus page when the warning is dismissed");
    });

    describe("if a distracting page is open, and a Build Focus page", () => {
        beforeEach(() => {
            badTabs(["http://twitter.com"]);
            allTabs(badTabs().concat([chrome.runtime.getURL("main.html")]));
        });

        it("should not open a warning page when one is opened", () => {
            expect(showMainPage.called).to.equal(false);
        });

        it("should not close the Build Focus page when distracting tabs disappear");

        it("should not close the Build Focus page when the warning is dismissed");
    });

    describe("when a warning is triggered", () => {
        var warningPromise: Promise<void>;
        
        beforeEach(() => {
            badTabs(["http://twitter.com"]);
            allTabs(badTabs());
            warningPromise = service.warnIfRequired();
        });

        it("should not immediately resolve the warning promise", () => {
            return expect(warningPromise).to.be.pending;
        });

        it("should trigger a warning in all Build Focus tabs", () => {
            expect(isBadTabWarningActive()).to.equal(true);
        });

        describe("if distracting pages are closed", () => {
            beforeEach(() => badTabs([]));

            it("should stop showing the warning", () => {
                expect(isBadTabWarningActive()).to.equal(false);
            });

            it("should resolve the warning promise", () => {
                return expect(warningPromise).to.be.fulfilled;
            });

            it("should close no tabs");
        });

        describe("if the warning is dismissed", () => {
            beforeEach(() => badTabs([]));

            it("should stop showing the warning", () => {
                expect(isBadTabWarningActive()).to.equal(false);
            });

            it("should resolve the warning promise", () => {
                return expect(warningPromise).to.be.fulfilled;
            });

            it("should close no tabs");
        });

        describe("if reset is called", () => {
            beforeEach(() => service.reset());

            it("should not show a warning", () => {
                expect(isBadTabWarningActive()).to.equal(false);
            });

            it("should never resolve outstanding promises", () => {
                dismissBadTabsWarning();
                badTabs([]);

                return expect(warningPromise).to.be.pending;
            });
        });
    });
});
