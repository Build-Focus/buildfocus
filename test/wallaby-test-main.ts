declare var wallaby: {
  delayStart(): void,
  tests: string[],
  start(): void
};

interface Require {
  s: any;
}

(function () {
  wallaby.delayStart();

  requirejs.config({
    baseUrl: "/app/scripts",

    paths: {
      test: '/test',
    },

    map: {
      test: {
        'app/scripts': ''
      }
    },

    urlArgs: "ts=" + Date.now(),

    deps: ["test/helpers/mocha-setup"].concat(wallaby.tests),
    callback: function() {0
      wallaby.start();
    }
  });
})();
