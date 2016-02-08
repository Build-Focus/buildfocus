define(["test/helpers/image-matcher", "test/helpers/colour-matchers", "test/helpers/soon-matcher", "test/helpers/approx-matcher"],
  function (ImageMatcher, ColourMatchers, SoonMatcher, ApproxMatcher) {
    mocha.setup('bdd');
    window.expect = chai.expect;

    chai.use(ColourMatchers);
    chai.use(ImageMatcher);
    chai.use(SoonMatcher);
    chai.use(ApproxMatcher);

    var runningInDebug = !!document.URL.match(/debug\.html/);
    if (runningInDebug) {
      mocha.timeout(0);
    } else {
      mocha.timeout(2000);
    }

    beforeEach(() => {
      var chromeStub = <typeof SinonChrome> <any> window.chrome;

      chromeStub.runtime.lastError = undefined;
      chromeStub.tabs.create.reset();
      chromeStub.tabs.update.reset();
      chromeStub.tabs.remove.reset();

      chromeStub.tabs.get.reset();
      chromeStub.tabs.update.reset();
      chromeStub.tabs.query.reset();
      chromeStub.tabs.getCurrent.reset();

      chromeStub.notifications.clear.reset();
      chromeStub.notifications.create.reset();

      chromeStub.storage.sync.get.yields({});
      chromeStub.storage.local.get.yields({});

      chromeStub.runtime.sendMessage.reset();
    });
  }
);

var expect: Chai.ExpectStatic;
interface Window {
  expect: Chai.ExpectStatic;
}