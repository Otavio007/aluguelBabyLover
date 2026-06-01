import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product, ContractClientData, Reservation } from '@/types';
import { LOCADOR, CONTRACT_COLORS } from './contractPdfConstants';

import { LOGO_MASCOT } from '@/constants/brand';

function resolvePdfImageSrc(asset: unknown): string | null {
  if (!asset) return null;
  if (typeof asset === 'string') return asset;
  if (typeof asset === 'object' && asset !== null) {
    const withUri = asset as { uri?: string; default?: string };
    if (withUri.uri) return withUri.uri;
    if (withUri.default) return withUri.default;
  }
  return null;
}

const LOGO_PDF_SRC = resolvePdfImageSrc(LOGO_MASCOT);

function toBR(dateStr: string): string {
  if (!dateStr) return '___/___/______';
  const trimmed = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}/${m}/${y}`;
  }
  return trimmed;
}

function formatTime(time: string | null | undefined): string {
  if (!time) return '___:___';
  return String(time).slice(0, 5);
}

function todayParts(): { day: string; month: string; year: string } {
  const now = new Date();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return {
    day: String(now.getDate()).padStart(2, '0'),
    month: months[now.getMonth()],
    year: String(now.getFullYear()),
  };
}

function money(value: number): string {
  return Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

const C = CONTRACT_COLORS;

const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    fontSize: 5.8,
    color: C.text,
    fontFamily: 'Helvetica',
  },
  borderBox: {
    borderWidth: 0.8,
    borderColor: C.border,
    borderRadius: 3,
    padding: 5,
    marginBottom: 4,
  },
  sectionTitle: {
    color: C.pink,
    fontWeight: 'bold',
    fontSize: 6.5,
    marginBottom: 3,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: C.text,
    fontSize: 5.5,
  },
  fieldValue: {
    flex: 1,
    fontSize: 5.5,
    color: C.text,
  },
  clauseTitle: {
    color: C.pink,
    fontWeight: 'bold',
    fontSize: 6,
    marginBottom: 1.5,
  },
  clauseText: {
    fontSize: 5.3,
    lineHeight: 1.35,
    color: C.muted,
    textAlign: 'justify',
    marginBottom: 4,
  },
  table: {
    borderWidth: 0.8,
    borderColor: C.border,
    marginTop: 3,
    marginBottom: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.yellow,
    borderBottomWidth: 0.8,
    borderBottomColor: C.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    minHeight: 14,
  },
  th: {
    fontWeight: 'bold',
    fontSize: 5.3,
    padding: 2,
    textAlign: 'center',
    color: C.text,
  },
  td: {
    fontSize: 5.3,
    padding: 2,
    textAlign: 'center',
    color: C.text,
  },
  colItem: { width: '8%' },
  colDesc: { width: '34%' },
  colMarca: { width: '22%' },
  colEstado: { width: '22%' },
  colQtd: { width: '14%' },
  twoCol: {
    flexDirection: 'row',
    gap: 6,
  },
  colHalf: {
    flex: 1,
  },
  valueBox: {
    backgroundColor: C.pinkLight,
    borderWidth: 0.8,
    borderColor: C.pink,
    borderRadius: 3,
    padding: 4,
    marginVertical: 2,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: C.pink,
  },
  bullet: {
    fontSize: 5.2,
    lineHeight: 1.35,
    color: C.muted,
    marginBottom: 1,
  },
  footerBox: {
    borderWidth: 0.8,
    borderColor: C.pink,
    borderRadius: 3,
    padding: 5,
    marginTop: 4,
  },
  signatureLine: {
    borderTopWidth: 0.8,
    borderTopColor: '#999',
    marginTop: 18,
    paddingTop: 3,
    textAlign: 'center',
    fontSize: 5.5,
    fontWeight: 'bold',
  },
});

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}: </Text>
      <Text style={styles.fieldValue}>{value?.trim() || '______________________________'}</Text>
    </View>
  );
}

function Clause({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 3 }}>
      <Text style={styles.clauseTitle}>{num}. {title}</Text>
      {children}
    </View>
  );
}

export interface ContractPdfDocumentProps {
  clientData: ContractClientData;
  reservation: Reservation;
  product: Product;
  documentoUrl?: string;
}

export function ContractPdfDocument({ clientData, reservation, product }: ContractPdfDocumentProps) {
  const qty = reservation.quantidade ?? 1;
  const date = todayParts();
  const enderecoCompleto = [clientData.endereco, clientData.cidade, clientData.estado]
    .filter(Boolean)
    .join(', ');

  const tableRows = [
    {
      item: '1',
      desc: product.nome,
      marca: product.marca || '—',
      estado: product.estado_conservacao || 'Bom',
      qtd: String(qty),
    },
    { item: '2', desc: '', marca: '', estado: '', qtd: '' },
    { item: '3', desc: '', marca: '', estado: '', qtd: '' },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {LOGO_PDF_SRC ? (
            <Image src={LOGO_PDF_SRC} style={{ width: 52, height: 52, objectFit: 'contain' }} />
          ) : (
            <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.pink }}>BL</Text>
            </View>
          )}
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 6 }}>
            <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: C.pink, textAlign: 'center' }}>
              CONTRATO DE LOCAÇÃO DE BRINQUEDOS E ARTIGOS INFANTIS
            </Text>
            <Text style={{ fontSize: 5.5, color: C.muted, textAlign: 'center', marginTop: 2 }}>
              Este contrato regula a locação de brinquedos e artigos infantis entre as partes abaixo qualificadas.
            </Text>
          </View>
          <View style={{ width: 52, alignItems: 'center' }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: C.pink }}>BABY</Text>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#FFB300' }}>LOVER</Text>
          </View>
        </View>

        {/* Feature bar */}
        <View style={[styles.borderBox, { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }]}>
          {[
            'PRODUTOS HIGIENIZADOS E DE QUALIDADE',
            'SEGURANÇA PARA SEU FILHO',
            'PRATICIDADE PARA A SUA FAMÍLIA',
            'CONFIANÇA E CUIDADO EM CADA DETALHE',
          ].map((t) => (
            <Text key={t} style={{ fontSize: 4.8, fontWeight: 'bold', color: C.pink, width: '24%', textAlign: 'center' }}>
              {t}
            </Text>
          ))}
        </View>

        {/* Locador / Locatário */}
        <View style={styles.twoCol}>
          <View style={[styles.colHalf, styles.borderBox]}>
            <Text style={styles.sectionTitle}>1. LOCADOR</Text>
            <Field label="Nome/Razão Social" value={LOCADOR.razaoSocial} />
            <Field label="CNPJ" value={LOCADOR.cnpj} />
            <Field label="Endereço" value={LOCADOR.endereco} />
            <Field label="Cidade/UF" value={LOCADOR.cidadeUfCep} />
            <Field label="Telefone/WhatsApp" value={LOCADOR.telefone} />
            <Field label="E-mail" value={LOCADOR.email} />
          </View>
          <View style={[styles.colHalf, styles.borderBox]}>
            <Text style={styles.sectionTitle}>2. LOCATÁRIO</Text>
            <Field label="Nome Completo" value={clientData.nome} />
            <Field label="CPF" value={clientData.cpf} />
            <Field label="RG" value={(clientData as { rg?: string }).rg} />
            <Field label="Endereço" value={clientData.endereco} />
            <Field label="Cidade/UF" value={`${clientData.cidade || ''} - ${clientData.estado || ''}`} />
            <Field label="CEP" value={clientData.cep} />
            <Field label="Telefone/WhatsApp" value={clientData.telefone} />
            <Field label="E-mail" value={clientData.email} />
          </View>
        </View>

        {/* Objeto */}
        <View style={styles.borderBox}>
          <Text style={styles.sectionTitle}>3. OBJETO DA LOCAÇÃO</Text>
          <Text style={styles.clauseText}>
            3.1. O LOCADOR cede ao LOCATÁRIO, em regime de locação, os itens descritos na tabela abaixo, de sua
            propriedade, para uso exclusivamente doméstico e temporário, conforme prazo estabelecido neste contrato.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colItem]}>ITEM</Text>
              <Text style={[styles.th, styles.colDesc]}>DESCRIÇÃO DO PRODUTO</Text>
              <Text style={[styles.th, styles.colMarca]}>MARCA / MODELO</Text>
              <Text style={[styles.th, styles.colEstado]}>ESTADO DE CONSERVAÇÃO</Text>
              <Text style={[styles.th, styles.colQtd]}>QTDE</Text>
            </View>
            {tableRows.map((row) => (
              <View key={row.item} style={styles.tableRow}>
                <Text style={[styles.td, styles.colItem]}>{row.item}</Text>
                <Text style={[styles.td, styles.colDesc]}>{row.desc}</Text>
                <Text style={[styles.td, styles.colMarca]}>{row.marca}</Text>
                <Text style={[styles.td, styles.colEstado]}>{row.estado}</Text>
                <Text style={[styles.td, styles.colQtd]}>{row.qtd}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.clauseText}>
            3.2. O LOCATÁRIO declara ter recebido os itens em perfeitas condições de uso, higiene e conservação,
            responsabilizando-se pela guarda e devolução nos mesmos termos, salvo desgaste natural pelo uso adequado.
          </Text>
        </View>

        {/* Clauses two columns */}
        <View style={styles.twoCol}>
          <View style={styles.colHalf}>
            <Clause num="4" title="USO DO OBJETO">
              <Text style={styles.clauseText}>
                O LOCATÁRIO utilizará os itens locados exclusivamente para uso pessoal/familiar, sendo vedado
                sublocar, emprestar a terceiros ou utilizar para fins comerciais, sem autorização prévia e por
                escrito do LOCADOR.
              </Text>
            </Clause>
            <Clause num="5" title="VALOR E FORMA DE PAGAMENTO">
              <Text style={styles.clauseText}>
                Pelo período de locação, o LOCATÁRIO pagará ao LOCADOR o valor total de:
              </Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>R$ {money(reservation.valor_total)}</Text>
              </View>
              <Text style={styles.clauseText}>
                Pagamento integral (100%) no ato da assinatura, mediante PIX, cartão de débito, cartão de crédito
                ou dinheiro, conforme acordado entre as partes.
              </Text>
            </Clause>
            <Clause num="6" title="PRAZO DA LOCAÇÃO">
              <Text style={styles.clauseText}>
                Início: {toBR(reservation.retirada_data)} às {formatTime(reservation.retirada_hora)}.{'\n'}
                Término: {toBR(reservation.devolucao_data)} às {formatTime(reservation.devolucao_hora)}.
              </Text>
            </Clause>
            <Clause num="7" title="ENTREGA E RETIRADA">
              <Text style={styles.clauseText}>
                A entrega e a devolução dos itens serão realizadas no endereço do LOCADOR ou conforme combinado
                entre as partes. O LOCATÁRIO deverá comparecer nos horários acordados para retirada e devolução.
              </Text>
            </Clause>
            <Clause num="8" title="RESPONSABILIDADES DO LOCATÁRIO">
              <Text style={styles.clauseText}>
                • Zelar pelos itens locados, utilizando-os conforme manual do fabricante;{'\n'}
                • Manter os itens sob sua guarda e responsabilidade durante todo o período;{'\n'}
                • Não realizar modificações, reparos ou adaptações nos produtos;{'\n'}
                • Devolver os itens limpos e em condições equivalentes à retirada.
              </Text>
            </Clause>
            <Clause num="9" title="DANOS, PERDAS E EXTRAVIOS">
              <Text style={styles.clauseText}>
                Em caso de dano, perda, extravio ou furto, o LOCATÁRIO será responsável pelo ressarcimento integral
                do valor de mercado do item ou pelo custo de reparo, conforme avaliação do LOCADOR.
              </Text>
            </Clause>
          </View>

          <View style={styles.colHalf}>
            <Clause num="11" title="RESCISÃO CONTRATUAL">
              <Text style={styles.clauseText}>
                O descumprimento de qualquer cláusula deste contrato autoriza a rescisão imediata, com devolução
                dos itens e cobrança de eventuais valores pendentes ou indenizações cabíveis.
              </Text>
            </Clause>
            <Clause num="12" title="CANCELAMENTO">
              <Text style={styles.clauseText}>
                Cancelamentos deverão ser comunicados com antecedência mínima de 48 (quarenta e oito) horas.
                Cancelamentos fora desse prazo poderão estar sujeitos a cobrança conforme política do LOCADOR.
              </Text>
            </Clause>
            <Clause num="13" title="ALTERAÇÕES E ADITIVOS">
              <Text style={styles.clauseText}>
                Qualquer alteração neste contrato somente terá validade se formalizada por escrito e assinada
                por ambas as partes.
              </Text>
            </Clause>
            <Clause num="14" title="PROTEÇÃO DE DADOS (LGPD)">
              <Text style={styles.clauseText}>
                O LOCATÁRIO autoriza o tratamento de seus dados pessoais pelo LOCADOR exclusivamente para fins
                de execução deste contrato, em conformidade com a Lei nº 13.709/2018 (LGPD).
              </Text>
            </Clause>
            <Clause num="15" title="DISPOSIÇÕES GERAIS">
              <Text style={styles.clauseText}>
                Este contrato não gera vínculo empregatício, sociedade ou representação entre as partes. Os itens
                permanecem de propriedade exclusiva do LOCADOR. A tolerância quanto ao descumprimento de cláusulas
                não implica renúncia de direitos.
              </Text>
            </Clause>
            <Clause num="16" title="FORO">
              <Text style={styles.clauseText}>
                Fica eleito o foro da comarca de {LOCADOR.foro} para dirimir quaisquer dúvidas ou litígios
                decorrentes deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.
              </Text>
            </Clause>
            <View style={styles.borderBox}>
              <Text style={styles.sectionTitle}>17. OBSERVAÇÕES IMPORTANTES</Text>
              <Text style={styles.bullet}>• Brinquedos elétricos exigem supervisão adulta constante.</Text>
              <Text style={styles.bullet}>• Não utilizar itens locados em vias públicas ou ambientes de risco.</Text>
              <Text style={styles.bullet}>• Manter manuais, acessórios e embalagens originais quando aplicável.</Text>
              <Text style={styles.bullet}>• Em caso de dúvidas, contate o LOCADOR antes do uso.</Text>
              {clientData.observacoes ? (
                <Text style={[styles.bullet, { marginTop: 2, fontWeight: 'bold' }]}>
                  Obs.: {clientData.observacoes}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.twoCol}>
          <View style={[styles.colHalf, styles.footerBox]}>
            <Text style={{ fontSize: 5.5, fontWeight: 'bold', color: C.pink, marginBottom: 2 }}>
              ♥ DECLARAÇÃO DE ACEITE
            </Text>
            <Text style={{ fontSize: 5.2, lineHeight: 1.35, color: C.muted, textAlign: 'justify' }}>
              AO ASSINAR ESTE CONTRATO, O LOCATÁRIO DECLARA TER LIDO, COMPREENDIDO E ACEITADO TODAS AS CLÁUSULAS
              AQUI ESTABELECIDAS.
            </Text>
          </View>
          <View style={[styles.colHalf, { justifyContent: 'flex-end', paddingTop: 8 }]}>
            <Text style={{ fontSize: 5.5, textAlign: 'right', marginBottom: 6 }}>
              {LOCADOR.foro}, {date.day} de {date.month} de {date.year}
            </Text>
          </View>
        </View>

        <View style={[styles.twoCol, { marginTop: 2 }]}>
          <View style={styles.colHalf}>
            <Text style={{ fontSize: 5, textAlign: 'center', marginBottom: 14 }}>X</Text>
            <Text style={styles.signatureLine}>
              LOCADOR{'\n'}{LOCADOR.razaoSocial}
            </Text>
          </View>
          <View style={styles.colHalf}>
            <Text style={{ fontSize: 5, textAlign: 'center', marginBottom: 14 }}>X</Text>
            <Text style={styles.signatureLine}>
              LOCATÁRIO{'\n'}{clientData.nome}{'\n'}CPF: {clientData.cpf}
            </Text>
          </View>
        </View>

        {enderecoCompleto ? (
          <Text style={{ fontSize: 4.8, color: '#999', textAlign: 'center', marginTop: 3 }}>
            Endereço do locatário: {enderecoCompleto} — CEP: {clientData.cep}
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}

export const ContractPdf = ContractPdfDocument;
