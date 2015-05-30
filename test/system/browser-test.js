var sw = require('selenium-webdriver');

var capabilities = sw.Capabilities.chrome();
capabilities.set('chromeOptions', { 'args': ['--load-extension=/opt/extension'] });

var driver = new sw.Builder()
                   .withCapabilities(capabilities)
                   .usingServer('http://localhost:32774/wd/hub')
                   .build();

driver.get("http://google.com").then(function () {
  return driver.getTitle();
}).then(function (title) {
  console.log("Loaded: " + title);
});