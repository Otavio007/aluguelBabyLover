import * as z from 'zod';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export const contractFormSchema = z.object({
  nome: z.string().trim().min(3, 'Nome completo é obrigatório (mín. 3 letras)'),
  cpf: z
    .string()
    .trim()
    .min(1, 'CPF é obrigatório')
    .refine((v) => onlyDigits(v).length >= 11, 'CPF inválido (informe 11 dígitos)'),
  endereco: z.string().trim().min(5, 'Endereço é obrigatório'),
  cidade: z.string().trim().min(2, 'Cidade é obrigatória'),
  estado: z.string().trim().min(2, 'Estado é obrigatório (ex: SP)'),
  cep: z
    .string()
    .trim()
    .min(1, 'CEP é obrigatório')
    .refine((v) => onlyDigits(v).length === 8, 'CEP inválido (8 dígitos)'),
  telefone: z
    .string()
    .trim()
    .min(1, 'Telefone é obrigatório')
    .refine((v) => onlyDigits(v).length >= 10, 'Telefone inválido (mín. 10 dígitos)'),
  email: z.string().trim().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  observacoes: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractFormSchema>;

export function getFormErrorMessages(errors: Record<string, { message?: string } | undefined>): string[] {
  return Object.values(errors)
    .map((e) => e?.message)
    .filter((msg): msg is string => Boolean(msg));
}
