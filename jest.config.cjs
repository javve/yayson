module.exports = {
  maxWorkers: 1,
  preset: 'jest-esbuild',
  testEnvironment: 'node',
  testMatch: ['**/test/yayson/**/*.js'],
  moduleDirectories: ['node_modules', '<rootDir>'],
}
