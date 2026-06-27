module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 50,
    },
  },
};
