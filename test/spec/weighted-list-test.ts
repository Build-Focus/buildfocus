import WeightedList = require('app/scripts/weighted-list');

describe("A weighted list", () => {
  it("should be empty initially", () => {
    var list = new WeightedList<string>();
    expect(list.length).to.equal(0);
  });

  it("should allow you to push elements", () => {
    var list = new WeightedList<string>();

    list.push("x", 1);

    expect(list.length).to.equal(1);
  });

  it("should allow you to get a random element", () => {
    var list = new WeightedList<string>();

    list.push("a", 1);
    list.push("b", 1);

    var randomValue = list.get();
    expect(["a", "b"]).to.contain(randomValue);
  });

  it("should return null when getting from an empty list", () => {
    var list = new WeightedList<string>();

    var randomValue = list.get();

    expect(randomValue).to.equal(null);
  });

  // This is random, so could potentially fail intermittently, but it's very unlikely to.
  // 0 failures in a quick run of 500 tests.
  it("should be distributed roughly proportionately, over a 10000 runs", () => {
    var list = new WeightedList<string>();

    list.push("a", 1);
    list.push("b", 2);
    list.push("c", 4);

    var results = _.range(10000).map(() => list.get());
    var counts = _.countBy(results);

    expect(counts["a"] + counts["b"] + counts["c"]).to.equal(10000);
    expect(counts["c"]).to.be.approx(counts["a"] * 4);
    expect(counts["b"]).to.be.approx(counts["a"] * 2);
  });
});