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
  testRunner: "vitest",
  buildCommand: "tsc -b",
  coverageAnalysis: "perTest",
  tsconfigFile: "test/tsconfig.json",
  disableTypeChecks: "{test,src,lib}/**/*.{js,ts,jsx,tsx,html,vue,cts,mts}",
  mutate: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
  ],
};
