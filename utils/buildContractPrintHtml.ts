import { ContractClientData, Product, Reservation } from '@/types';
import { LOCADOR } from '@/services/contractPdfConstants';

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
  if (!time) return '';
  return String(time).slice(0, 5);
}

function money(value: number): string {
  return Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function todayBR(): string {
  const now = new Date();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${String(now.getDate()).padStart(2, '0')} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

function esc(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ContractPrintData {
  clientData: ContractClientData;
  reservation: Reservation;
  product: Product;
  orderNumber?: string;
}

export function buildContractPrintHtml(data: ContractPrintData): string {
  const { clientData, reservation, product, orderNumber } = data;
  const qty = reservation.quantidade ?? 1;
  const retirada = toBR(reservation.retirada_data);
  const devolucao = toBR(reservation.devolucao_data);
  const hRet = formatTime(reservation.retirada_hora);
  const hDev = formatTime(reservation.devolucao_hora);
  const periodo =
    hRet && hDev
      ? `${retirada} às ${hRet} até ${devolucao} às ${hDev}`
      : `${retirada} até ${devolucao}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Contrato de Locação${orderNumber ? ` #${esc(orderNumber)}` : ''}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 0; padding: 16px; font-size: 11px; line-height: 1.45; }
    h1 { color: #E91E8C; font-size: 16px; text-align: center; margin: 0 0 8px; }
    .subtitle { text-align: center; color: #555; margin-bottom: 16px; font-size: 10px; }
    .box { border: 1px solid #E91E8C; border-radius: 6px; padding: 10px; margin-bottom: 10px; }
    .title { color: #E91E8C; font-weight: bold; font-size: 11px; margin-bottom: 6px; }
    .row { margin-bottom: 4px; }
    .label { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    th { background: #FFF176; }
    .valor { text-align: center; background: #FCE4EC; border: 1px solid #E91E8C; padding: 10px; font-size: 18px; font-weight: bold; color: #E91E8C; margin: 8px 0; }
    .clause { margin-bottom: 8px; font-size: 10px; color: #444; text-align: justify; }
    .clause h3 { color: #E91E8C; font-size: 10px; margin: 0 0 4px; }
    .signatures { display: flex; gap: 24px; margin-top: 32px; }
    .sign { flex: 1; border-top: 1px solid #999; padding-top: 8px; text-align: center; font-size: 10px; }
    @media print {
      body { padding: 8px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:12px;">
    <button onclick="window.print()" style="padding:10px 20px;background:#E91E8C;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">
      Imprimir
    </button>
  </div>

  <h1>CONTRATO DE LOCAÇÃO DE BRINQUEDOS E ARTIGOS INFANTIS</h1>
  <p class="subtitle">Este contrato regula a locação entre as partes abaixo qualificadas.${orderNumber ? ` Pedido #${esc(orderNumber)}.` : ''}</p>

  <div style="display:flex;gap:10px;flex-wrap:wrap;">
    <div class="box" style="flex:1;min-width:260px;">
      <div class="title">1. LOCADOR</div>
      <div class="row"><span class="label">Nome/Razão Social:</span> ${esc(LOCADOR.razaoSocial)}</div>
      <div class="row"><span class="label">CNPJ:</span> ${esc(LOCADOR.cnpj)}</div>
      <div class="row"><span class="label">Endereço:</span> ${esc(LOCADOR.endereco)}</div>
      <div class="row"><span class="label">Cidade/UF:</span> ${esc(LOCADOR.cidadeUfCep)}</div>
      <div class="row"><span class="label">Telefone:</span> ${esc(LOCADOR.telefone)}</div>
      <div class="row"><span class="label">E-mail:</span> ${esc(LOCADOR.email)}</div>
    </div>
    <div class="box" style="flex:1;min-width:260px;">
      <div class="title">2. LOCATÁRIO</div>
      <div class="row"><span class="label">Nome:</span> ${esc(clientData.nome)}</div>
      <div class="row"><span class="label">CPF:</span> ${esc(clientData.cpf)}</div>
      <div class="row"><span class="label">Endereço:</span> ${esc(clientData.endereco)}</div>
      <div class="row"><span class="label">Cidade/UF:</span> ${esc(clientData.cidade)} - ${esc(clientData.estado)}</div>
      <div class="row"><span class="label">CEP:</span> ${esc(clientData.cep)}</div>
      <div class="row"><span class="label">Telefone:</span> ${esc(clientData.telefone)}</div>
      <div class="row"><span class="label">E-mail:</span> ${esc(clientData.email)}</div>
    </div>
  </div>

  <div class="box">
    <div class="title">3. OBJETO DA LOCAÇÃO</div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Descrição</th>
          <th>Marca</th>
          <th>Estado</th>
          <th>Qtd</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>${esc(product.nome)}</td>
          <td>${esc(product.marca || '—')}</td>
          <td>${esc(product.estado_conservacao || 'Bom')}</td>
          <td>${qty}</td>
        </tr>
      </tbody>
    </table>
    <p class="clause">O LOCATÁRIO declara ter recebido o item em condições adequadas de uso e higiene, comprometendo-se à devolução nos mesmos termos, salvo desgaste natural.</p>
  </div>

  <div class="valor">Valor total da locação: R$ ${money(reservation.valor_total)}</div>

  <div class="clause">
    <h3>4. Prazo da locação</h3>
    <p>Período: <strong>${esc(periodo)}</strong>.</p>
  </div>

  <div class="clause">
    <h3>5. Pagamento</h3>
    <p>Pagamento conforme combinado entre as partes no ato da locação.</p>
  </div>

  <div class="clause">
    <h3>6. Responsabilidades</h3>
    <p>O LOCATÁRIO é responsável pela guarda, uso adequado e devolução do item. Danos, perdas ou extravios deverão ser ressarcidos conforme avaliação do LOCADOR.</p>
  </div>

  ${clientData.observacoes ? `<div class="clause"><h3>Observações</h3><p>${esc(clientData.observacoes)}</p></div>` : ''}

  <div class="clause">
    <h3>7. Foro</h3>
    <p>Fica eleito o foro de ${esc(LOCADOR.foro)} para dirimir questões deste contrato.</p>
  </div>

  <p style="text-align:right;margin-top:16px;">${esc(LOCADOR.foro)}, ${todayBR()}</p>

  <div class="signatures">
    <div class="sign"><br/><strong>LOCADOR</strong><br/>${esc(LOCADOR.razaoSocial)}</div>
    <div class="sign"><br/><strong>LOCATÁRIO</strong><br/>${esc(clientData.nome)}<br/>CPF: ${esc(clientData.cpf)}</div>
  </div>

  <p style="text-align:center;font-size:9px;color:#888;margin-top:20px;">
    Documento gerado eletronicamente. Autenticado mediante envio de documento com foto.
  </p>
</body>
</html>`;
}
