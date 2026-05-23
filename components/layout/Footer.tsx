import React from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LOGO } from '@/constants/brand';

export const Footer = () => {
  const router = useRouter();

  return (
    <View className="bg-secondary-900 px-6 py-12 border-t-4 border-primary-500">
      <View className="mb-8">
        <Image
          source={LOGO}
          className="h-12 w-40 mb-4 bg-white rounded-xl p-1"
          resizeMode="contain"
        />
        <Text className="text-slate-300 leading-relaxed max-w-md text-sm">
          A melhor plataforma de locação de produtos infantis para o conforto do seu bebê e
          economia para você.
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-4 mb-10">
        <TouchableOpacity>
          <Text className="text-primary-300 font-semibold text-sm">Instagram</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-primary-300 font-semibold text-sm">Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-primary-300 font-semibold text-sm">E-mail</Text>
        </TouchableOpacity>
      </View>

      <View className="h-px bg-secondary-700 w-full mb-8" />

      <View className="space-y-2">
        <Text className="text-slate-400 text-sm">© 2026 AluguelBabyLover. Todos os direitos reservados.</Text>
        <Text className="text-slate-500 text-xs">Desenvolvido com carinho para pais e bebês.</Text>
        <Text className="text-slate-500 text-xs">
          Desenvolvido por{' '}
          <Text
            className="text-primary-400 underline"
            onPress={() => Linking.openURL('https://www.linkedin.com/in/otavio-ribeiro07/')}
          >
            Otávio Ribeiro
          </Text>
        </Text>
        <TouchableOpacity onPress={() => router.push('/admin/login')} className="mt-4">
          <Text className="text-slate-600 text-[10px]">Acesso administrativo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
