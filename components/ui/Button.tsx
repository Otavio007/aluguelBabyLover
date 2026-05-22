import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cn } from '@/utils/cn';

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
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    outline: 'bg-transparent border border-primary-600',
    ghost: 'bg-transparent',
    danger: 'bg-red-600',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-600',
    ghost: 'text-primary-600',
    danger: 'text-white',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      className={cn(
        'flex-row items-center justify-center rounded-xl px-6 py-3',
        variants[variant],
        (disabled || isLoading) && 'opacity-50',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0284c7' : '#ffffff'} />
      ) : (
        <Text className={cn('text-base font-semibold text-center', textVariants[variant], labelClassName)}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
