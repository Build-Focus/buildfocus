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
    // score -> /app/scripts/score.ts
    // /app/scripts/score -> /app/scripts/score.ts
    // /test/a.ts -> /test/a.ts
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
