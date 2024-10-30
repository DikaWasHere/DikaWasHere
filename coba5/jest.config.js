module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  // Hapus setupFiles jika Anda tidak memerlukannya saat ini
  // setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "clover"],
};
