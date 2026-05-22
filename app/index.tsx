import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Filter, Package } from 'lucide-react-native';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const CATEGORIES = ['Todos', 'Carrinhos', 'Cadeirinhas', 'Brinquedos', 'Quarto', 'Banho'];

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const { data: products, isLoading } = useProducts();

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || 
                         p.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Todos' || p.categoria === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Início' }} />
      <Header />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-6 py-10 bg-slate-50">
          <Text className="text-4xl font-bold text-slate-900 leading-tight">
            Tudo o que seu bebê precisa, <Text className="text-primary-600">sem pesar no bolso.</Text>
          </Text>
          <Text className="text-lg text-slate-500 mt-4 leading-relaxed">
            Locação premium de produtos infantis com entrega rápida e higienização garantida.
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-3xl px-4 py-4 mt-8 shadow-sm border border-slate-100">
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="O que você está procurando?"
              className="flex-1 ml-3 text-base text-slate-900"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity className="p-2 bg-primary-600 rounded-2xl">
              <Filter size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
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
                className={`px-6 py-3 rounded-full mr-3 border ${
                  category === cat ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`font-bold text-sm ${category === cat ? 'text-white' : 'text-slate-500'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View className="px-6 pb-12">
          <Text className="text-2xl font-bold text-slate-900 mb-6">Destaques para você</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#0284c7" className="mt-10" />
          ) : (
            <View className="flex-row flex-wrap">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))
              ) : (
                <View className="w-full items-center py-20">
                  <Package size={48} color="#cbd5e1" className="mb-4" />
                  <Text className="text-slate-400 text-lg">Nenhum produto encontrado.</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}
