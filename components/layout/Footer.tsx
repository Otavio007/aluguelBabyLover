import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export const Footer = () => {
  const router = useRouter();
  return (
    <View className="bg-slate-900 px-6 py-12">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-white mb-4">BabyLover</Text>
        <Text className="text-slate-400 leading-relaxed max-w-xs">
          A melhor plataforma de locação de produtos infantis para o conforto do seu bebê e economia para você.
        </Text>
      </View>

      <View className="flex-row space-x-6 mb-10">
        <TouchableOpacity>
          <Text className="text-white font-medium">Instagram</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-white font-medium">Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-white font-medium">Email</Text>
        </TouchableOpacity>
      </View>

      <View className="h-px bg-slate-800 w-full mb-8" />

      <View className="space-y-2">
        <Text className="text-slate-500 text-sm">© 2026 AluguelBabyLover. Todos os direitos reservados.</Text>
        <Text className="text-slate-500 text-xs">Desenvolvido com ❤️ para pais e bebês.</Text>
        <Text className="text-slate-500 text-xs">
          Desenvolvido por{' '}
          <Text
            className="text-sky-400 underline"
            onPress={() => Linking.openURL('https://www.linkedin.com/in/otavio-ribeiro07/')}
          >
            Otávio Ribeiro
          </Text>
        </Text>
        <TouchableOpacity onPress={() => router.push('/admin/login')} className="mt-4">
          <Text className="text-slate-700 text-[10px]">Acesso Administrativo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
