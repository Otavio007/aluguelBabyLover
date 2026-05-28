import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Product, ContractClientData, Reservation } from '@/types';

<<<<<<< HEAD
=======
function toBR(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function todayBR(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

>>>>>>> 44bc8be (Ajustes)
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#1e293b' },
  header: { marginBottom: 30, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#4C007D' },
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
<<<<<<< HEAD
=======
        <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>Gerado em {todayBR()}</Text>
>>>>>>> 44bc8be (Ajustes)
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
<<<<<<< HEAD
          <Text style={styles.value}>{`${reservation.retirada_data} ${reservation.retirada_hora} até ${reservation.devolucao_data} ${reservation.devolucao_hora}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.value}>{`R$ ${reservation.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</Text>
=======
          <Text style={styles.value}>{`${toBR(reservation.retirada_data)} às ${reservation.retirada_hora} até ${toBR(reservation.devolucao_data)} às ${reservation.devolucao_hora}`}</Text>
        </View>
        {(reservation.quantidade ?? 1) > 1 && (
          <View style={styles.row}>
            <Text style={styles.label}>Quantidade:</Text>
            <Text style={styles.value}>{reservation.quantidade} unidades</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Valor Unitário:</Text>
          <Text style={styles.value}>{`R$ ${product.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ${product.tipo_cobranca}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={[styles.value, { fontWeight: 'bold', color: '#4C007D' }]}>{`R$ ${reservation.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</Text>
>>>>>>> 44bc8be (Ajustes)
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
