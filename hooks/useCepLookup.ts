import { useCallback, useRef, useState } from 'react';
import { UseFormSetValue, Path, FieldValues } from 'react-hook-form';
import { fetchAddressByCep } from '@/utils/cepHelper';

export interface AddressFieldNames {
  endereco: string;
  cidade: string;
  estado: string;
}

const DEFAULT_FIELDS: AddressFieldNames = {
  endereco: 'endereco',
  cidade: 'cidade',
  estado: 'estado',
};

export function useCepLookup<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  fieldNames: AddressFieldNames = DEFAULT_FIELDS
) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const lastFetchedCep = useRef('');

  const lookupCep = useCallback(
    async (cep: string) => {
      const clean = cep.replace(/\D/g, '');
      if (clean.length !== 8 || clean === lastFetchedCep.current) return;

      setIsLoadingCep(true);
      try {
        const address = await fetchAddressByCep(clean);
        if (!address) return;

        lastFetchedCep.current = clean;

        if (address.endereco) {
          setValue(fieldNames.endereco as Path<T>, address.endereco as T[Path<T>], {
            shouldValidate: true,
          });
        }
        if (address.cidade) {
          setValue(fieldNames.cidade as Path<T>, address.cidade as T[Path<T>], {
            shouldValidate: true,
          });
        }
        if (address.estado) {
          setValue(fieldNames.estado as Path<T>, address.estado as T[Path<T>], {
            shouldValidate: true,
          });
        }
      } finally {
        setIsLoadingCep(false);
      }
    },
    [setValue, fieldNames]
  );

  const resetCepCache = useCallback(() => {
    lastFetchedCep.current = '';
  }, []);

  return { lookupCep, isLoadingCep, resetCepCache };
}
