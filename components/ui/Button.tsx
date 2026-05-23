import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cn } from '@/utils/cn';
import { BRAND } from '@/constants/brand';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  className?: string;
  labelClassName?: string;
}

export const Button = ({
  label,
  variant = 'primary',
  isLoading = false,
  className,
  labelClassName,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-primary-500 shadow-soft',
    secondary: 'bg-secondary-700',
    outline: 'bg-white border-2 border-primary-400',
    ghost: 'bg-primary-50',
    danger: 'bg-red-500',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-700',
    ghost: 'text-primary-700',
    danger: 'text-white',
  };

  const spinnerColor =
    variant === 'outline' || variant === 'ghost' ? BRAND.primary : '#ffffff';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || isLoading}
      className={cn(
        'flex-row items-center justify-center rounded-2xl px-6 py-3.5',
        variants[variant],
        (disabled || isLoading) && 'opacity-50',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text className={cn('text-base font-bold text-center', textVariants[variant], labelClassName)}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
