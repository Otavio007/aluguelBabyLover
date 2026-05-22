import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Product } from '@/types';
import { getFirstProductImage } from '@/utils/imageHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/product/${product.id}`} asChild>
      <TouchableOpacity 
        className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm mb-6 w-full md:w-[31%] md:mx-[1%]"
        activeOpacity={0.9}
      >
        <View className="relative h-64 w-full bg-slate-100">
          <Image 
            source={{ uri: getFirstProductImage(product.imagem) }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full shadow-sm">
            <Text className="text-primary-600 font-bold text-xs">
              R$ {product.valor.toLocaleString('pt-BR')} / {product.tipo_cobranca}
            </Text>
          </View>
        </View>
        
        <View className="p-5">
          <View className="mb-2">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">{product.categoria}</Text>
            <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>{product.nome}</Text>
          </View>
          
          <Text className="text-slate-500 text-sm mb-4" numberOfLines={2}>
            {product.descricao}
          </Text>
          
          <View className="flex-row items-center justify-between border-t border-slate-50 pt-4">
            <Text className="text-slate-400 text-xs">{product.marca}</Text>
            <View className="bg-primary-600 px-4 py-2 rounded-xl">
              <Text className="text-white font-bold text-xs">Alugar</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};
