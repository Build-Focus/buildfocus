// TODO: With some proper testing (and subsequent fixing) this could be usefully open-sourced

declare module Chai {
  interface Assertion {
    soon: SoonAssertion
  }

  interface SoonAssertion extends Assertion {
    (duration: number): Assertion;
  }
}

define(function () {
  // Grab this at the start, as some tests mess with it (e.g. Sinon clock stubbing)
  var setTimeout = window.setTimeout;

  return function soonMatchers(chai, utils) {
    function makeAssertionsCheckForDelay() {
      var Assertion = chai.Assertion;
      var propertyNames = Object.getOwnPropertyNames(Assertion.prototype);

      var propertyDescs = {};
      propertyNames.forEach(function (name) {
        propertyDescs[name] = Object.getOwnPropertyDescriptor(Assertion.prototype, name);
      });

      var methodNames = propertyNames.filter(function (name) {
        return name !== "assert" && typeof propertyDescs[name].value === "function";
      });

      methodNames.forEach(function (methodName) {
        Assertion.overwriteMethod(methodName, function (originalMethod) {
          return function () {
            callPotentiallyAsync(originalMethod, this, arguments);
          };
        });
      });
    }

    function callPotentiallyAsync(asserter, assertion, args) {
      var delay = utils.flag(assertion, "assertionDelay");
      if (!delay) {
        return asserter.apply(assertion, args);
      } else {
        var assertionPromise = new Promise(function (resolve, reject) {
          setTimeout(function () {
            try {
              var result = asserter.apply(assertion, args);

              // If the assertion itself returns a promise
              if (result.then !== undefined) {
                result.then(resolve, reject);
              } else {
                resolve(result);
              }
            } catch (e) {
              reject(e);
            }
          }, delay);
        });

        assertion.then = assertionPromise.then.bind(assertionPromise);
        assertion.catch = assertionPromise.catch.bind(assertionPromise);
        return assertion;
      }
    }

    function setDelay(assertion, duration) {
      utils.flag(assertion, 'assertionDelay', duration);
    }

    makeAssertionsCheckForDelay();

    // Asserts on a canvas and takes an image path, ensures they contain the exact same data
    chai.Assertion.addChainableMethod('soon', function asMethod(duration) {
      var assertion = this;
      setDelay(assertion, duration);
      return assertion;
    }, function asProperty() {
      var assertion = this;
      setDelay(assertion, 2000);
      return assertion;
    });
  };
});