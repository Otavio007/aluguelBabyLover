import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Package, Sparkles, ShieldCheck, Heart } from 'lucide-react-native';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { CategoryRentSection } from '@/components/home/CategoryRentSection';
import { ProductCard } from '@/components/product/ProductCard';
import { getProductDescription } from '@/utils/rulesHelper';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BRAND } from '@/constants/brand';

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const { data: products, isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const filteredProducts = products?.filter((p) => {
    const desc = getProductDescription(p).toLowerCase();
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    const matchesCategory = category === 'Todos' || p.categoria === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1" style={{ backgroundColor: '#FDF4FF' }}>
      <Stack.Screen options={{ title: 'Início' }} />
      <Header />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View
          className="px-6 pt-8 pb-10"
          style={{ backgroundColor: BRAND.primary }}
        >
          <View className="flex-row items-center mb-4">
            <Sparkles size={16} color={BRAND.yellow} />
            <Text
              className="ml-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: BRAND.yellow }}
            >
              AlugaKi Baby
            </Text>
          </View>

          <Text className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-lg">
            Tudo o que seu bebê precisa,{' '}
            <Text style={{ color: BRAND.accent }}>sem pesar no bolso.</Text>
          </Text>

          {/* Trust badges */}
          <View className="flex-row flex-wrap gap-2 mt-5">
            {[
              { icon: ShieldCheck, text: 'Higienizado' },
              { icon: Heart, text: 'Com carinho' },
            ].map(({ icon: Icon, text }) => (
              <View
                key={text}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <Icon size={13} color={BRAND.yellow} />
                <Text className="text-white/90 text-xs font-semibold">{text}</Text>
              </View>
            ))}
          </View>

          {/* Search */}
          <View
            className="flex-row items-center rounded-2xl px-4 py-3.5 mt-7"
            style={{
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Search size={20} color={BRAND.primary} />
            <TextInput
              placeholder="O que você está procurando?"
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-3 text-base text-slate-900"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <CategoryRentSection
          categories={categories}
          selectedCategory={category === 'Todos' ? '' : category}
          onSelectCategory={(nome) => setCategory(nome)}
        />

        {category !== 'Todos' && (
          <View className="px-6 pb-2" style={{ backgroundColor: BRAND.primary }}>
            <TouchableOpacity
              onPress={() => setCategory('Todos')}
              className="self-start px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,108,182,0.45)',
              }}
            >
              <Text className="text-sm font-bold text-white">
                ← Ver todas as categorias
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Products grid */}
        <View className="px-6 pb-12">
          <View className="flex-row items-center mb-6">
            <View
              className="w-1 h-6 rounded-full mr-3"
              style={{ backgroundColor: BRAND.accent }}
            />
            <Text className="text-2xl font-bold text-slate-900">Destaques para você</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={BRAND.primary} className="mt-10" />
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <View className="flex-row flex-wrap">
              {filteredProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </View>
          ) : (
            <View
              className="w-full items-center py-20 rounded-4xl"
              style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9CCFF' }}
            >
              <Package size={48} color={BRAND.primaryMuted} />
              <Text className="text-slate-500 text-lg mt-4">Nenhum produto encontrado.</Text>
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}
