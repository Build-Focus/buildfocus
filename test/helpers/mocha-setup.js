mocha.setup('bdd');
var expect = chai.expect;

chai.use(ColourMatchers);
chai.use(ImageMatchers);
chai.use(SoonMatchers);