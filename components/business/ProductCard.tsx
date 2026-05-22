import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { cn } from '@/utils/cn';
import { getFirstProductImage } from '@/utils/imageHelper';
import { getProductDescription } from '@/utils/rulesHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm mb-4"
    >
      <Image
        source={{ uri: getFirstProductImage(product.imagem) }}
        className="w-full h-48 bg-slate-50"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            {product.categoria}
          </Text>
          <Text className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            product.quantidade > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {product.quantidade > 0 ? 'Disponível' : 'Indisponível'}
          </Text>
        </View>
        
        <Text className="text-lg font-bold text-slate-900 mb-1" numberOfLines={1}>
          {product.nome}
        </Text>
        
        <Text className="text-sm text-slate-500 mb-3" numberOfLines={2}>
          {getProductDescription(product)}
        </Text>
        
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-xs text-slate-400">A partir de</Text>
            <Text className="text-xl font-bold text-slate-900">
              R$ {product.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View className="bg-primary-50 px-3 py-1.5 rounded-lg">
            <Text className="text-primary-700 font-semibold text-xs">Ver mais</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
