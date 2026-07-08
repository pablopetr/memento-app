/**
 * Jest setup: mock native modules that can't run in Node environment.
 * Imported by jest.config.js setupFilesAfterEnv.
 */

import '@testing-library/jest-native/extend-expect';

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(null),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    requestPermission: jest.fn().mockResolvedValue(1), // AUTHORIZED
    getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
    onMessage: jest.fn(() => jest.fn()),
    onTokenRefresh: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
  })),
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    DENIED: 3,
  },
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('reminders'),
    displayNotification: jest.fn().mockResolvedValue(null),
    onForegroundEvent: jest.fn(() => jest.fn()),
    onBackgroundEvent: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn().mockResolvedValue(null),
  },
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
  },
  EventType: {
    PRESS: 1,
    ACTION_PRESS: 2,
  },
}));

// Suppress console warnings in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
