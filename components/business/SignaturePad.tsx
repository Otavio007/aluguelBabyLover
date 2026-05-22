import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { cn } from '@/utils/cn';

interface SignaturePadProps {
  onOK: (signature: string) => void;
  onEmpty?: () => void;
  onClear?: () => void;
  description?: string;
  className?: string;
}

export const SignaturePad = ({ onOK, onEmpty, onClear, description, className }: SignaturePadProps) => {
  const ref = useRef<SignatureViewRef>(null);

  const handleClear = () => {
    ref.current?.clearSignature();
    if (onClear) onClear();
  };

  const handleConfirm = () => {
    ref.current?.readSignature();
  };

  return (
    <View className={cn('w-full h-80 border border-slate-200 rounded-2xl overflow-hidden bg-white', className)}>
      <SignatureScreen
        ref={ref}
        onOK={onOK}
        onEmpty={onEmpty}
        descriptionText={description || 'Assine aqui'}
        clearText="Limpar"
        confirmText="Confirmar"
        webStyle={`
          .m-signature-pad { box-shadow: none; border: none; }
          .m-signature-pad--body { border: none; }
          .m-signature-pad--footer { display: none; }
          body,html { height: 100%; }
        `}
      />
      <View className="flex-row border-t border-slate-100 p-2 space-x-2">
        <TouchableOpacity 
          onPress={handleClear}
          className="flex-1 py-3 items-center justify-center bg-slate-50 rounded-xl"
        >
          <Text className="text-slate-600 font-medium">Limpar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleConfirm}
          className="flex-1 py-3 items-center justify-center bg-primary-600 rounded-xl"
        >
          <Text className="text-white font-medium">Salvar Assinatura</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
