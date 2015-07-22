define(["test/helpers/image-matcher", "test/helpers/colour-matchers", "test/helpers/soon-matcher"],
  function (ImageMatcher, ColourMatchers, SoonMatcher) {
    mocha.setup('bdd');
    window.expect = chai.expect;

    chai.use(ColourMatchers);
    chai.use(ImageMatcher);
    chai.use(SoonMatcher);
  }
);