import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agrifuture.app',
  appName: 'AgriFuture',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      // We will hide the native splash manually from React
      launchShowDuration: 0,
      backgroundColor: '#F7F8F2',
      showSpinner: false,
      androidSplashResourceName: 'splash'
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID,
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
