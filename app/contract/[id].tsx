import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { pdf } from '@react-pdf/renderer';

import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SignaturePad } from '@/components/business/SignaturePad';
import { useProduct } from '@/hooks/useProducts';
import { reservationsService } from '@/services/reservationsService';
import { contractsService } from '@/services/contractsService';
import { uploadService } from '@/services/uploadService';
import { ContractPdf } from '@/services/ContractPdf';

const schema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional(),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
  cep: z.string().min(8, 'CEP inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

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
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!signature) {
      alert('Por favor, assine o contrato antes de finalizar.');
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

      // 2. Upload Signature
      const signatureUrl = await uploadService.uploadSignature(reservation.id, signature);

      // 3. Generate and Upload PDF
      const pdfClientData = {
        id: '',
        reservation_id: reservation.id,
        nome: data.nome,
        cpf: data.cpf,
        rg: data.rg || '',
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        telefone: data.telefone,
        email: data.email
      };

      const blob = await pdf(
        <ContractPdf 
          clientData={pdfClientData} 
          reservation={reservation} 
          product={product!} 
          signatureUrl={signature} 
        />
      ).toBlob();
      
      const pdfUrl = await uploadService.uploadContractPdf(reservation.id, blob);

      // 4. Create Contract and Client Data records
      await contractsService.createContract({
        reservation_id: reservation.id,
        pdf_url: pdfUrl,
        assinatura_url: signatureUrl,
        observacoes: data.observacoes || '',
      });

      await contractsService.createClientData({
        ...data,
        rg: data.rg || '',
        reservation_id: reservation.id,
      });

      // 5. Success
      alert('Aluguel finalizado com sucesso! O contrato foi gerado e salvo.');
      router.replace('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao finalizar aluguel. Tente novamente.');
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

          <View className="flex-row space-x-4">
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, value } }) => (
                <Input label="CPF" value={value} onChangeText={onChange} error={errors.cpf?.message} containerClassName="flex-1" />
              )}
            />
            <Controller
              control={control}
              name="rg"
              render={({ field: { onChange, value } }) => (
                <Input label="RG" value={value} onChangeText={onChange} error={errors.rg?.message} containerClassName="flex-1" />
              )}
            />
          </View>

          <Controller
            control={control}
            name="endereco"
            render={({ field: { onChange, value } }) => (
              <Input label="Endereço" value={value} onChangeText={onChange} error={errors.endereco?.message} />
            )}
          />

          <View className="flex-row space-x-4">
            <Controller
              control={control}
              name="cidade"
              render={({ field: { onChange, value } }) => (
                <Input label="Cidade" value={value} onChangeText={onChange} error={errors.cidade?.message} containerClassName="flex-1" />
              )}
            />
            <Controller
              control={control}
              name="estado"
              render={({ field: { onChange, value } }) => (
                <Input label="Estado" value={value} onChangeText={onChange} error={errors.estado?.message} containerClassName="w-24" />
              )}
            />
            <Controller
              control={control}
              name="cep"
              render={({ field: { onChange, value } }) => (
                <Input label="CEP" value={value} onChangeText={onChange} error={errors.cep?.message} containerClassName="w-32" />
              )}
            />
          </View>

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

        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-900 mb-4">Assinatura Digital</Text>
          <SignaturePad onOK={(sig) => setSignature(sig)} />
          {signature && <Text className="mt-2 text-xs text-green-600 font-medium">✓ Assinatura capturada com sucesso!</Text>}
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
