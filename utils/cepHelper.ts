export interface AddressFromCep {
  endereco: string;
  cidade: string;
  estado: string;
}

export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '');
}

export function formatCep(value: string): string {
  const cleaned = cleanCep(value);
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 8)}`;
}

export async function fetchAddressByCep(cep: string): Promise<AddressFromCep | null> {
  const clean = cleanCep(cep);
  if (clean.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await response.json();

    if (data.erro) return null;

    let endereco = '';
    if (data.logradouro) {
      endereco = data.bairro ? `${data.logradouro} - ${data.bairro}` : data.logradouro;
    } else if (data.bairro) {
      endereco = data.bairro;
    }

    return {
      endereco,
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
