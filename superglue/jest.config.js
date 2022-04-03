module.exports = async () => {
  return {
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    verbose: true,
    testEnvironment: 'jsdom',
    clearMocks: true,
    setupFiles: [
      "<rootDir>/spec/helpers/setup.js",
      "<rootDir>/spec/helpers/polyfill.js"
    ]
  };
};

