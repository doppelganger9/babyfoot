module.exports = function(config) {
  config.set({
    mutator: "typescript",
    packageManager: "npm",
    reporters: [
      "html",
      "clear-text",
      "progress",
      "dashboard",
    ],
    testRunner: "mocha",
    transpilers: ["typescript"],
    testFramework: "mocha",
    coverageAnalysis: "perTest",
    tsconfigFile: "test/tsconfig.json",
    mutate: [
      "src/**/*.ts",
      "!src/**/*.spec.ts",
    ],
    mochaOptions: {
        spec: [
          'dist/**/*.spec.js',
        ],
        opts: "test/mocha.opts",
        ui: "bdd",
    },
  });
};
