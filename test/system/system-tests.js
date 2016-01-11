var sw = require('selenium-webdriver');
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
        'args': ['--load-extension=' + process.env.EXTENSION_PATH]
      },
      host: process.env.SELENIUM_URL
    };

    client = webdriverio.remote({desiredCapabilities: capabilities}).init();
    chaiAsPromised.transferPromiseness = client.transferPromiseness;
    addCustomCommands(client);

    // Close the automatically opened intro tab, if present
    return client.pause(1000).getTabIds().then(function (ids) {
      if (ids.length > 1) {
        return client.switchToLastTab()
                     .click(".hopscotch-close")
                     .closeTab();
      } else {
        return client;
      }
    });
  });

  afterEach(() => client.end());

  it("Can open main page", () => {
    return client
      .url(extensionPage("main.html"))
      .pause(500)
      .hasNonZerodPixels(".city > canvas").should.eventually.equal(true, "Canvas should have an image drawn on it");
  });

  it("Can open options page", () => {
    return client
      .url(extensionPage("options.html"))
      .pause(500)
      .isEnabled("button[type=submit]").should.eventually.equal(false,
        "Submit button should be disabled initially (i.e. options JS should load and run)");
  });

  it("Can fail a pomodoro", () => {
    return addBadDomain("example.com")
     .then(startPomodoro)
     .url("http://example.com")
     .pause(1000)
     .getUrl().should.eventually.contain(extensionPage("main.html?failed=true"));
  });

  xit("Can complete a pomodoro", function () {
    // TODO: Implement this once there's a nice way to detect that a pomodoro is in progress
  });

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
      .click(".startPomodoro").pause(100)
      .switchToLastTab();
  }
});