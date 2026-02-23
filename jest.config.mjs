import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  testEnvironment: "node",
  clearMocks: true,
  testMatch: ["**/*.test.ts"],
}

export default createJestConfig(customJestConfig)
