import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Product } from '@/types';
import { getFirstProductImage } from '@/utils/imageHelper';
import { getProductDescription } from '@/utils/rulesHelper';
import { BRAND } from '@/constants/brand';
import { ArrowRight } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/product/${product.id}`} asChild>
      <TouchableOpacity
        className="bg-white rounded-4xl overflow-hidden mb-6 w-full md:w-[31%] md:mx-[1%]"
        style={{
          borderWidth: 1,
          borderColor: '#F3E8FF',
          shadowColor: BRAND.primary,
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 5,
        }}
        activeOpacity={0.92}
      >
        <View className="relative h-60 w-full bg-primary-50 overflow-hidden">
          <Image
            source={{ uri: getFirstProductImage(product.imagem) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View
            className="absolute inset-x-0 bottom-0 h-20"
            style={{ backgroundColor: 'rgba(76,0,125,0.15)' }}
          />
          <View
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: BRAND.primary }}
            >
              {product.categoria}
            </Text>
          </View>
          <View
            className="absolute top-3 right-3 px-3 py-1.5 rounded-2xl"
            style={{ backgroundColor: BRAND.accent }}
          >
            <Text className="text-white font-bold text-xs">
              R$ {product.valor.toLocaleString('pt-BR')} / {product.tipo_cobranca}
            </Text>
          </View>
        </View>

        <View className="p-5">
          <Text className="text-lg font-bold text-slate-900 mb-1" numberOfLines={1}>
            {product.nome}
          </Text>

          <Text className="text-slate-500 text-sm mb-4 leading-5" numberOfLines={2}>
            {getProductDescription(product)}
          </Text>

          <View className="flex-row items-center justify-between pt-3 border-t border-primary-50">
            <Text className="text-slate-400 text-xs font-medium">{product.marca}</Text>
            <View
              className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl"
              style={{ backgroundColor: BRAND.primary }}
            >
              <Text className="text-white font-bold text-xs">Alugar</Text>
              <ArrowRight size={14} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};
