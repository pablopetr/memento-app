/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'testRunnerConfig',
  apps: {
    ios: {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/Memento.app',
      build:
        'xcodebuild -workspace ios/Memento.xcworkspace -scheme Memento -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    android: {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: {
        type: 'iOS',
        device: {
          type: 'simulator',
          model: 'iPhone 15 Pro',
          os: 'iOS',
        },
      },
      app: 'ios',
    },
    'ios.sim.release': {
      device: {
        type: 'iOS',
        device: {
          type: 'simulator',
          model: 'iPhone 15 Pro',
          os: 'iOS',
        },
      },
      app: 'ios',
    },
    'android.emu.debug': {
      device: {
        type: 'android',
        device: {
          avdName: 'Pixel_5_API_31',
        },
      },
      app: 'android',
    },
    'android.emu.release': {
      device: {
        type: 'android',
        device: {
          avdName: 'Pixel_5_API_31',
        },
      },
      app: 'android',
    },
  },
  testRunnerConfig: {
    testTimeout: 120000,
  },
};
