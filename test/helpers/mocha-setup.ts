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
  }
);

var expect: Chai.ExpectStatic;
interface Window {
  expect: Chai.ExpectStatic;
}