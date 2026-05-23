import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LOGO } from '@/constants/brand';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.replace('/admin/products');
    } catch (error: any) {
      alert('Erro ao entrar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary-50 items-center justify-center px-6">
      <Stack.Screen options={{ title: 'Login Administrativo' }} />
      
      <View className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-primary-100">
        <View className="items-center mb-8">
          <Image
            source={LOGO}
            className="h-16 w-44 mb-4"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-slate-900">Painel Admin</Text>
          <Text className="text-slate-500">Acesse para gerenciar o sistema</Text>
        </View>

        <Input
          label="Email"
          placeholder="admin@exemplo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          label="Entrar"
          onPress={handleLogin}
          isLoading={isLoading}
          className="mt-4"
        />
        
        <Button
          label="Voltar para o site"
          variant="ghost"
          onPress={() => router.replace('/')}
          className="mt-2"
        />
      </View>
    </View>
  );
}
