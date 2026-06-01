import 'dotenv/config';

export default {
  expo: {
    name: "AlugaKi Baby",
    slug: "AluguelBabyLover",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo-mascot.png",
    scheme: "aluguelbabylover",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/logo-mascot.png",
      resizeMode: "contain",
      backgroundColor: "#fdf2fa"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo-mascot.png",
        backgroundColor: "#fdf2fa"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/logo-mascot.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};
