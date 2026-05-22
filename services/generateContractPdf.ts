import { Product, Reservation, ContractClientData } from '@/types';

export interface GenerateContractPdfParams {
  clientData: ContractClientData;
  reservation: Reservation;
  product: Product;
  documentoUrl?: string;
}

export async function generateContractPdf(
  _params: GenerateContractPdfParams
): Promise<Blob | null> {
  return null;
}
