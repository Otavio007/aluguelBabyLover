import { Stack } from 'expo-router';
import { Platform } from 'react-native';

// Polyfills para ambiente Web (evita erros de módulos do Node no navegador)
if (Platform.OS === 'web') {
  (global as any).__filename = '';
  (global as any).__dirname = '';
  
  // Mock para o módulo 'url' que causa o erro pathToFileURL
  const url = require('url');
  if (!url.pathToFileURL) {
    url.pathToFileURL = (path: string) => {
      return new URL('file://' + path);
    };
  }

  (global as any).process = {
    ...(global as any).process,
    env: { NODE_ENV: 'development' },
    platform: 'web',
    version: 'v18.0.0',
    nextTick: (cb: any) => setTimeout(cb, 0),
    binding: () => ({}),
  };
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import '../styles/global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fdf2fa' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="rent/[id]" />
          <Stack.Screen name="contract/[id]" />
          <Stack.Screen name="admin/login" />
          <Stack.Screen name="admin/products" />
          <Stack.Screen name="admin/rentals" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
