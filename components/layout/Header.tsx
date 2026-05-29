import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LOGO_MAIN, BRAND } from '@/constants/brand';

export const Header = () => {
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-5 py-3 bg-white/95 border-b border-primary-100"
      style={{
        shadowColor: BRAND.primary,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push('/')}
        activeOpacity={0.85}
        className="flex-row items-center"
      >
        <Image
          source={LOGO_MAIN}
          style={{ width: 130, height: 40 }}
          resizeMode="contain"
          accessibilityLabel="AlugaKi Baby"
        />
      </TouchableOpacity>

      <View
        className="px-3 py-1.5 rounded-full"
        style={{ backgroundColor: BRAND.primaryLight, borderWidth: 1, borderColor: '#E9CCFF' }}
      >
        <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.primary }}>
          Locação Infantil
        </Text>
      </View>
    </View>
  );
};
