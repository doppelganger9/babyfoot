
import { configDefaults, defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: [
      ...configDefaults.include,
      '**/test/*.ts',
      '!.stryker-tmp/**/*'
    ],
    passWithNoTests: true,
    testTimeout: 10_000,
    coverage: {
      reporter: [
        'text', 'html', 'clover', 'json', 'lcov'
      ]
    }
  },
});
