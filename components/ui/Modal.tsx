import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ModalProps as RNModalProps } from 'react-native';
import { X } from 'lucide-react-native';
import { cn } from '@/utils/cn';

interface ModalProps extends RNModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  ...props
}: ModalProps) => {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className={cn('bg-white w-full max-w-lg rounded-3xl overflow-hidden', className)}>
          {title && (
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-900">{title}</Text>
              <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}
          <View className="p-6">
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
};
