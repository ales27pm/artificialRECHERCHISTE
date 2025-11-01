import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
try {
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch {
  // NativeAnimatedHelper is not available in React Native 0.79 desktop builds used by Jest.
}
