import { Linking, Platform } from 'react-native';
import { buildContractPrintHtml, ContractPrintData } from './buildContractPrintHtml';
import { downloadPdfBlob } from './downloadPdf';

export function printContractHtml(data: ContractPrintData): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('Impressão HTML disponível apenas na web.');
  }

  const html = buildContractPrintHtml(data);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Permita pop-ups neste site para imprimir o contrato.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

export function printContractPdfUrl(url: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const win = window.open(url, '_blank');
    if (!win) {
      window.location.assign(url);
      return;
    }
    const tryPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        // PDF externo pode bloquear print automático
      }
    };
    win.addEventListener('load', tryPrint);
    setTimeout(tryPrint, 1500);
    return;
  }

  Linking.openURL(url);
}

export function printOrDownloadPdfBlob(blob: Blob, fileName: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 2000);
      }
    };
    return;
  }

  downloadPdfBlob(blob, fileName);
}

export async function printCompletedContract(options: {
  data: ContractPrintData;
  pdfUrl?: string | null;
  pdfBlob?: Blob | null;
  fileName?: string;
  generatePdf?: () => Promise<Blob | null>;
}): Promise<void> {
  const fileName = options.fileName ?? `contrato-${options.data.orderNumber ?? 'aluguel'}.pdf`;

  if (options.pdfUrl) {
    printContractPdfUrl(options.pdfUrl);
    return;
  }

  if (options.pdfBlob) {
    printOrDownloadPdfBlob(options.pdfBlob, fileName);
    return;
  }

  if (options.generatePdf) {
    const blob = await options.generatePdf();
    if (blob) {
      printOrDownloadPdfBlob(blob, fileName);
      return;
    }
  }

  printContractHtml(options.data);
}
