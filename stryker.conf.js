module.exports = function(config) {
  config.set({
    mutator: "typescript",
    packageManager: "npm",
    reporters: ["html", "clear-text", "progress", "dashboard"],
    testRunner: "mocha",
    transpilers: ["typescript"],
    testFramework: "mocha",
    coverageAnalysis: "perTest",
    tsconfigFile: "test/tsconfig.json",
    mutate: ["src/**/*.ts", "!src/**/*.spec.ts"],
    mochaOptions: {
        opts: "test/mocha.opts",
        files: "dist/**/*.spec.js",
        ui: "bdd",
        timeout: 3000,
        grep: /.*/
    },
    logLevel: 'debug'
  });
};
