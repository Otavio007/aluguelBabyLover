import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface ScreenBackButtonProps {
  /** Rota de fallback quando não há histórico (comum na web) */
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function ScreenBackButton({
  fallbackHref = '/',
  label,
  className = 'mb-4',
}: ScreenBackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push(fallbackHref as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`flex-row items-center self-start ${className}`}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Voltar'}
    >
      <ChevronLeft size={22} color="#0f172a" />
      {label ? <Text className="ml-1 text-sm font-semibold text-slate-700">{label}</Text> : null}
    </TouchableOpacity>
  );
}
