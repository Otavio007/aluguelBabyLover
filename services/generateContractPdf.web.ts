import { GenerateContractPdfParams } from './generateContractPdf';

/** PDF via @react-pdf não é compatível com Expo Web — aluguel segue sem arquivo PDF. */
export async function generateContractPdf(
  _params: GenerateContractPdfParams
): Promise<Blob | null> {
  return null;
}
