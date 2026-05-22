import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export const Loading = ({ message }: { message?: string }) => (
  <View className="flex-1 items-center justify-center bg-white/80 absolute inset-0 z-50">
    <View className="bg-white p-8 rounded-3xl shadow-xl items-center">
      <ActivityIndicator size="large" color="#0284c7" />
      {message && <Text className="mt-4 text-slate-600 font-medium">{message}</Text>}
    </View>
  </View>
);
