import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, Share2, Heart, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react-native';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { getProductImages } from '@/utils/imageHelper';
import { getProductRules, getProductDescription } from '@/utils/rulesHelper';
import { BRAND } from '@/constants/brand';

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id!);
  const { width: windowWidth } = useWindowDimensions();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const images = getProductImages(product?.imagem);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeImageIndex + 1) % images.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * windowWidth,
        animated: true,
      });
      setActiveImageIndex(nextIndex);
    }, 4000); // Pass image every 4 seconds

    return () => clearInterval(interval);
  }, [activeImageIndex, images.length, windowWidth]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-500">Produto não encontrado.</Text>
        <Button label="Voltar" onPress={() => router.back()} className="mt-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: product.nome }} />
      <Header />
      
      <ScrollView className="flex-1">
        <View className="relative bg-slate-950" style={{ height: 350 }}>
          {images.length > 0 ? (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const contentOffset = e.nativeEvent.contentOffset.x;
                const index = Math.round(contentOffset / windowWidth);
                if (index !== activeImageIndex) {
                  setActiveImageIndex(index);
                }
              }}
              scrollEventThrottle={16}
            >
              {images.map((imgUrl, index) => (
                <View key={index} style={{ width: windowWidth, height: 350 }} className="bg-slate-950 items-center justify-center">
                  <Image
                    source={{ uri: imgUrl }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={{ width: windowWidth, height: 350 }} className="items-center justify-center bg-slate-100">
              <Text className="text-slate-400 text-sm">Sem imagem disponível</Text>
            </View>
          )}

          <View className="absolute top-4 left-4 flex-row space-x-2 z-10">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 bg-white/80 rounded-full shadow-sm"
            >
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>
          <View className="absolute top-4 right-4 flex-row space-x-2 z-10">
            <TouchableOpacity className="p-2 bg-white/80 rounded-full shadow-sm">
              <Share2 size={20} color="#0f172a" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 bg-white/80 rounded-full shadow-sm">
              <Heart size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2 z-10">
              {images.map((_, idx) => (
                <View
                  key={idx}
                  className={`h-2 rounded-full ${
                    activeImageIndex === idx ? 'w-6 bg-primary-600' : 'w-2 bg-slate-400'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        <View className="px-6 py-6">
          <View className="flex-row items-center space-x-2 mb-2">
            <Text className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded">
              {product.categoria}
            </Text>
            <Text className="text-xs font-medium text-slate-400">
              Marca: {product.marca}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-slate-900 mb-2">
            {product.nome}
          </Text>

          <View className="flex-row items-center mb-4">
            <Text className="text-3xl font-bold text-slate-900">
              R$ {product.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text className="text-slate-400 ml-2">/ período</Text>
          </View>

          <View className="h-px bg-slate-100 w-full mb-6" />

          <View className="mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-2">Descrição</Text>
            <Text className="text-slate-600 leading-relaxed">
              {getProductDescription(product) || 'Nenhuma descrição disponível para este produto.'}
            </Text>
          </View>

          <View className="mb-6 bg-slate-50 p-4 rounded-2xl">
            <Text className="text-sm font-bold text-slate-900 mb-3">Informações Técnicas</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-slate-500">Estado de conservação</Text>
                <Text className="text-slate-900 font-medium">{product.estado_conservacao}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-500">Disponível em estoque</Text>
                <Text className="text-slate-900 font-medium">{product.quantidade} unidades</Text>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">Regras de uso</Text>
            <View className="space-y-4">
              {getProductRules(product).map((rule, idx) => (
                <View key={idx} className="flex-row items-start space-x-3">
                  <CheckCircle2 size={20} color={BRAND.primary} />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900">{rule.titulo}</Text>
                    <Text className="text-xs text-slate-500">{rule.texto}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-6 border-t border-slate-100 bg-white">
        <Button 
          label="Alugar agora" 
          onPress={() => router.push(`/rent/${product.id}`)}
          className="h-14"
          disabled={product.quantidade === 0}
        />
      </View>
    </View>
  );
}
