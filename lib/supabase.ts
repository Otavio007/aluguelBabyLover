import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// No Expo Web, as variáveis EXPO_PUBLIC_ são injetadas automaticamente no process.env.
// Como fallback, usamos o expoConfig.extra definido no app.config.js.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn(
    'AVISO: Variáveis de ambiente do Supabase não encontradas. ' +
    'Verifique o arquivo .env e se o servidor foi reiniciado com "npx expo start -c".'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
