import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { cn } from '@/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
}

export const Input = ({
  label,
  error,
  containerClassName,
  className,
  ...props
}: InputProps) => {
  return (
    <View className={cn('w-full mb-4', containerClassName)}>
      {label && (
        <Text className="mb-1.5 text-sm font-semibold" style={{ color: '#334155' }}>
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          'w-full px-4 py-3.5 rounded-2xl border bg-white text-slate-900',
          error ? 'border-red-400' : 'border-primary-100',
          className
        )}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};
