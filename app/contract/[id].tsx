import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { pdf } from '@react-pdf/renderer';
import { Camera, Trash2 } from 'lucide-react-native';

import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AddressFields } from '@/components/business/AddressFields';
import { useProduct } from '@/hooks/useProducts';
import { reservationsService } from '@/services/reservationsService';
import { contractsService } from '@/services/contractsService';
import { uploadService } from '@/services/uploadService';
import { ContractPdf } from '@/services/ContractPdf';

const schema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
  cep: z.string().min(8, 'CEP inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Erro desconhecido';
}

export default function ContractPage() {
  const { id, startDate, startTime, endDate, endTime } = useLocalSearchParams<{
    id: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }>();
  
  const router = useRouter();
  const { data: product } = useProduct(id!);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!documentImage) {
      alert('Por favor, envie a foto do seu documento antes de finalizar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const d1 = new Date(startDate! + 'T12:00:00');
      const d2 = new Date(endDate! + 'T12:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 7;

      // 1. Create Reservation
      const reservation = await reservationsService.create({
        product_id: id!,
        cliente_nome: data.nome,
        cliente_cpf: data.cpf,
        cliente_telefone: data.telefone,
        retirada_data: startDate!,
        retirada_hora: startTime!,
        devolucao_data: endDate!,
        devolucao_hora: endTime!,
        status: 'Pendente',
        valor_total: product!.valor * calculatedDays,
      });

      // 2. Upload Document Photo
      const documentoUrl = await uploadService.uploadDocument(reservation.id, documentImage);

      // 3. Generate and Upload PDF (opcional — não bloqueia o aluguel)
      let pdfUrl: string | null = null;
      try {
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

        const blob = await pdf(
          <ContractPdf
            clientData={pdfClientData}
            reservation={reservation}
            product={product!}
            documentoUrl={documentoUrl}
          />
        ).toBlob();

        pdfUrl = await uploadService.uploadContractPdf(reservation.id, blob);
      } catch (pdfError) {
        console.warn('PDF não gerado, reserva será salva sem arquivo PDF:', pdfError);
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

      await contractsService.createClientData({
        reservation_id: reservation.id,
        nome: data.nome,
        cpf: data.cpf,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        telefone: data.telefone,
        email: data.email,
      });

      // 5. Success
      alert('Aluguel finalizado com sucesso! O contrato foi gerado e salvo.');
      router.replace('/');
    } catch (error) {
      console.error(error);
      const msg = getErrorMessage(error);
      if (msg.includes('Bucket not found') || msg.includes('not found')) {
        alert('Erro no armazenamento de arquivos. Verifique os buckets "signatures" e "contracts" no Supabase.');
      } else if (msg.includes('row-level security') || msg.includes('policy')) {
        alert('Permissão negada no servidor. Configure as políticas de Storage e INSERT no Supabase.');
      } else {
        alert(`Erro ao finalizar aluguel: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Contrato' }} />
      <Header />
      
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-slate-900 mb-2">Dados do Contrato</Text>
          <Text className="text-slate-500">Preencha suas informações para gerar o contrato de locação.</Text>
        </View>

        <View className="space-y-4 mb-10">
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, value } }) => (
              <Input label="Nome Completo" value={value} onChangeText={onChange} error={errors.nome?.message} />
            )}
          />

          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, value } }) => (
              <Input label="CPF" value={value} onChangeText={onChange} error={errors.cpf?.message} />
            )}
          />

          <AddressFields control={control} errors={errors} setValue={setValue} />

          <View className="flex-row space-x-4">
            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, value } }) => (
                <Input label="Telefone/WhatsApp" value={value} onChangeText={onChange} error={errors.telefone?.message} containerClassName="flex-1" />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input label="Email" value={value} onChangeText={onChange} error={errors.email?.message} containerClassName="flex-1" />
              )}
            />
          </View>

          <Controller
            control={control}
            name="observacoes"
            render={({ field: { onChange, value } }) => (
              <Input label="Observações" value={value} onChangeText={onChange} multiline numberOfLines={3} className="h-24" />
            )}
          />
        </View>

        <View className="mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
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
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="w-full aspect-[16/9] bg-white rounded-2xl border-2 border-dashed border-slate-200 items-center justify-center shadow-sm"
            >
              <View className="items-center px-4">
                <View className="p-3 bg-primary-50 rounded-full mb-3">
                  <Camera size={24} color="#0284c7" />
                </View>
                <Text className="text-slate-800 font-bold text-sm text-center">Tirar Foto ou Enviar Imagem</Text>
                <Text className="text-slate-400 text-xs text-center mt-1">Formatos aceitos: JPG, PNG</Text>
              </View>
            </TouchableOpacity>
          )}
          {documentImage && <Text className="mt-2 text-xs text-green-600 font-medium text-center">✓ Documento carregado com sucesso!</Text>}
        </View>

        <View className="h-20" />
      </ScrollView>

      <View className="px-6 py-6 border-t border-slate-100 bg-white">
        <Button 
          label="Finalizar Aluguel" 
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          className="h-14"
        />
      </View>
    </View>
  );
}
