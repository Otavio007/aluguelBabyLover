import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Product, ContractClientData, Reservation } from '@/types';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#1e293b' },
  header: { marginBottom: 30, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#0284c7' },
  subtitle: { fontSize: 12, color: '#64748b', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', borderBottom: '1pt solid #e2e8f0', paddingBottom: 5, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 120, fontWeight: 'bold', color: '#64748b' },
  value: { flex: 1 },
  terms: { marginTop: 30, fontSize: 8, color: '#64748b', textAlign: 'justify' },
  signatureSection: { marginTop: 50, flexDirection: 'row', justifyContent: 'center' },
  signatureBox: { borderTop: '1pt solid #cbd5e1', width: 250, paddingTop: 10, alignItems: 'center' },
});

interface ContractPdfProps {
  clientData: ContractClientData;
  reservation: Reservation;
  product: Product;
  documentoUrl?: string;
}

export const ContractPdf = ({ clientData, reservation, product }: ContractPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>BabyLover</Text>
        <Text style={styles.subtitle}>Contrato de Locação de Equipamento Infantil</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Locatário</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{clientData.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CPF:</Text>
          <Text style={styles.value}>{clientData.cpf}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{`${clientData.endereco}, ${clientData.cidade} - ${clientData.estado}, CEP: ${clientData.cep}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contato:</Text>
          <Text style={styles.value}>{`${clientData.telefone} | ${clientData.email}`}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Objeto e Locação</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Produto:</Text>
          <Text style={styles.value}>{product.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Marca/Modelo:</Text>
          <Text style={styles.value}>{product.marca}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Período:</Text>
          <Text style={styles.value}>{`${reservation.retirada_data} ${reservation.retirada_hora} até ${reservation.devolucao_data} ${reservation.devolucao_hora}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.value}>{`R$ ${reservation.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</Text>
        </View>
      </View>

      <View style={styles.terms}>
        <Text>
          Termos e Condições: O locatário declara estar recebendo o equipamento em perfeitas condições de uso e limpeza.
          Compromete-se a devolver o produto na data e horário estipulados, sob pena de multa diária.
        </Text>
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 }}>
            ACEITO E ASSINADO ELETRONICAMENTE
          </Text>
          <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 12 }}>
            Autenticado via upload de documento com foto.
          </Text>
          <Text>{clientData.nome}</Text>
          <Text style={{ fontSize: 8, color: '#94a3b8' }}>CPF: {clientData.cpf}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
