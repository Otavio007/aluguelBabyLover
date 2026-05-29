import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Share2, CheckCircle2, Check, Package, Star } from 'lucide-react-native';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { ScreenBackButton } from '@/components/ui/ScreenBackButton';
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
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined'
      ? window.location.href
      : `https://aluguelbabylover.netlify.app/product/${id}`;
    const title = product?.nome ?? 'Produto AlugaKi Baby';
    const text = `Confira este produto para locação: ${title}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
        }
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch (_) {
      // usuário cancelou
    }
  };

  const images = getProductImages(product?.imagem);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (activeImageIndex + 1) % images.length;
      scrollViewRef.current?.scrollTo({ x: nextIndex * windowWidth, animated: true });
      setActiveImageIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeImageIndex, images.length, windowWidth]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FDF4FF' }}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FDF4FF' }}>
        <Text className="text-slate-500">Produto não encontrado.</Text>
        <Button label="Voltar" onPress={() => router.back()} className="mt-4" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#FDF4FF' }}>
      <Stack.Screen options={{ title: product.nome }} />
      <Header />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <View className="relative mx-4 mt-4 rounded-4xl overflow-hidden bg-white" style={{ height: 340 }}>
          {images.length > 0 ? (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (windowWidth - 32));
                if (index !== activeImageIndex) setActiveImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {images.map((imgUrl, index) => (
                <View
                  key={index}
                  style={{ width: windowWidth - 32, height: 340 }}
                  className="items-center justify-center bg-primary-50"
                >
                  <Image source={{ uri: imgUrl }} className="w-full h-full" resizeMode="contain" />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Package size={40} color={BRAND.primaryMuted} />
              <Text className="text-slate-400 text-sm mt-2">Sem imagem disponível</Text>
            </View>
          )}

          <View className="absolute top-4 left-4 z-10">
            <ScreenBackButton fallbackHref="/" className="mb-0 p-2.5 bg-white/95 rounded-2xl shadow-sm" />
          </View>
          <TouchableOpacity
            onPress={handleShare}
            className="absolute top-4 right-4 flex-row items-center gap-1.5 px-3 py-2 bg-white/95 rounded-2xl z-10"
            activeOpacity={0.8}
          >
            {shareCopied ? <Check size={16} color={BRAND.primary} /> : <Share2 size={16} color={BRAND.primary} />}
            <Text className="text-xs font-bold" style={{ color: BRAND.primary }}>
              {shareCopied ? 'Copiado!' : 'Compartilhar'}
            </Text>
          </TouchableOpacity>

          {images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <View
                  key={idx}
                  className="h-2 rounded-full"
                  style={{
                    width: activeImageIndex === idx ? 24 : 8,
                    backgroundColor: activeImageIndex === idx ? BRAND.accent : 'rgba(255,255,255,0.6)',
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content card */}
        <View
          className="mx-4 mt-4 mb-6 p-6 rounded-4xl bg-white"
          style={{ borderWidth: 1, borderColor: '#F3E8FF' }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: BRAND.primaryLight }}
            >
              <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND.primary }}>
                {product.categoria}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Star size={12} color={BRAND.yellow} fill={BRAND.yellow} />
              <Text className="text-xs text-slate-400">{product.marca}</Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-slate-900 mb-4">{product.nome}</Text>

          <View
            className="flex-row items-baseline px-4 py-3 rounded-2xl mb-6"
            style={{ backgroundColor: BRAND.primaryLight }}
          >
            <Text className="text-3xl font-bold" style={{ color: BRAND.primary }}>
              R$ {product.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text className="text-slate-500 ml-2 text-sm">/ {product.tipo_cobranca?.toLowerCase() ?? 'dia'}</Text>
          </View>

          <Text className="text-base font-bold text-slate-900 mb-2">Descrição</Text>
          <Text className="text-slate-600 leading-relaxed mb-6">
            {getProductDescription(product) || 'Nenhuma descrição disponível para este produto.'}
          </Text>

          <View
            className="p-4 rounded-2xl mb-6"
            style={{ backgroundColor: '#FDF4FF', borderWidth: 1, borderColor: '#E9CCFF' }}
          >
            <Text className="text-sm font-bold text-slate-900 mb-3">Informações</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-slate-500 text-sm">Estado de conservação</Text>
                <Text className="text-slate-900 font-semibold text-sm">{product.estado_conservacao}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-500 text-sm">Disponível em estoque</Text>
                <Text className="font-semibold text-sm" style={{ color: BRAND.primary }}>
                  {product.quantidade} {product.quantidade === 1 ? 'unidade' : 'unidades'}
                </Text>
              </View>
            </View>
          </View>

          {getProductRules(product).length > 0 && (
            <View>
              <Text className="text-base font-bold text-slate-900 mb-4">Regras de uso</Text>
              <View className="gap-3">
                {getProductRules(product).map((rule, idx) => (
                  <View key={idx} className="flex-row items-start gap-3">
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: BRAND.primaryLight }}
                    >
                      <CheckCircle2 size={16} color={BRAND.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-900">{rule.titulo}</Text>
                      <Text className="text-xs text-slate-500 mt-0.5 leading-5">{rule.texto}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        className="px-6 py-5 bg-white"
        style={{ borderTopWidth: 1, borderTopColor: '#F3E8FF' }}
      >
        <Button
          label="Alugar agora"
          onPress={() => router.push(`/rent/${product.id}`)}
          className="h-14 rounded-3xl"
          disabled={product.quantidade === 0}
        />
      </View>
    </View>
  );
}
