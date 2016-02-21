define(["test/helpers/image-matcher", "test/helpers/colour-matchers", "test/helpers/soon-matcher",
        "test/helpers/approx-matcher", "test/helpers/as-promise", "test/helpers/preload-building-bitmaps"],
  function (ImageMatcher, ColourMatchers, SoonMatcher, ApproxMatcher, asPromise) {
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

    function wrapWithPromises(name: string) {
      var originalFunction = <any> window[name];

      var newFunction = <any> function () {
        var args = [].slice.call(arguments);

        var testCallback = args[args.length - 1];
        args[args.length - 1] = function () {
          return asPromise(testCallback, this);
        };

        return originalFunction.apply(this, args);
      };

      newFunction.only = originalFunction.only;

      window[name] = newFunction;
    }

    ['before', 'after', 'beforeEach', 'afterEach', 'it', 'describe'].forEach(wrapWithPromises);

    beforeEach(() => {
      var chromeStub = <typeof SinonChrome> <any> window.chrome;

      chromeStub.runtime.lastError = undefined;
      chromeStub.tabs.create.reset();
      chromeStub.tabs.update.reset();
      chromeStub.tabs.remove.reset();

      chromeStub.tabs.get.reset();
      chromeStub.tabs.get.resetBehavior();
      chromeStub.tabs.update.reset();
      chromeStub.tabs.update.resetBehavior();
      chromeStub.tabs.query.reset();
      chromeStub.tabs.query.resetBehavior();
      chromeStub.tabs.getCurrent.reset();
      chromeStub.tabs.getCurrent.resetBehavior();

      chromeStub.notifications.clear.reset();
      chromeStub.notifications.create.reset();

      chromeStub.storage.sync.get.reset();
      chromeStub.storage.sync.get.resetBehavior();
      chromeStub.storage.sync.get.yields({});

      chromeStub.storage.local.get.reset();
      chromeStub.storage.local.get.resetBehavior();
      chromeStub.storage.local.get.yields({});

      chromeStub.runtime.sendMessage.reset();
    });
  }
);

var expect: Chai.ExpectStatic;
interface Window {
  expect: Chai.ExpectStatic;
}