import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export const Header = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
      <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.7}>
        <Text className="text-xl font-bold text-primary-600">BabyLover</Text>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <View className="bg-primary-50 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-primary-700 uppercase">Locação Direta</Text>
        </View>
      </View>
    </View>
  );
};
