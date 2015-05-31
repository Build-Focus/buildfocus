var sw = require('selenium-webdriver');
var expect = require('chai').expect;

function extensionPage(pagePath) {
  return "chrome-extension://ednpnngpmfdcjpkjnigpokincopbdgbp/" + pagePath;
}

describe("System tests - ", function () {
  var driver;

  function addBadDomain(domain) {
    return driver.get(extensionPage("options.html")).then(function () {
      return driver.findElement({css: "input[type=text]"});
    }).then(function (domainEntry) {
      return domainEntry.sendKeys(domain);
    }).then(function () {
      return driver.findElement({css: "button[type=submit]"});
    }).then(function (submitButton) {
      return submitButton.click();
    });
  }

  function openNewTab() {
    return driver.findElement({css: "body"}).then(function (element) {
      return element.sendKeys(sw.Key.CONTROL + "t");
    });
  }

  function startPomodoro() {
    return openNewTab().then(function () {
      return driver.get(extensionPage("rivet.html"))
    }).then(function () {
      return driver.findElement({css: ".startPomodoro"});
    }).then(function (startButton) {
      return startButton.click();
    });
  }

  before(function () {
    var capabilities = sw.Capabilities.chrome();
    capabilities.set('chromeOptions', { 'args': ['--load-extension=/var/ftp/uploaded'] });

    driver = new sw.Builder()
      .withCapabilities(capabilities)
      .usingServer(process.env.SELENIUM_URL)
      .build();

    // Need to do an initial load to make the driver live and working in the tests, for some reason (??)
    return driver.get(extensionPage("options.html"));
  });

  it("Can open Rivet page", function () {
    return driver.get(extensionPage("rivet.html")).then(function () {
      return driver.findElement({css: ".score"});
    }).then(function (score) {
      return score.getText();
    }).then(function (scoreText) {
      // This is dependent on test order - could probably be avoided, but not worth worrying about for now methinks.
      expect(scoreText).to.equal("0 Points");
    });
  });

  it("Can open options page", function () {
    return driver.get(extensionPage("options.html")).then(function () {
      return driver.findElement({css: "button[type=submit]"});
    }).then(function (submitButton) {
      return submitButton.isEnabled();
    }).then(function (isSubmitEnabled) {
      // The submit button is disabled initially by JS, this is a smoke test
      // to check the core JS ran and probably set up the page successfully
      expect(isSubmitEnabled).to.equal(false, "Submit button should be disabled initially (i.e. options JS should load)");
    });
  });

  it("Can fail a pomodoro", function () {
    return addBadDomain("twitter.com").then(
      startPomodoro
    ).then(function () {
      return driver.get("http://twitter.com");
    }).then(function () {
      return driver.getCurrentUrl();
    }).then(function (loadedUrl) {
      expect(loadedUrl).to.equal(extensionPage("rivet.html?failed=true"));
    });
  });

  xit("Can complete a pomodoro", function () {
    // TODO: Implement this once there's a nice way to detect that a pomodoro is in progress

    var expectedPoints = null;

    return startPomodoro().then(function () {
      return driver.get(extensionPage("rivet.html"));
    }).then(function () {
      driver.findElement({css: '.score'})
    }).then(function (scoreElement) {
      driver.wait(sw.until.elementTextIs(scoreElement, "1 Points"))
    });
    // Wait up to 26 minutes, until the pomodoro's completed

    // Check it was about 25 minutes
    // Check we're a point up on where we started
  });
});