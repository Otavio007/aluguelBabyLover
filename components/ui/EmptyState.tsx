import React from 'react';
import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

export const EmptyState = ({ title, message, buttonLabel, onButtonPress }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center py-20 px-10">
    <View className="bg-slate-50 p-6 rounded-full mb-6">
      <Inbox size={48} color="#94a3b8" />
    </View>
    <Text className="text-xl font-bold text-slate-900 mb-2 text-center">{title}</Text>
    <Text className="text-slate-500 text-center mb-8">{message}</Text>
    {buttonLabel && onButtonPress && (
      <Button label={buttonLabel} onPress={onButtonPress} />
    )}
  </View>
);
