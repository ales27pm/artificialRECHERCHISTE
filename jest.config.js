module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(?:@react-native|react-native|@react-native-community|@react-navigation|expo(nent)?|expo-modules-core|expo-[^/]+|victory-native|d3-(array|scale|shape)|react-native-svg|@shopify/flash-list|@shopify/react-native-skia|uuid)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
