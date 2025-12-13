// @ts-check

/** @type {import("jest").Config} */
export default {
  verbose: true,
  randomize: true,
  showSeed: true,
  moduleFileExtensions: ["js", "mjs", "cjs", "json", "ts", "mts", "cts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["<rootDir>/test/**/*.test.ts"],
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/eip4361/constants\\.ts",
    "<rootDir>/src/eip4361/errors\\.ts",
    "<rootDir>/src/zod/zod-schema\\.ts",
  ],
  // coverageThreshold: {
  //   global: {
  //     statements: 75,
  //     branches: 75,
  //     functions: 75,
  //     lines: 75,
  //   },
  // },
  testEnvironment: "node",
  reporters: [["github-actions", { silent: false }], "summary"],
  transformIgnorePatterns: ["/node_modules/(?!(apg-lite)/)"],
  transform: {
    // "^.+\\.(t|j)s$": [
    //   "ts-jest",
    //   {
    //     tsconfig: "test/tsconfig.json",
    //   },
    // ],
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
