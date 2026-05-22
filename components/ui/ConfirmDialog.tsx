import React from 'react';
import { View, Text } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <Text className="text-slate-600 mb-8">{message}</Text>
      <View className="flex-row space-x-3">
        <Button 
          label={cancelLabel} 
          variant="outline" 
          onPress={onClose} 
          className="flex-1" 
          disabled={isLoading}
        />
        <Button 
          label={confirmLabel} 
          onPress={onConfirm} 
          className="flex-1" 
          isLoading={isLoading}
        />
      </View>
    </Modal>
  );
};
