import 'jest-fetch-mock';

(global as any).__DEV__ = true;

// Provide minimal DOM environment for react-native-css-interop (NativeWind)
// and @testing-library/react-native timer helpers
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
    requestAnimationFrame: (cb: Function) => setTimeout(cb, 16),
    cancelAnimationFrame: (id: number) => clearTimeout(id),
    matchMedia: () => ({ matches: true, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }),
    getComputedStyle: () => ({}),
    document: {
      documentElement: { style: {} },
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      getElementsByTagName: () => [{ observe: () => {} }],
      head: { appendChild: () => {} },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { href: '', origin: '', protocol: 'https:', host: 'localhost', hostname: 'localhost', port: '', pathname: '/', search: '', hash: '' },
    navigator: { userAgent: 'node', platform: '' },
    MutationObserver: class {
      constructor(cb: Function) { (this as any).callback = cb; }
      observe() {}
      disconnect() {}
    },
  };
}

// Mock react-native with reconcilable component types
jest.mock('react-native', () => {
  const React = jest.requireActual('react');
  const makeComponent = (name: string) => {
    const Comp = React.forwardRef((props: any, ref: any) => React.createElement(name, { ...props, ref }));
    Comp.displayName = name;
    return Comp;
  };
  return {
    Platform: { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default },
    StyleSheet: { create: (styles: any) => styles, hairlineWidth: () => 0.5, flatten: (s: any) => s, getFlag: () => undefined, setFlag: () => {} },
    NativeModules: {},
    Dimensions: { get: () => ({ width: 375, height: 812 }), addEventListener: jest.fn() },
    PixelRatio: { get: () => 2, getFontScale: () => 1 },
    Alert: { alert: jest.fn() },
    Linking: { openURL: jest.fn(), canOpenURL: jest.fn(() => Promise.resolve(true)) },
    ActivityIndicator: makeComponent('ActivityIndicator'),
    Pressable: makeComponent('Pressable'),
    TouchableOpacity: makeComponent('TouchableOpacity'),
    Text: makeComponent('Text'),
    View: makeComponent('View'),
    ScrollView: makeComponent('ScrollView'),
    RefreshControl: makeComponent('RefreshControl'),
    TextInput: makeComponent('TextInput'),
    Image: makeComponent('Image'),
    Switch: makeComponent('Switch'),
    Modal: makeComponent('Modal'),
    SafeAreaView: makeComponent('SafeAreaView'),
    KeyboardAvoidingView: makeComponent('KeyboardAvoidingView'),
    Appearance: { getColorScheme: () => 'light', addChangeListener: () => ({ remove: jest.fn() }) },
    AppState: { currentState: 'active', addEventListener: () => ({ remove: jest.fn() }) },
    Animated: {
      View: makeComponent('Animated.View'),
      Text: makeComponent('Animated.Text'),
      createAnimatedComponent: (c: any) => c,
      FadeInDown: { duration: () => ({ delay: () => ({}) }) },
      FadeInUp: { duration: () => ({}) },
      FadeOut: { duration: () => ({}) },
      SlideInRight: { duration: () => ({}) },
      SlideOutLeft: { duration: () => ({}) },
    },
  };
});

// Mock react-native-css-interop (used by NativeWind)
jest.mock('react-native-css-interop', () => ({
  cssInterop: () => {},
  useColorScheme: () => 'light',
  StyleSheet: { create: (s: any) => s },
}));

// Mock the jsx-runtime subpath that nativewind/jsx-runtime resolves to
jest.mock('react-native-css-interop/jsx-runtime', () => {
  const React = jest.requireActual('react');
  return {
    jsx: (type: any, props: any, ...rest: any[]) => React.createElement(type, props, ...rest),
    jsxs: (type: any, props: any, ...rest: any[]) => React.createElement(type, props, ...rest),
    Fragment: React.Fragment,
    createElement: (type: any, props: any, ...rest: any[]) => React.createElement(type, props, ...rest),
    createInteropElement: (type: any, props: any) => React.createElement(type, props),
  };
});

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (c: any) => c,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: (c: any) => c,
    View: 'View',
    Text: 'Text',
    Image: 'Image',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
  },
  createAnimatedComponent: (c: any) => c,
  useSharedValue: (v: any) => ({ value: v }),
  useAnimatedStyle: (cb: any) => cb(),
  withTiming: (v: any) => v,
  withSpring: (v: any) => v,
  FadeInDown: { duration: () => ({ delay: () => ({}) }) },
  FadeInUp: { duration: () => ({}) },
  FadeOut: { duration: () => ({}) },
  SlideInRight: { duration: () => ({}) },
  SlideOutLeft: { duration: () => ({}) },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((cb: any) => {
    cb({ isConnected: true });
    return () => {};
  }),
  useNetInfo: () => ({ isConnected: true, isInternetReachable: true }),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: { extra: {} },
    manifest: {},
    isDevice: true,
    platform: { ios: { model: 'iPhone' } },
    executionEnvironment: 'storeClient',
    linkingUri: 'exp://',
  },
  AppOwnership: { Standalone: 'standalone', Expo: 'expo', Guest: 'guest' },
  ExecutionEnvironment: { StoreClient: 'storeClient', Bare: 'bare', Standalone: 'standalone' },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getDevicePushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-token' })),
  setNotificationChannelAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { HIGH: 4 },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  osName: 'iOS',
  osVersion: '17.0',
  brand: 'Apple',
  modelName: 'iPhone',
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  processFontFamily: jest.fn((name: string) => name),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  };
});

// Mock lucide-react-native
const MockIcon = (props: any) => null;
const mockIcons: Record<string, any> = {};
const iconNames = ['ArrowLeft', 'Milk', 'Inbox', 'TriangleAlert', 'WifiOff', 'Minus', 'Plus', 'Clock', 'Lock', 'CheckCircle2', 'AlertCircle', 'X', 'Bell', 'Megaphone', 'CalendarDays', 'Pencil'];
for (const name of iconNames) {
  mockIcons[name] = MockIcon;
}
jest.mock('lucide-react-native', () => ({ ...mockIcons, LucideIcon: MockIcon }));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  useURL: jest.fn(),
  useLinkingURL: jest.fn(),
  createURL: jest.fn(() => 'exp://test'),
  parse: jest.fn(() => ({ path: '', queryParams: {} })),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  Swipeable: ({ children }: any) => children,
  DrawerLayout: ({ children }: any) => children,
  State: {},
  PanGestureHandler: ({ children }: any) => children,
  TapGestureHandler: ({ children }: any) => children,
}));

// Mock axios to prevent real HTTP connections (circular refs in agents crash workers)
jest.mock('axios', () => {
  const makeInterceptors = () => {
    const handlers: { fulfilled: any; rejected: any }[] = [];
    return {
      handlers,
      use: jest.fn((fulfilled: any, rejected?: any) => {
        handlers.push({ fulfilled, rejected });
        return handlers.length - 1;
      }),
      eject: jest.fn(),
    };
  };
  const makeInstance = (config?: any) => ({
    defaults: {
      baseURL: config?.baseURL ?? '',
      timeout: config?.timeout ?? 0,
      headers: { common: {}, 'Content-Type': 'application/json', ...config?.headers },
    },
    interceptors: { request: makeInterceptors(), response: makeInterceptors() },
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
  });
  const defaultInstance = makeInstance();
  return {
    default: {
      ...defaultInstance,
      create: jest.fn((config?: any) => makeInstance(config)),
    },
    ...defaultInstance,
    create: jest.fn((config?: any) => makeInstance(config)),
  };
});

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      clear: jest.fn(),
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
      getQueryData: jest.fn(),
    }),
  };
});

// Ensure process.env has defaults
process.env.EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.dairyplatform.example.com';
process.env.EXPO_PUBLIC_USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS || 'true';
