import React from 'react';
import { View, Text, Image, Platform, ViewStyle } from 'react-native';
import { LOGO_MASCOT, BRAND } from '@/constants/brand';

interface BrandLogoProps {
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function BrandLogo({ size = 'md', style }: BrandLogoProps) {
  const mascotSize = size === 'sm' ? 40 : 52;
  const titleSize = size === 'sm' ? 18 : 24;
  const subtitleSize = size === 'sm' ? 15 : 20;

  return (
    <View className="flex-row items-center gap-3" style={style}>
      <Image
        source={LOGO_MASCOT}
        style={{
          width: mascotSize,
          height: mascotSize,
          ...(Platform.OS === 'web' ? { mixBlendMode: 'screen' as const } : {}),
        }}
        resizeMode="contain"
        accessibilityLabel="AlugaKi Baby"
      />
      <View>
        <Text style={{ color: '#fff', fontSize: titleSize, fontWeight: '800', lineHeight: titleSize + 4 }}>
          Alugaki
        </Text>
        <Text
          style={{
            color: BRAND.accent,
            fontSize: subtitleSize,
            fontWeight: '800',
            lineHeight: subtitleSize + 4,
            marginTop: -2,
          }}
        >
          Baby
        </Text>
      </View>
    </View>
  );
}
