import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BRAND } from '@/constants/brand';
import { BrandLogo } from '@/components/layout/BrandLogo';

export const Header = () => {
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-5 py-3"
      style={{
        backgroundColor: BRAND.primary,
        borderBottomWidth: 3,
        borderBottomColor: BRAND.accent,
      }}
    >
      <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.85}>
        <BrandLogo size="sm" />
      </TouchableOpacity>

      <View
        className="px-3 py-1.5 rounded-full"
        style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(255,108,182,0.45)',
        }}
      >
        <Text
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: BRAND.yellow }}
        >
          Locação Infantil
        </Text>
      </View>
    </View>
  );
};
