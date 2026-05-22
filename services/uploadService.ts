import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export const uploadService = {
  async uploadSignature(reservationId: string, base64Image: string) {
    // base64Image comes as "data:image/png;base64,..."
    const base64 = base64Image.split(',')[1];
    const fileName = `${reservationId}/signature.png`;

    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, decode(base64), {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('signatures')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  },

  async uploadContractPdf(reservationId: string, pdfBlob: Blob) {
    const fileName = `${reservationId}/contract.pdf`;

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }
};
