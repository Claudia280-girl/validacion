module.exports = {
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary', 'html'],
  projects: [
    {
      displayName: 'unit',
      rootDir: '.',
      moduleFileExtensions: ['js', 'json', 'ts'],
      testRegex: 'src/.*(?<!\\.e2e)\\.spec\\.ts$',
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/taskflow-frontend/'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/**/*.e2e.spec.ts',
        '!src/**/*.dto.ts',
        '!src/**/*.schema.ts',
        '!src/**/*.module.ts',
        '!src/**/*.controller.ts',
        '!src/app.module.ts',
        '!src/main.ts',
        '!src/config/**',
      ],
      testEnvironment: 'node',
    },
    {
      displayName: 'e2e',
      rootDir: '.',
      moduleFileExtensions: ['js', 'json', 'ts'],
      testRegex: 'src/.*\\.e2e\\.spec\\.ts$',
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/taskflow-frontend/'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      testEnvironment: 'node',
    },
  ],
};
