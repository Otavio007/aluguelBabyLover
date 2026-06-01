import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Alert, Image, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Trash2, CheckCircle2, Heart, FileText, Home, Printer } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AddressFields } from '@/components/business/AddressFields';
import { useProduct } from '@/hooks/useProducts';
import { reservationsService } from '@/services/reservationsService';
import { contractsService } from '@/services/contractsService';
import { uploadService } from '@/services/uploadService';
import { generateContractPdf } from '@/services/generateContractPdf';
import {
  contractFormSchema,
  ContractFormData,
  getFormErrorMessages,
} from '@/utils/formValidators';
import { BRAND, LOGO_MASCOT } from '@/constants/brand';
import {
  getProductEntregaHoraInicio,
  getProductEntregaHoraFim,
  normalizeTime,
} from '@/utils/schedulingHelper';
import { printCompletedContract } from '@/utils/printContract';
import { ContractPrintData } from '@/utils/buildContractPrintHtml';
import { ContractClientData, Reservation } from '@/types';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Erro desconhecido';
}

export default function ContractPage() {
  const { id, startDate, endDate, quantidade } = useLocalSearchParams<{
    id: string;
    startDate: string;
    endDate: string;
    quantidade: string;
  }>();
  const selectedQty = Math.max(1, parseInt(quantidade ?? '1', 10) || 1);
  
  const router = useRouter();
  const { data: product } = useProduct(id!);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [completedContract, setCompletedContract] = useState<{
    printData: ContractPrintData;
    pdfUrl: string | null;
    pdfBlob: Blob | null;
    reservation: Reservation;
    clientData: ContractClientData;
  } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      observacoes: '',
    },
    mode: 'onSubmit',
  });

  const showAlert = (message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(message);
    } else {
      Alert.alert('Atenção', message);
    }
  };

  const onValidationError = (fieldErrors: FieldErrors<ContractFormData>) => {
    const messages = getFormErrorMessages(fieldErrors);
    const text =
      messages.length > 0
        ? `Corrija os campos abaixo:\n\n• ${messages.join('\n• ')}`
        : 'Preencha todos os campos obrigatórios.';
    setSubmitFeedback(text.replace(/\n/g, ' '));
    showAlert(text);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onSubmit = async (data: ContractFormData) => {
    setSubmitFeedback(null);

    if (!documentImage) {
      const msg = 'Envie a foto do seu documento antes de finalizar.';
      setDocumentError(msg);
      setSubmitFeedback(msg);
      showAlert(msg);
      return;
    }
    setDocumentError(null);

    setIsSubmitting(true);
    try {
      const d1 = new Date(startDate! + 'T12:00:00');
      const d2 = new Date(endDate! + 'T12:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      // +1 para contar o dia da retirada e o da devolução (ambos inclusos)
      const calculatedDays = Math.max(1, diffDays + 1);
      const valorUnit = Number(product!.valor ?? 0);

      // 1. Create Reservation
      const reservation = await reservationsService.create({
        product_id: id!,
        cliente_nome: data.nome,
        cliente_cpf: data.cpf,
        cliente_telefone: data.telefone,
        retirada_data: startDate!,
        retirada_hora: normalizeTime(
          getProductEntregaHoraInicio(product),
          '09:00'
        ),
        devolucao_data: endDate!,
        devolucao_hora: normalizeTime(
          getProductEntregaHoraFim(product),
          '18:00'
        ),
        status: 'Pendente',
        quantidade: selectedQty,
        valor_total: valorUnit * calculatedDays * selectedQty,
      });

      // 2. Upload Document Photo
      let documentoUrl: string;
      try {
        documentoUrl = await uploadService.uploadDocument(reservation.id, documentImage);
      } catch (uploadErr) {
        console.error('Upload documento:', uploadErr);
        throw uploadErr;
      }

      // 3. PDF só no app nativo (web não usa @react-pdf — evita erro de módulo)
      let pdfUrl: string | null = null;
      const pdfClientData = {
        id: '',
        reservation_id: reservation.id,
        nome: data.nome,
        cpf: data.cpf,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        telefone: data.telefone,
        email: data.email,
      };

      const pdfBlob = await generateContractPdf({
        clientData: pdfClientData,
        reservation,
        product: product!,
        documentoUrl,
      });

      if (pdfBlob) {
        pdfUrl = await uploadService.uploadContractPdf(reservation.id, pdfBlob);
      }

      // 4. Create Contract and Client Data records
      const contractPayload: Record<string, string | null> = {
        reservation_id: reservation.id,
        pdf_url: pdfUrl,
        assinatura_url: documentoUrl,
        observacoes: data.observacoes || '',
      };

      try {
        await contractsService.createContract(contractPayload as any);
      } catch (err: any) {
        if (err.code === '42703' || err.message?.includes('documento_url')) {
          const { documento_url, ...retryPayload } = contractPayload as any;
          await contractsService.createContract(retryPayload);
        } else {
          throw err;
        }
      }

      const clientDataPayload = {
        reservation_id: reservation.id,
        nome: data.nome,
        cpf: data.cpf,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        telefone: data.telefone,
        email: data.email,
        observacoes: data.observacoes?.trim() || null,
      };

      try {
        await contractsService.createClientData(clientDataPayload);
      } catch (err: any) {
        if (err.code === '42703' || err.message?.includes('observacoes')) {
          const { observacoes, ...withoutObservacoes } = clientDataPayload;
          await contractsService.createClientData(withoutObservacoes);
        } else {
          throw err;
        }
      }

      const pedido = reservation.id.slice(0, 8).toUpperCase();
      const clientForPrint: ContractClientData = {
        id: '',
        reservation_id: reservation.id,
        ...clientDataPayload,
      };

      setOrderNumber(pedido);
      setCompletedContract({
        printData: {
          clientData: clientForPrint,
          reservation,
          product: product!,
          orderNumber: pedido,
        },
        pdfUrl,
        pdfBlob: pdfBlob ?? null,
        reservation,
        clientData: clientForPrint,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      const msg = getErrorMessage(error);
      let userMsg = `Erro ao finalizar aluguel: ${msg}`;
      if (msg.includes('Bucket not found') || msg.includes('not found')) {
        userMsg =
          'Erro no armazenamento de arquivos. Verifique os buckets "signatures" e "contracts" no Supabase.';
      } else if (
        msg.includes('row-level security') ||
        msg.includes('policy') ||
        msg.includes('JWT') ||
        msg.includes('permission')
      ) {
        userMsg =
          'Permissão negada no Supabase. No painel do projeto, abra SQL Editor e execute o arquivo supabase/setup-completo.sql (buckets + políticas de Storage e INSERT).';
      }
      setSubmitFeedback(userMsg);
      showAlert(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizePress = () => {
    if (!product) {
      showAlert('Aguarde o carregamento do produto e tente novamente.');
      return;
    }
    handleSubmit(onSubmit, onValidationError)();
  };

  const handlePrintContract = async () => {
    if (!completedContract) return;
    setIsPrinting(true);
    try {
      await printCompletedContract({
        data: completedContract.printData,
        pdfUrl: completedContract.pdfUrl,
        pdfBlob: completedContract.pdfBlob,
        fileName: `contrato-${orderNumber ?? 'aluguel'}.pdf`,
        generatePdf: async () => {
          const blob = await generateContractPdf({
            clientData: completedContract.clientData,
            reservation: completedContract.reservation,
            product: completedContract.printData.product,
          });
          return blob;
        },
      });
    } catch (err) {
      showAlert(getErrorMessage(err) || 'Não foi possível abrir a impressão do contrato.');
    } finally {
      setIsPrinting(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FDF4FF' }}>
        <Stack.Screen options={{ title: 'Aluguel Confirmado', headerShown: false }} />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            paddingVertical: 48,
          }}
        >
          <Image
            source={LOGO_MASCOT}
            style={{ width: 100, height: 100, marginBottom: 24 }}
            resizeMode="contain"
          />

          {/* Checkmark */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#F0FDF4',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
              borderWidth: 2,
              borderColor: '#BBF7D0',
            }}
          >
            <CheckCircle2 size={44} color="#16A34A" />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: '#0F172A',
              textAlign: 'center',
              marginBottom: 12,
              lineHeight: 34,
            }}
          >
            Aluguel confirmado!
          </Text>

          {orderNumber && (
            <View
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 24,
                marginBottom: 20,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 }}>
                Número do pedido
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: BRAND.primary,
                  letterSpacing: 2,
                }}
              >
                #{orderNumber}
              </Text>
            </View>
          )}

          {/* Thank you message */}
          <Text
            style={{
              fontSize: 16,
              color: '#475569',
              textAlign: 'center',
              lineHeight: 26,
              marginBottom: 8,
            }}
          >
            Obrigado por escolher o{' '}
            <Text style={{ fontWeight: '800', color: BRAND.primary }}>AlugaKi Baby</Text>
            {' '}para alugar!{' '}
            <Text style={{ fontSize: 16 }}>🍼</Text>
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#94A3B8',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 40,
            }}
          >
            Seu contrato foi gerado e salvo com sucesso. Você pode imprimir uma cópia abaixo. Em breve entraremos em contato para combinar a retirada.
          </Text>

          {/* Contract info box */}
          <View
            style={{
              width: '100%',
              backgroundColor: BRAND.primaryLight,
              borderRadius: 18,
              padding: 20,
              marginBottom: 40,
              borderWidth: 1,
              borderColor: '#E9D5FF',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} color={BRAND.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND.primary, marginBottom: 2 }}>
                Contrato salvo
              </Text>
              <Text style={{ fontSize: 12, color: '#7C3AED', lineHeight: 18 }}>
                Anote o número do pedido acima e aguarde nossa confirmação.
              </Text>
            </View>
          </View>

          {/* Heart decoration */}
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 40 }}>
            <Heart size={14} color={BRAND.accent} fill={BRAND.accent} />
            <Text style={{ fontSize: 13, color: '#94A3B8' }}>
              Cuidando do seu bebê com carinho
            </Text>
            <Heart size={14} color={BRAND.accent} fill={BRAND.accent} />
          </View>

          {/* Print contract */}
          <TouchableOpacity
            onPress={handlePrintContract}
            disabled={isPrinting || !completedContract}
            style={{
              width: '100%',
              backgroundColor: BRAND.primary,
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              marginBottom: 12,
              opacity: isPrinting ? 0.7 : 1,
            }}
          >
            <Printer size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {isPrinting ? 'Abrindo impressão...' : 'Imprimir contrato'}
            </Text>
          </TouchableOpacity>

          {/* Back to home button */}
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={{
              width: '100%',
              backgroundColor: BRAND.accent,
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              shadowColor: BRAND.accent,
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Home size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              Voltar ao início
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#FDF4FF' }}>
      <Stack.Screen options={{ title: 'Contrato' }} />
      <Header />

      <ScrollView ref={scrollRef} className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View
          className="mb-8 p-5 rounded-3xl bg-white"
          style={{ borderWidth: 1, borderColor: '#E9CCFF' }}
        >
          <Text className="text-2xl font-bold text-slate-900 mb-2">Dados do Contrato</Text>
          <Text className="text-slate-500 leading-relaxed">
            Preencha suas informações para gerar o contrato de locação.
          </Text>
        </View>

        <View className="space-y-4 mb-10">
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, value } }) => (
              <Input label="Nome Completo" value={value ?? ''} onChangeText={onChange} error={errors.nome?.message} />
            )}
          />

          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, value } }) => (
              <Input label="CPF" value={value ?? ''} onChangeText={onChange} error={errors.cpf?.message} />
            )}
          />

          <AddressFields control={control} errors={errors} setValue={setValue} />

          <View className="flex-row space-x-4">
            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, value } }) => (
                <Input label="Telefone/WhatsApp" value={value ?? ''} onChangeText={onChange} error={errors.telefone?.message} containerClassName="flex-1" />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input label="Email" value={value ?? ''} onChangeText={onChange} error={errors.email?.message} containerClassName="flex-1" />
              )}
            />
          </View>

          <Controller
            control={control}
            name="observacoes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Observações"
                value={value ?? ''}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                className="h-28"
                placeholder="Informações adicionais sobre a locação (opcional)"
              />
            )}
          />
        </View>

        <View
          className={`mb-8 p-6 rounded-3xl border ${
            documentError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <Text className="text-lg font-bold text-slate-900 mb-2">Documento com Foto</Text>
          <Text className="text-xs text-slate-500 mb-4">
            Envie uma foto legível do seu documento de identidade (CNH ou outro documento com foto) para validação do contrato.
          </Text>
          
          {documentImage ? (
            <View className="mb-4 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3] max-w-sm mx-auto w-full">
              <Image source={{ uri: documentImage }} className="w-full h-full" resizeMode="contain" />
              <TouchableOpacity
                onPress={() => setDocumentImage(null)}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-2 shadow-md"
              >
                <Trash2 size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e: any) => {
                  const file = e.target.files?.[0] as File;
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setDocumentImage(event.target?.result as string);
                    setDocumentError(null);
                    setSubmitFeedback(null);
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="w-full aspect-[16/9] bg-white rounded-2xl border-2 border-dashed border-slate-200 items-center justify-center shadow-sm"
            >
              <View className="items-center px-4">
                <View className="p-3 bg-primary-50 rounded-full mb-3">
                  <Camera size={24} color={BRAND.primary} />
                </View>
                <Text className="text-slate-800 font-bold text-sm text-center">Tirar Foto ou Enviar Imagem</Text>
                <Text className="text-slate-400 text-xs text-center mt-1">Formatos aceitos: JPG, PNG</Text>
              </View>
            </TouchableOpacity>
          )}
          {documentImage && (
            <Text className="mt-2 text-xs text-green-600 font-medium text-center">
              ✓ Documento carregado com sucesso!
            </Text>
          )}
          {documentError && (
            <Text className="mt-2 text-xs text-red-600 font-medium text-center">{documentError}</Text>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      <View className="px-6 py-6 bg-white" style={{ borderTopWidth: 1, borderTopColor: '#F3E8FF' }}>
        {submitFeedback && (
          <View className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <Text className="text-sm text-amber-900">{submitFeedback}</Text>
          </View>
        )}
        <Button
          label="Finalizar Aluguel"
          onPress={handleFinalizePress}
          isLoading={isSubmitting}
          className="h-14 rounded-3xl"
          accessibilityRole="button"
        />
      </View>
    </View>
  );
}
