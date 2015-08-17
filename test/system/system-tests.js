var sw = require('selenium-webdriver');
var expect = require('chai').expect;

function extensionPage(pagePath) {
  return "chrome-extension://apckocnmlmkhhigodidbpiakommhmiik/" + pagePath;
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

  function scrollTo(element) {
    return driver.executeScript(function (element) {
      element.scrollIntoView(true);
    }, element).then(function () {
      return element;
    });
  }

  function startPomodoro() {
    return openNewTab().then(function () {
      return driver.get(extensionPage("main.html"));
    }).then(function () {
      return driver.findElement({css: ".startPomodoro"});
    }).then(function (startButton) {
      return scrollTo(startButton);
    }).then(function (startButton) {
      return startButton.click();
    });
  }

  function canvasContainsDrawnPixels(canvas) {
    return driver.executeScript(function (canvas) {
      var canvasContext = canvas.getContext("2d");
      var canvasMiddleBytes = canvasContext.getImageData(canvas.width/2 - 10, canvas.height/2 - 10, 20, 20).data;
      var canvasMiddleBytesArray = [].slice.call(canvasMiddleBytes);
      var nonZeroBytes = canvasMiddleBytesArray.filter(function (byte) {
        return byte !== 0;
      }).length;

      return nonZeroBytes > 0;
    }, canvas);
  }

  before(function () {
    var capabilities = sw.Capabilities.chrome();
    capabilities.set('chromeOptions', { 'args': ['--load-extension=' + process.env.EXTENSION_PATH] });

    driver = new sw.Builder()
      .withCapabilities(capabilities)
      .usingServer(process.env.SELENIUM_URL)
      .build();

    // Need to do an initial load to make the driver live and working in the tests, for some reason (??)
    return driver.get(extensionPage("options.html"));
  });

  it("Can open main page", function () {
    return driver.get(extensionPage("main.html")).then(function () {
      return driver.wait(sw.until.elementLocated({css: ".city > canvas"}), 1000);
    }).then(function (cityCanvas) {
      return canvasContainsDrawnPixels(cityCanvas);
    }).then(function (canvasContainsDrawnPixels) {
      expect(canvasContainsDrawnPixels).to.equal(true,
        "City canvas should have an image drawn on it");
    });
  });

  it("Can open options page", function () {
    return driver.get(extensionPage("options.html")).then(function () {
      return driver.findElement({css: "button[type=submit]"});
    }).then(function (submitButton) {
      return driver.wait(function () {
        // Wait until the button is *not* enabled
        return submitButton.isEnabled().then(function (enabled) { return !enabled; });
      }, 1000);
    }).then(function (isSubmitDisabled) {
      // The submit button is disabled initially by JS, this is a smoke test
      // to check the core JS ran and probably set up the page successfully
      expect(isSubmitDisabled).to.equal(true,
        "Submit button should be disabled initially (i.e. options JS should load)");
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
      expect(loadedUrl).to.equal(extensionPage("main.html?failed=true"));
    });
  });

  xit("Can complete a pomodoro", function () {
    // TODO: Implement this once there's a nice way to detect that a pomodoro is in progress

    var expectedPoints = null;

    return startPomodoro().then(function () {
      return driver.get(extensionPage("main.html"));
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