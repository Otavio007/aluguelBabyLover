import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Calendar, User, FileText, ExternalLink, Package } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDbDate } from '@/utils/dateHelper';
import { setLastSeenRentalsAt } from '@/utils/adminRentalsSeen';
import { Reservation } from '@/types';
import { BRAND } from '@/constants/brand';
import { useFocusEffect } from '@react-navigation/native';

type RentalRow = Reservation & {
  product?: { nome: string; imagem?: string };
  client?: { nome: string; cpf: string; telefone: string; email: string; observacoes?: string | null } | { nome: string; cpf: string; telefone: string; email: string; observacoes?: string | null }[];
  contract?: { pdf_url?: string | null; assinatura_url?: string | null; observacoes?: string | null } | { pdf_url?: string | null; assinatura_url?: string | null; observacoes?: string | null }[];
};

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState<RentalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRentals();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLastSeenRentalsAt();
    }, [])
  );

  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          product:products(nome, imagem),
          client:contract_client_data(*),
          contract:contracts(pdf_url, assinatura_url, observacoes)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRentals((data as RentalRow[]) || []);
    } catch (error: any) {
      alert('Erro ao carregar aluguéis: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRentalItem = ({ item }: { item: RentalRow }) => {
    const client = firstRelation(item.client);
    const contract = firstRelation(item.contract);
    const clientName = client?.nome || item.cliente_nome || 'Cliente não identificado';
    const valor = Number(item.valor_total ?? 0);

    const periodoRetirada = formatDbDate(item.retirada_data, "dd 'de' MMM");
    const periodoDevolucao = formatDbDate(item.devolucao_data, "dd 'de' MMM");
    const periodo =
      periodoRetirada !== '—' && periodoDevolucao !== '—'
        ? `${periodoRetirada} — ${periodoDevolucao}`
        : 'Período não informado';

    const horario =
      item.retirada_hora && item.devolucao_hora
        ? ` (${String(item.retirada_hora).slice(0, 5)} às ${String(item.devolucao_hora).slice(0, 5)})`
        : '';

    return (
      <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-xs font-bold text-primary-600 uppercase mb-1">
              Reserva #{item.id.slice(0, 8)}
            </Text>
            <Text className="text-lg font-bold text-slate-900">{item.product?.nome || 'Produto'}</Text>
            <Text className="text-xs text-slate-500 mt-1">{item.status}</Text>
          </View>
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-[10px] font-bold text-slate-600">
              R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View className="space-y-3">
          <View className="flex-row items-center">
            <User size={16} color="#64748b" className="mr-2" />
            <Text className="text-slate-600 text-sm flex-1">{clientName}</Text>
          </View>

          <View className="flex-row items-center">
            <Calendar size={16} color="#64748b" className="mr-2" />
            <Text className="text-slate-600 text-sm flex-1">
              {periodo}
              {horario}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Package size={16} color="#64748b" className="mr-2" />
            <Text className="text-slate-600 text-sm flex-1">
              Alugado em: {formatDbDate(item.created_at, "dd/MM/yy 'às' HH:mm", 'Data indisponível')}
            </Text>
          </View>
        </View>

        <View className="flex-row mt-6 pt-4 border-t border-slate-50 space-x-3">
          {(contract?.pdf_url || contract?.assinatura_url) ? (
            <TouchableOpacity
              onPress={() => {
                const url = contract?.pdf_url || contract?.assinatura_url;
                if (url) Linking.openURL(url);
              }}
              className="flex-1 bg-primary-50 py-3 rounded-xl flex-row items-center justify-center"
            >
              <FileText size={16} color={BRAND.primary} className="mr-2" />
              <Text className="text-primary-700 font-bold text-sm">
                {contract?.pdf_url ? 'Contrato' : 'Documento'}
              </Text>
            </TouchableOpacity>
          ) : contract !== undefined ? (
            <View className="flex-1 bg-slate-100 py-3 rounded-xl flex-row items-center justify-center opacity-60">
              <FileText size={16} color="#94a3b8" className="mr-2" />
              <Text className="text-slate-400 font-bold text-sm">Sem PDF</Text>
            </View>
          ) : null}
          <TouchableOpacity
            className="flex-1 bg-slate-50 py-3 rounded-xl flex-row items-center justify-center"
            onPress={() => {
              const obs = client?.observacoes || contract?.observacoes;
              const lines = [
                `Nome: ${clientName}`,
                client?.cpf ? `CPF: ${client.cpf}` : `CPF: ${item.cliente_cpf}`,
                client?.telefone ? `Telefone: ${client.telefone}` : `Telefone: ${item.cliente_telefone}`,
                client?.email ? `E-mail: ${client.email}` : '',
                `Status: ${item.status}`,
                obs ? `\nObservações:\n${obs}` : '\nObservações: (nenhuma)',
              ].filter(Boolean);
              alert(lines.join('\n'));
            }}
          >
            <ExternalLink size={16} color="#475569" className="mr-2" />
            <Text className="text-slate-700 font-bold text-sm">Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen
        options={{
          title: 'Locações',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View className="p-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-48 mb-4" />
          ))}
        </View>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item.id}
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
