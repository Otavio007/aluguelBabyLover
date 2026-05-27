import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ContractPdf } from './ContractPdf';
import { GenerateContractPdfParams } from './generateContractPdf';

export async function generateContractPdf(
  params: GenerateContractPdfParams
): Promise<Blob | null> {
  try {
    const blob = await pdf(
      React.createElement(ContractPdf, {
        clientData: params.clientData,
        reservation: params.reservation,
        product: params.product,
        documentoUrl: params.documentoUrl,
      })
    ).toBlob();
    return blob;
  } catch (err) {
    console.error('Erro ao gerar PDF no web:', err);
    return null;
  }
}
