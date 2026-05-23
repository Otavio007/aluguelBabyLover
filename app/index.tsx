import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Filter, Package, Sparkles } from 'lucide-react-native';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { getProductDescription } from '@/utils/rulesHelper';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BRAND } from '@/constants/brand';

const CATEGORIES = ['Todos', 'Carrinhos', 'Cadeirinhas', 'Brinquedos', 'Quarto', 'Banho'];

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const { data: products, isLoading } = useProducts();

  const filteredProducts = products?.filter((p) => {
    const desc = getProductDescription(p).toLowerCase();
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    const matchesCategory = category === 'Todos' || p.categoria === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1 bg-primary-50">
      <Stack.Screen options={{ title: 'Início' }} />
      <Header />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-10 bg-white border-b border-primary-100">
          <View className="flex-row items-center mb-3">
            <Sparkles size={18} color={BRAND.primary} />
            <Text className="ml-2 text-xs font-bold text-primary-600 uppercase tracking-widest">
              BabyLover Locação
            </Text>
          </View>
          <Text className="text-4xl font-bold text-slate-900 leading-tight">
            Tudo o que seu bebê precisa,{' '}
            <Text className="text-primary-600">sem pesar no bolso.</Text>
          </Text>
          <Text className="text-lg text-slate-500 mt-4 leading-relaxed">
            Locação premium de produtos infantis com entrega rápida e higienização garantida.
          </Text>

          <View className="flex-row items-center bg-primary-50 rounded-2xl px-4 py-3.5 mt-8 border border-primary-100">
            <Search size={20} color={BRAND.primaryDark} />
            <TextInput
              placeholder="O que você está procurando?"
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-3 text-base text-slate-900"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity className="p-2.5 bg-primary-500 rounded-xl shadow-soft">
              <Filter size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="py-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full mr-3 border ${
                  category === cat
                    ? 'bg-primary-500 border-primary-500 shadow-soft'
                    : 'bg-white border-primary-100'
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    category === cat ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 pb-12">
          <Text className="text-2xl font-bold text-slate-900 mb-6">Destaques para você</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={BRAND.primary} className="mt-10" />
          ) : (
            <View className="flex-row flex-wrap">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((item) => <ProductCard key={item.id} product={item} />)
              ) : (
                <View className="w-full items-center py-20 bg-white rounded-3xl border border-primary-100">
                  <Package size={48} color={BRAND.primaryMuted} className="mb-4" />
                  <Text className="text-slate-500 text-lg">Nenhum produto encontrado.</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};
