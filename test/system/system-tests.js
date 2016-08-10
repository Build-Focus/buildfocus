var webdriverio = require('webdriverio');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.Should();

function extensionPage(pagePath) {
  return "chrome-extension://apckocnmlmkhhigodidbpiakommhmiik/" + pagePath;
}

describe("System tests - ", function () {
  var client;

  beforeEach(function () {
    var capabilities = {
      browserName: 'chrome',
      chromeOptions: {
        'args': [
          '--user-data-dir=' + process.env.CHROME_DATA_PATH,
          '--load-extension=' + process.env.EXTENSION_PATH
        ]
      },
      host: process.env.SELENIUM_URL
    };

    console.log("Loading extension from ", process.env.EXTENSION_PATH);
    console.log("Loading user data from ", process.env.CHROME_DATA_PATH);
    client = webdriverio.remote({desiredCapabilities: capabilities}).init();
    chaiAsPromised.transferPromiseness = client.transferPromiseness;
    addCustomCommands(client);

    // Close the automatically opened intro tab, if present
    return client.pause(1000).getTabIds().then(function (ids) {
      if (ids.length > 1) {
        console.log("Tour present, closing automatically");
        return client.switchToLastTab()
                     .waitForVisible(".hopscotch-close", 2000)
                     .click(".hopscotch-close")
                     .closeTab();
      } else {
        // Make sure we've definitely killed the tour.
        return client.url(extensionPage("main.html"))
                     .execute(() => chrome.storage.local.set({ "intro-tour-levels": [1] }));
      }
    }).then(() => console.log("Starting test"));
  });

  afterEach(() => client.end());

  it("Can open main page", () => {
    return client
      .url(extensionPage("main.html"))
      .pause(2000)
      .then(() => console.log("Checking main page for a rendered city"))
      .hasNonZerodPixels(".city > canvas").should.eventually.equal(true, "Canvas should have an image drawn on it");
  });

  if (!process.env.WERCKER) {
    xit("Can pause a pomodoro", ()  => {
      // This test is especially weird: since there's no user, we start countnig
      // 'idle' from the very start. Works for now though, and it's close enough.
      // Needs to stay near the top of the test list, or this might get unstable.

      return startPomodoro()
        .url(extensionPage("main.html"))
        .pause(1000 * 35) // Should actually be at 30s, but a little leeway
        .then(() => console.log("Checking main page shows a paused pomodoro"))
        .getText(".overlay").should.eventually.match(/Paused\s+24:\d\d/);
    });

    it("Can open options page", () => {
      return client
        .url(extensionPage("options.html"))
        .pause(500)
        .then(() => console.log("Checking options page for correctly disabled buttons"))
        .isEnabled("button[type=submit]").should.eventually.equal(false,
          "Submit button should be disabled initially (i.e. options JS should load and run)");
    });

    it("Can fail a pomodoro", () => {
      return addBadDomain("example.com")
        .then(() => console.log("Added example.com, now starting pomodoro"))
        .then(startPomodoro)
        .then(() => console.log("Opening example.com"))
        .url("http://example.com")
        .pause(1000)
        .then(() => console.log("Checking we've ended up on the failure page"))
        .getUrl().should.eventually.contain(extensionPage("main.html?failed=true"));
    });

    it("Can start a pomodoro", ()  => {
      return startPomodoro()
        .url(extensionPage("main.html"))
        .pause(500)
        .then(() => console.log("Checking main page shows a running pomodoro"))
        .isEnabled(".startPomodoro").should.eventually.equal(false, "Pomodoro button should be disabled")
        .getText(".overlay").should.eventually.match(/Focusing\s+24:\d\d/);
    });

    xit("Can complete a pomodoro", function () {
      // TODO: Implement this once there's a nice way to detect that a pomodoro is in progress
    });
  }

  function addCustomCommands(client) {
    client.addCommand("switchToLastTab", () => client.getTabIds().then((ids) => client.switchTab(ids[ids.length - 1])));

    // Have to end with 'NULL' to release modifier keys
    client.addCommand("openTab", () => client.keys(["Control", "t", "NULL"]).switchToLastTab());
    client.addCommand("closeTab", () => client.keys(["Control", "w", "NULL"]).switchToLastTab());

    client.addCommand("hasNonZerodPixels", function (canvasSelector) {
      return this.execute(function (canvasSelector) {
        var canvas = document.querySelector(canvasSelector);

        var canvasContext = canvas.getContext("2d");
        var canvasMiddleBytes = canvasContext.getImageData(canvas.width/2 - 10, canvas.height/2 - 10, 20, 20).data;
        var canvasMiddleBytesArray = [].slice.call(canvasMiddleBytes);

        return canvasMiddleBytesArray.filter((byte) => byte !== 0).length > 0;
      }, canvasSelector).then((result) => result.value);
    });
  }

  function addBadDomain(domain) {
    return client
      .url(extensionPage("options.html")).pause(100)
      .setValue("input[type=text]", domain).pause(100)
      .click("button[type=submit]");
  }

  function startPomodoro() {
    return client.openTab()
                 .url(extensionPage("main.html")).pause(500)
                 .click(".startPomodoro").pause(1000)
                 .switchToLastTab();
  }
});
