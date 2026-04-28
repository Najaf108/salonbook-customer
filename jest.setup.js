// jest.setup.js
global.__DEV__ = true;
global.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
};

require('@testing-library/jest-native/extend-expect');

// Mock React Native
jest.mock('react-native', () => {
    const React = require('react');
    const ReactNative = jest.requireActual('react-native');

    // Custom mocks for components that might cause issues
    ReactNative.NativeModules.RNGestureHandlerModule = {
        attachGestureHandler: jest.fn(),
        createGestureHandler: jest.fn(),
        dropGestureHandler: jest.fn(),
        updateGestureHandler: jest.fn(),
        State: {},
        Directions: {},
    };

    return ReactNative;
});




// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() =>
        Promise.resolve({ status: 'granted' })
    ),
    getCurrentPositionAsync: jest.fn(() =>
        Promise.resolve({
            coords: {
                latitude: 33.6844,
                longitude: 73.0479,
            },
        })
    ),
    reverseGeocodeAsync: jest.fn(() =>
        Promise.resolve([{ city: 'Islamabad', street: 'F-6' }])
    ),
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            apiUrl: 'http://localhost:3000/api',
        },
    },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
    useLocalSearchParams: jest.fn(() => ({})),
}));

// Standard mocks for React Native / Expo


