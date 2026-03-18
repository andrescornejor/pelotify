import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pelotify.app',
  appName: 'Pelotify',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
