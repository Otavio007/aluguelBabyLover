import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Tags } from 'lucide-react-native';
import { ProductCategory } from '@/types';
import { BRAND } from '@/constants/brand';

interface CategoryRentSectionProps {
  categories: ProductCategory[];
  selectedCategory: string;
  onSelectCategory: (nome: string) => void;
}

export function CategoryRentSection({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryRentSectionProps) {
  const { width } = useWindowDimensions();
  const itemWidth = width < 640 ? 120 : 150;

  if (categories.length === 0) return null;

  return (
    <View className="py-10 md:py-12" style={{ backgroundColor: BRAND.primary }}>
      <View className="items-center mb-8 px-6">
        <Text className="text-2xl md:text-3xl font-bold text-white text-center">
          Alugue por categoria
        </Text>
        <View
          className="mt-2 rounded-full"
          style={{ width: 48, height: 4, backgroundColor: BRAND.accent }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 8,
          flexGrow: 1,
          justifyContent: 'center',
        }}
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat.nome;
          return (
            <TouchableOpacity
              key={cat.nome}
              onPress={() => onSelectCategory(cat.nome)}
              activeOpacity={0.85}
              style={{ width: itemWidth, alignItems: 'center', marginRight: 20 }}
            >
              <View
                style={{
                  width: itemWidth,
                  height: itemWidth,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  borderWidth: active ? 3 : 0,
                  borderColor: active ? BRAND.accent : 'transparent',
                  backgroundColor: '#fff',
                }}
              >
                {cat.imagem ? (
                  <Image
                    source={{ uri: cat.imagem }}
                    style={{ width: itemWidth - 16, height: itemWidth - 16 }}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    className="items-center justify-center rounded-2xl"
                    style={{
                      width: itemWidth - 24,
                      height: itemWidth - 24,
                      backgroundColor: BRAND.primaryLight,
                    }}
                  >
                    <Tags size={32} color={BRAND.primaryMuted} />
                  </View>
                )}
              </View>
              <Text
                className="text-center font-semibold mt-3"
                style={{
                  fontSize: width < 640 ? 13 : 15,
                  color: active ? BRAND.accent : '#fff',
                }}
                numberOfLines={2}
              >
                {cat.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
