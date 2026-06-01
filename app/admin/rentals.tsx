import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  User,
  FileText,
  Package,
  CheckCircle2,
  Circle,
  MessageSquare,
  X,
  Check,
  RefreshCw,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDbDate } from '@/utils/dateHelper';
import { setLastSeenRentalsAt } from '@/utils/adminRentalsSeen';
import { Reservation, ReservationStatus } from '@/types';
import { BRAND } from '@/constants/brand';
import { useFocusEffect } from '@react-navigation/native';
import { reservationsService } from '@/services/reservationsService';
import { contractsService } from '@/services/contractsService';
import { generateContractPdf } from '@/services/generateContractPdf';
import { uploadService } from '@/services/uploadService';
import { downloadPdfBlob } from '@/utils/downloadPdf';
import { printContractHtml } from '@/utils/printContract';
import { ContractClientData } from '@/types';

function showAdminAlert(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function openExternalUrl(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url);
}

type RentalRow = Reservation & {
  product?: { nome: string; imagem?: string };
  client?: { nome: string; cpf: string; telefone: string; email: string } | null;
  contract?: { pdf_url?: string | null; assinatura_url?: string | null } | null;
};

type FilterTab = 'todos' | 'pendentes' | 'em_andamento' | 'finalizados' | 'cancelados';

const STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string; dot: string }> = {
  Pendente:       { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  Confirmado:     { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  'Em andamento': { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  Finalizado:     { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  Cancelado:      { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState<RentalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [generatingPdf, setGeneratingPdf] = useState<Record<string, boolean>>({});

  // Observations modal
  const [obsModal, setObsModal] = useState<{ open: boolean; id: string; value: string } | null>(null);
  const obsInputRef = useRef<TextInput>(null);

  const router = useRouter();

  const fetchRentals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          product:products(nome, imagem),
          client:contract_client_data(nome, cpf, telefone, email),
          contract:contracts(pdf_url, assinatura_url)
        `)
        .order('retirada_data', { ascending: false });

      if (error) throw error;
      setRentals((data as RentalRow[]) || []);
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível carregar os aluguéis: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRentals();
      setLastSeenRentalsAt();
    }, [fetchRentals])
  );

  /** Toggle entregue / devolvido with optimistic update */
  const toggleField = async (
    item: RentalRow,
    field: 'entregue' | 'devolvido'
  ) => {
    const newValue = !item[field];

    // Determina novo status baseado nos toggles
    let newStatus: ReservationStatus = item.status;
    const entregue = field === 'entregue' ? newValue : item.entregue;
    const devolvido = field === 'devolvido' ? newValue : item.devolvido;

    if (devolvido) {
      newStatus = 'Finalizado';
    } else if (entregue) {
      newStatus = 'Em andamento';
    } else if (newStatus === 'Finalizado' || newStatus === 'Em andamento') {
      newStatus = 'Confirmado';
    }

    // Optimistic update
    setRentals(prev =>
      prev.map(r =>
        r.id === item.id ? { ...r, [field]: newValue, status: newStatus } : r
      )
    );

    setSaving(prev => ({ ...prev, [item.id]: true }));
    try {
      await reservationsService.update(item.id, {
        [field]: newValue,
        status: newStatus,
      });
    } catch (err: any) {
      // Revert on error
      setRentals(prev =>
        prev.map(r =>
          r.id === item.id ? { ...r, [field]: item[field], status: item.status } : r
        )
      );
      Alert.alert('Erro', 'Não foi possível salvar: ' + err.message);
    } finally {
      setSaving(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const saveObservation = async () => {
    if (!obsModal) return;
    setSaving(prev => ({ ...prev, [obsModal.id]: true }));
    try {
      await reservationsService.update(obsModal.id, { observacoes: obsModal.value.trim() || null });
      setRentals(prev =>
        prev.map(r =>
          r.id === obsModal.id ? { ...r, observacoes: obsModal.value.trim() || null } : r
        )
      );
      setObsModal(null);
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível salvar a observação: ' + err.message);
    } finally {
      setSaving(prev => {
        const copy = { ...prev };
        delete copy[obsModal.id];
        return copy;
      });
    }
  };

  const handleGenerateContract = async (item: RentalRow) => {
    setGeneratingPdf(prev => ({ ...prev, [item.id]: true }));
    try {
      const reservation = await reservationsService.getById(item.id);
      if (!reservation.product) {
        showAdminAlert('Erro', 'Produto não encontrado para esta reserva.');
        return;
      }

      const clientFromDb = await contractsService.getClientDataByReservationId(item.id);
      const client = firstRelation(item.client);

      const clientData: ContractClientData = clientFromDb ?? {
        id: '',
        reservation_id: item.id,
        nome: client?.nome || item.cliente_nome,
        cpf: client?.cpf || item.cliente_cpf,
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: client?.telefone || item.cliente_telefone,
        email: client?.email || '',
      };

      const orderRef = item.id.slice(0, 8).toUpperCase();
      const blob = await generateContractPdf({
        clientData,
        reservation,
        product: reservation.product,
      });

      if (!blob) {
        printContractHtml({
          clientData,
          reservation,
          product: reservation.product,
          orderNumber: orderRef,
        });
        showAdminAlert(
          'Contrato aberto',
          'Não foi possível gerar o arquivo PDF automaticamente. Abrimos o contrato em uma nova janela — use Imprimir e escolha "Salvar como PDF".'
        );
        return;
      }

      const fileName = `contrato-${orderRef}.pdf`;
      let uploadedUrl: string | null = null;

      try {
        uploadedUrl = await uploadService.uploadContractPdf(item.id, blob);
        await contractsService.updatePdfUrl(item.id, uploadedUrl);
        setRentals(prev =>
          prev.map(r =>
            r.id === item.id
              ? {
                  ...r,
                  contract: {
                    ...(firstRelation(r.contract) ?? {}),
                    pdf_url: uploadedUrl,
                  },
                }
              : r
          )
        );
      } catch (uploadErr) {
        console.warn('PDF gerado, mas falhou ao salvar no storage:', uploadErr);
      }

      if (Platform.OS === 'web') {
        downloadPdfBlob(blob, fileName);
        showAdminAlert(
          'PDF gerado',
          uploadedUrl
            ? 'O download do contrato foi iniciado. O arquivo também foi salvo no sistema (botão Ver PDF).'
            : 'O download do contrato foi iniciado. Verifique a pasta de downloads do navegador.'
        );
      } else if (uploadedUrl) {
        openExternalUrl(uploadedUrl);
        showAdminAlert('Sucesso', 'Contrato gerado e salvo com sucesso.');
      } else {
        showAdminAlert('Sucesso', 'Contrato gerado com sucesso!');
      }
    } catch (err: any) {
      showAdminAlert('Erro', 'Não foi possível gerar o contrato: ' + err.message);
    } finally {
      setGeneratingPdf(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const filteredRentals = rentals.filter(r => {
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'pendentes') return r.status === 'Pendente' || r.status === 'Confirmado';
    if (activeFilter === 'em_andamento') return r.status === 'Em andamento';
    if (activeFilter === 'finalizados') return r.status === 'Finalizado';
    if (activeFilter === 'cancelados') return r.status === 'Cancelado';
    return true;
  });

  const counts = {
    todos: rentals.length,
    pendentes: rentals.filter(r => r.status === 'Pendente' || r.status === 'Confirmado').length,
    em_andamento: rentals.filter(r => r.status === 'Em andamento').length,
    finalizados: rentals.filter(r => r.status === 'Finalizado').length,
    cancelados: rentals.filter(r => r.status === 'Cancelado').length,
  };

  const renderCard = ({ item }: { item: RentalRow }) => {
    const client = firstRelation(item.client);
    const contract = firstRelation(item.contract);
    const clientName = client?.nome || item.cliente_nome || 'Cliente';
    const valor = Number(item.valor_total ?? 0);
    const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pendente;
    const isSaving = saving[item.id];
    const isGenerating = generatingPdf[item.id];

    const periodoRetirada = formatDbDate(item.retirada_data, "dd/MM/yy");
    const periodoDevolucao = formatDbDate(item.devolucao_data, "dd/MM/yy");
    const pdfUrl = contract?.pdf_url || contract?.assinatura_url;

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              #{item.id.slice(0, 8)}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>
              {item.product?.nome || 'Produto'}
            </Text>
            {(item.quantidade ?? 1) > 1 && (
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                {item.quantidade} unidades
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dot }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{item.status}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151' }}>
              R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ gap: 6, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <User size={14} color="#94A3B8" />
            <Text style={{ fontSize: 13, color: '#475569', flex: 1 }}>{clientName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Calendar size={14} color="#94A3B8" />
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Retirada: {periodoRetirada}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Clock size={14} color="#94A3B8" />
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Devolução: {periodoDevolucao}
            </Text>
          </View>
          {item.observacoes ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <MessageSquare size={14} color="#94A3B8" style={{ marginTop: 1 }} />
              <Text style={{ fontSize: 12, color: '#64748B', flex: 1, fontStyle: 'italic' }} numberOfLines={2}>
                {item.observacoes}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 }} />

        {/* Action row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Entregue toggle */}
          <TouchableOpacity
            onPress={() => toggleField(item, 'entregue')}
            disabled={isSaving || item.devolvido}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: item.entregue ? '#D1FAE5' : '#F8FAFC',
              borderWidth: 1,
              borderColor: item.entregue ? '#6EE7B7' : '#E2E8F0',
              opacity: item.devolvido ? 0.5 : 1,
            }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={BRAND.primary} />
            ) : item.entregue ? (
              <CheckCircle2 size={16} color="#059669" />
            ) : (
              <Circle size={16} color="#94A3B8" />
            )}
            <Text style={{
              fontSize: 12,
              fontWeight: '700',
              color: item.entregue ? '#065F46' : '#64748B',
            }}>
              Entregue
            </Text>
          </TouchableOpacity>

          {/* Devolvido toggle */}
          <TouchableOpacity
            onPress={() => toggleField(item, 'devolvido')}
            disabled={isSaving || !item.entregue}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: item.devolvido ? '#EDE9FE' : '#F8FAFC',
              borderWidth: 1,
              borderColor: item.devolvido ? '#C4B5FD' : '#E2E8F0',
              opacity: !item.entregue ? 0.4 : 1,
            }}
          >
            {item.devolvido ? (
              <CheckCircle2 size={16} color={BRAND.primary} />
            ) : (
              <RefreshCw size={16} color="#94A3B8" />
            )}
            <Text style={{
              fontSize: 12,
              fontWeight: '700',
              color: item.devolvido ? BRAND.primary : '#64748B',
            }}>
              Devolvido
            </Text>
          </TouchableOpacity>

          {/* Observations */}
          <TouchableOpacity
            onPress={() => setObsModal({ open: true, id: item.id, value: item.observacoes ?? '' })}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: item.observacoes ? '#FFF7ED' : '#F8FAFC',
              borderWidth: 1,
              borderColor: item.observacoes ? '#FED7AA' : '#E2E8F0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={16} color={item.observacoes ? '#EA580C' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        {/* Contract PDF row */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => handleGenerateContract(item)}
            disabled={isGenerating || isSaving}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: '#F5E6FF',
              borderWidth: 1,
              borderColor: '#DDD6FE',
              opacity: isGenerating || isSaving ? 0.6 : 1,
            }}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={BRAND.primary} />
            ) : (
              <FileText size={16} color={BRAND.primary} />
            )}
            <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND.primary }}>
              {isGenerating ? 'Gerando contrato...' : 'Gerar Contrato PDF'}
            </Text>
          </TouchableOpacity>

          {pdfUrl ? (
            <TouchableOpacity
              onPress={() => openExternalUrl(pdfUrl)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#DDD6FE',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND.primary }}>Ver PDF</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Hint when entregue is false */}
        {!item.entregue && item.status !== 'Cancelado' && (
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 8, textAlign: 'center' }}>
            Marque "Entregue" antes de marcar "Devolvido"
          </Text>
        )}
      </View>
    );
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'em_andamento', label: 'Em andamento' },
    { key: 'finalizados', label: 'Finalizados' },
    { key: 'cancelados', label: 'Cancelados' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Stack.Screen
        options={{
          title: 'Locações',
          headerShown: true,
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { color: '#0F172A', fontWeight: '700' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 4, padding: 4 }}>
              <ChevronLeft size={24} color="#0F172A" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={fetchRentals} style={{ marginRight: 8, padding: 4 }}>
              <RefreshCw size={20} color={BRAND.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Filter tabs */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        >
          {TABS.map(tab => {
            const count = counts[tab.key];
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? BRAND.primary : '#F1F5F9',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: isActive ? '#fff' : '#64748B',
                }}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: isActive ? '#fff' : '#475569' }}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-52 mb-4" />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredRentals}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <AlertCircle size={48} color="#CBD5E1" />
              <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 15 }}>
                Nenhum aluguel encontrado.
              </Text>
            </View>
          }
        />
      )}

      {/* Observations modal */}
      {obsModal?.open && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setObsModal(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
              activeOpacity={1}
              onPress={() => setObsModal(null)}
            />
            <View style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            }}>
              {/* Handle */}
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Observações</Text>
                <TouchableOpacity onPress={() => setObsModal(null)}>
                  <X size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TextInput
                ref={obsInputRef}
                autoFocus
                multiline
                numberOfLines={5}
                value={obsModal.value}
                onChangeText={v => setObsModal(prev => prev ? { ...prev, value: v } : prev)}
                placeholder="Digite uma observação sobre este aluguel..."
                placeholderTextColor="#CBD5E1"
                style={{
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 14,
                  padding: 14,
                  fontSize: 14,
                  color: '#0F172A',
                  minHeight: 120,
                  textAlignVertical: 'top',
                  backgroundColor: '#F8FAFC',
                  marginBottom: 16,
                }}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {obsModal.value ? (
                  <TouchableOpacity
                    onPress={() => setObsModal(prev => prev ? { ...prev, value: '' } : prev)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: '#FEE2E2',
                      backgroundColor: '#FFF5F5',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={18} color="#EF4444" />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={saveObservation}
                  disabled={saving[obsModal.id]}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: BRAND.primary,
                  }}
                >
                  {saving[obsModal.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Check size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}
