import { GenerateContractPdfParams } from './generateContractPdf';

/** PDF não é gerado no web (@react-pdf quebra o bundle); apenas no app nativo. */
export async function generateContractPdf(
  _params: GenerateContractPdfParams
): Promise<Blob | null> {
  return null;
}
