/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  packageManager: "npm",
  reporters: [
    "html",
    "clear-text",
    "progress",
    "dashboard",
  ],
  testRunner: "mocha",
  buildCommand: "tsc -b",
  coverageAnalysis: "perTest",
  tsconfigFile: "test/tsconfig.json",
  mutate: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
  ],
  mochaOptions: {
    spec: [ "src/**/*.spec.ts" ],
    require: [ "ts-node/register" ],
  },
};
