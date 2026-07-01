module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/**/*.test.{ts,tsx}', '!<rootDir>/src/__tests__/components/**', '!<rootDir>/src/__tests__/features/**/components/**'],
      transform: {
        '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack|lucide-react-native)',
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFiles: ['./jest.setup.ts'],
    },
    {
      displayName: 'components',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/components/**/*.test.{ts,tsx}', '<rootDir>/src/__tests__/features/**/components/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack|lucide-react-native)',
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFiles: ['./jest.setup.ts'],
    },
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
    '!src/features/_mocks/**',
  ],
  coverageThreshold: {
    global: {
      lines: 95,
      branches: 95,
      functions: 95,
      statements: 95,
    },
  },
};
