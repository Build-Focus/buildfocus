var chromeStub = <typeof SinonChrome> <any> window.chrome;

export function resetTabHelper() {
  chromeStub.tabs.get.yields({url: "main.html?failed=true"});
  chromeStub.tabs.update.yields();
  chromeStub.tabs.getCurrent.yields({ id: "current-tab-id" });

  activateTab("http://google.com");
  givenBadDomains(...[]);
}

export function activateTab(url) {
  chromeStub.tabs.query.yields([{ "url": url, "id": 1, "active": true }]);
  chromeStub.tabs.onActivated.trigger();
}

export function closeTab() {
  chrome.runtime.lastError = { "message": "No tab with id..." };
  chromeStub.tabs.get.yields();
}

export function givenTabs(...urls: string[]) {
  chromeStub.tabs.query.yields(urls.map((url, index) => {
    return { "url": url, "id": index, "active": false }
  }));
  chromeStub.tabs.onActivated.trigger();
}

export function givenBadDomains(...urlPatterns: string[]) {
  chromeStub.storage.onChanged.trigger({"badDomainPatterns": {"newValue": urlPatterns}});
  chromeStub.storage.sync.get.withArgs("badDomainPatterns").yields({ "badDomainPatterns": urlPatterns });
}

