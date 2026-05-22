import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ContractPdf } from './ContractPdf.native';
import { GenerateContractPdfParams } from './generateContractPdf';

export async function generateContractPdf(
  params: GenerateContractPdfParams
): Promise<Blob | null> {
  const blob = await pdf(
    <ContractPdf
      clientData={params.clientData}
      reservation={params.reservation}
      product={params.product}
      documentoUrl={params.documentoUrl}
    />
  ).toBlob();

  return blob;
}
