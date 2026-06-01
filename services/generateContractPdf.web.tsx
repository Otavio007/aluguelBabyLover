import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ContractPdfDocument } from './ContractPdfDocument';
import { GenerateContractPdfParams } from './generateContractPdf';

export async function generateContractPdf(
  params: GenerateContractPdfParams
): Promise<Blob | null> {
  try {
    const blob = await pdf(
      <ContractPdfDocument
        clientData={params.clientData}
        reservation={params.reservation}
        product={params.product}
        documentoUrl={params.documentoUrl}
      />
    ).toBlob();
    return blob;
  } catch (err) {
    console.error('Erro ao gerar PDF (web):', err);
    return null;
  }
}
