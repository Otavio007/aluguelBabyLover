import React from 'react';
import { View, Text } from 'react-native';
import { Control, Controller, FieldErrors, FieldValues, Path, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { formatCep } from '@/utils/cepHelper';
import { useCepLookup, AddressFieldNames } from '@/hooks/useCepLookup';

interface AddressFieldsProps<T extends FieldValues> {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  fieldNames?: AddressFieldNames & { cep: string };
}

const DEFAULT_FIELD_NAMES = {
  endereco: 'endereco',
  cidade: 'cidade',
  estado: 'estado',
  cep: 'cep',
} as const;

export function AddressFields<T extends FieldValues>({
  control,
  errors,
  setValue,
  fieldNames = DEFAULT_FIELD_NAMES,
}: AddressFieldsProps<T>) {
  const names = { ...DEFAULT_FIELD_NAMES, ...fieldNames };
  const { lookupCep, isLoadingCep, resetCepCache } = useCepLookup(setValue, {
    endereco: names.endereco,
    cidade: names.cidade,
    estado: names.estado,
  });

  return (
    <>
      <Controller
        control={control}
        name={names.cep as Path<T>}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="CEP"
            value={value ?? ''}
            onChangeText={(val) => {
              onChange(formatCep(val));
              resetCepCache();
            }}
            onBlur={() => {
              onBlur();
              if (value) lookupCep(value);
            }}
            error={(errors[names.cep as keyof T] as { message?: string } | undefined)?.message}
            containerClassName="w-40"
            keyboardType="numeric"
            maxLength={9}
            placeholder="00000-000"
          />
        )}
      />

      {isLoadingCep && (
        <Text className="text-xs text-primary-600 -mt-2 mb-2">Buscando endereço...</Text>
      )}

      <Controller
        control={control}
        name={names.endereco as Path<T>}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Endereço"
            value={value ?? ''}
            onChangeText={onChange}
            error={(errors[names.endereco as keyof T] as { message?: string } | undefined)?.message}
          />
        )}
      />

      <View className="flex-row space-x-4">
        <Controller
          control={control}
          name={names.cidade as Path<T>}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Cidade"
              value={value ?? ''}
              onChangeText={onChange}
              error={(errors[names.cidade as keyof T] as { message?: string } | undefined)?.message}
              containerClassName="flex-1"
            />
          )}
        />
        <Controller
          control={control}
          name={names.estado as Path<T>}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Estado"
              value={value ?? ''}
              onChangeText={onChange}
              error={(errors[names.estado as keyof T] as { message?: string } | undefined)?.message}
              containerClassName="w-24"
            />
          )}
        />
      </View>
    </>
  );
}
