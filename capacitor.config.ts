import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d6805173bd734994aa3f159897e1a8fe',
  appName: 'katomaran-taskflow',
  webDir: 'dist',
  server: {
    url: 'https://d6805173-bd73-4994-aa3f-159897e1a8fe.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0c0a0f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#d946ef",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;