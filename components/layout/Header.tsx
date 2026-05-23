import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LOGO } from '@/constants/brand';

export const Header = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-5 py-1.5 bg-white border-b border-primary-100">
      <TouchableOpacity
        onPress={() => router.push('/')}
        activeOpacity={0.8}
        className="flex-row items-center"
      >
        <Image
          source={LOGO}
          className="h-8 w-24"
          resizeMode="contain"
          accessibilityLabel="BabyLover"
        />
      </TouchableOpacity>

      <View className="bg-primary-100 px-2 py-1 rounded-full border border-primary-200">
        <Text className="text-[9px] font-bold text-primary-700 uppercase tracking-wide">
          Locação infantil
        </Text>
      </View>
    </View>
  );
};
