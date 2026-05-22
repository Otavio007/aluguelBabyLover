import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Calendar, User, FileText, ExternalLink, Package } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminRentals() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          product:products(nome, imagem),
          client:contract_client_data(*),
          contract:contracts(pdf_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRentals(data || []);
    } catch (error: any) {
      alert('Erro ao carregar aluguéis: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRentalItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-xs font-bold text-primary-600 uppercase mb-1">
            Reserva #{item.id.slice(0, 8)}
          </Text>
          <Text className="text-lg font-bold text-slate-900">{item.product?.nome}</Text>
        </View>
        <View className="bg-slate-100 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-slate-600">R$ {item.valor_total.toFixed(2)}</Text>
        </View>
      </View>

      <View className="space-y-3">
        <View className="flex-row items-center">
          <User size={16} color="#64748b" className="mr-2" />
          <Text className="text-slate-600 text-sm">
            {item.client?.[0]?.nome_completo || 'Cliente não identificado'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Calendar size={16} color="#64748b" className="mr-2" />
          <Text className="text-slate-600 text-sm">
            {format(new Date(item.data_inicio), "dd 'de' MMM", { locale: ptBR })} - {format(new Date(item.data_fim), "dd 'de' MMM", { locale: ptBR })}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Package size={16} color="#64748b" className="mr-2" />
          <Text className="text-slate-600 text-sm">
            Alugado em: {format(new Date(item.created_at), "dd/MM/yy 'às' HH:mm")}
          </Text>
        </View>
      </View>

      <View className="flex-row mt-6 pt-4 border-t border-slate-50 space-x-3">
        {item.contract?.[0]?.pdf_url && (
          <TouchableOpacity 
            onPress={() => Linking.openURL(item.contract[0].pdf_url)}
            className="flex-1 bg-primary-50 py-3 rounded-xl flex-row items-center justify-center"
          >
            <FileText size={16} color="#0284c7" className="mr-2" />
            <Text className="text-primary-700 font-bold text-sm">Contrato</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          className="flex-1 bg-slate-50 py-3 rounded-xl flex-row items-center justify-center"
          onPress={() => alert('Dados do cliente:\n' + JSON.stringify(item.client?.[0], null, 2))}
        >
          <ExternalLink size={16} color="#475569" className="mr-2" />
          <Text className="text-slate-700 font-bold text-sm">Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ 
        title: 'Locações',
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
        )
      }} />

      {isLoading ? (
        <View className="p-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-48 mb-4" />)}
        </View>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={item => item.id}
          renderItem={renderRentalItem}
          contentContainerClassName="p-6"
          ListEmptyComponent={
            <View className="items-center py-20">
              <Calendar size={48} color="#cbd5e1" className="mb-4" />
              <Text className="text-slate-400">Nenhum aluguel encontrado.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
