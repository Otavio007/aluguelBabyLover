import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar as CalendarIcon, Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { format, addDays } from 'date-fns';
import { 
  formatDateToBR, 
  getProductDevolucaoDias, 
  getProductEntregaHoraInicio, 
  getProductEntregaHoraFim, 
  isValidReturnDate, 
  generateTimeSlots 
} from '@/utils/schedulingHelper';
import { BRAND } from '@/constants/brand';

export default function RentScheduling() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product } = useProduct(id!);

  // State in ISO (yyyy-MM-dd) under the hood for DB compatibility
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 8), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('18:00');

  // Picker modal controls
  const [activePicker, setActivePicker] = useState<'start-date' | 'start-time' | 'end-date' | 'end-time' | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handleContinue = () => {
    router.push({
      pathname: `/contract/[id]`,
      params: { id: id!, startDate, startTime, endDate, endTime }
    });
  };

  const getDaysDifference = () => {
    try {
      const d1 = new Date(startDate + 'T12:00:00');
      const d2 = new Date(endDate + 'T12:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays <= 0 ? 3 : diffDays;
    } catch (e) {
      return 7;
    }
  };

  const calculatedDays = getDaysDifference();
  const totalEstimado = product ? product.valor * calculatedDays : 0;

  const changeMonth = (val: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + val);
    setCalendarDate(newDate);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const getModalTitle = () => {
    switch (activePicker) {
      case 'start-date':
        return 'Selecione a Data de Retirada';
      case 'end-date':
        return 'Selecione a Data de Devolução';
      case 'start-time':
        return 'Selecione o Horário de Retirada';
      case 'end-time':
        return 'Selecione o Horário de Devolução';
      default:
        return '';
    }
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];
    
    // Empty spaces for month offset
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
    }
    
    // Days numbers
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isStart = activePicker === 'start-date';
      
      let isDisabled = false;
      const cellDate = new Date(dateStr + 'T12:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isStart) {
        // Must be tomorrow or later
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        isDisabled = cellDate < tomorrow;
      } else {
        // Must be at least 3 days after startDate
        const minReturnDate = new Date(startDate + 'T12:00:00');
        minReturnDate.setDate(minReturnDate.getDate() + 3);
        
        // Also must be within allowed return weekdays
        isDisabled = cellDate < minReturnDate || !isValidReturnDate(product, dateStr);
      }
      
      const currentSelected = isStart ? startDate : endDate;
      const isSelected = currentSelected === dateStr;
      
      cells.push(
        <TouchableOpacity
          key={`day-${day}`}
          disabled={isDisabled}
          onPress={() => {
            if (isStart) {
              setStartDate(dateStr);
              // Set end date to start + 7 days automatically
              const returnDate = new Date(dateStr + 'T12:00:00');
              returnDate.setDate(returnDate.getDate() + 7);
              
              let adjustedStr = format(returnDate, 'yyyy-MM-dd');
              let attempts = 0;
              while (!isValidReturnDate(product, adjustedStr) && attempts < 7) {
                returnDate.setDate(returnDate.getDate() + 1);
                adjustedStr = format(returnDate, 'yyyy-MM-dd');
                attempts++;
              }
              setEndDate(adjustedStr);
            } else {
              setEndDate(dateStr);
            }
            setActivePicker(null);
          }}
          className="w-[14.28%] aspect-square items-center justify-center p-1"
        >
          <View
            className={`w-9 h-9 rounded-full items-center justify-center ${
              isSelected
                ? 'bg-primary-600'
                : isDisabled
                ? 'bg-transparent'
                : 'bg-slate-50 border border-slate-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected
                  ? 'text-white font-bold'
                  : isDisabled
                  ? 'text-slate-200 line-through'
                  : 'text-slate-700'
              }`}
            >
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(
        <View key={`row-${i}`} className="flex-row justify-start w-full">
          {cells.slice(i, i + 7)}
        </View>
      );
    }
    
    return (
      <View>
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2 border border-slate-200 rounded-xl bg-slate-50">
            <ChevronLeft size={16} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} className="p-2 border border-slate-200 rounded-xl bg-slate-50">
            <ChevronRight size={16} color="#0f172a" />
          </TouchableOpacity>
        </View>
        <View className="flex-row mb-3">
          {WEEKDAYS_SHORT.map((wd, i) => (
            <Text key={i} className="flex-1 text-center text-xs font-bold text-slate-400">
              {wd}
            </Text>
          ))}
        </View>
        <View className="space-y-1">{rows}</View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const isStart = activePicker === 'start-time';
    const startLimit = getProductEntregaHoraInicio(product);
    const endLimit = getProductEntregaHoraFim(product);
    const timeSlots = generateTimeSlots(startLimit, endLimit);

    return (
      <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-2 justify-start pb-4">
          {timeSlots.map(slot => {
            const currentSelected = isStart ? startTime : endTime;
            const isSelected = currentSelected === slot;
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => {
                  if (isStart) {
                    setStartTime(slot);
                  } else {
                    setEndTime(slot);
                  }
                  setActivePicker(null);
                }}
                className={`px-3 py-2.5 rounded-xl border items-center justify-center ${
                  isSelected
                    ? 'bg-primary-600 border-primary-600 w-[30%]'
                    : 'bg-slate-50 border-slate-100 w-[30%]'
                }`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Agendamento' }} />
      <Header />
      
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 mb-2">Escolha as datas</Text>
          <Text className="text-slate-500">Selecione o período que deseja utilizar o produto.</Text>
        </View>

        <View className="bg-primary-50 p-4 rounded-2xl mb-6 flex-row items-center">
          <Info size={20} color={BRAND.primary} />
          <Text className="ml-3 text-xs text-primary-700 flex-1 leading-relaxed">
            O período mínimo de locação é de 3 dias. Devoluções permitidas somente em: <Text className="font-bold">{getProductDevolucaoDias(product).join(', ')}</Text>.
          </Text>
        </View>

        <View className="space-y-6">
          {/* Pickup Section */}
          <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <Text className="text-sm font-bold text-slate-800 mb-3 flex-row items-center">
              <CalendarIcon size={16} color={BRAND.primary} className="mr-2" /> Retirada (Entrega)
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setCalendarDate(new Date(startDate + 'T12:00:00'));
                  setActivePicker('start-date');
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white justify-center h-14"
              >
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Data</Text>
                <Text className="text-slate-900 font-bold text-sm">{formatDateToBR(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePicker('start-time')}
                className="w-32 px-4 py-3 rounded-xl border border-slate-200 bg-white justify-center h-14"
              >
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Hora</Text>
                <Text className="text-slate-900 font-bold text-sm">{startTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Return Section */}
          <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
            <Text className="text-sm font-bold text-slate-800 mb-3 flex-row items-center">
              <Clock size={16} color={BRAND.primary} className="mr-2" /> Devolução (Coleta)
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setCalendarDate(new Date(endDate + 'T12:00:00'));
                  setActivePicker('end-date');
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white justify-center h-14"
              >
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Data</Text>
                <Text className="text-slate-900 font-bold text-sm">{formatDateToBR(endDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePicker('end-time')}
                className="w-32 px-4 py-3 rounded-xl border border-slate-200 bg-white justify-center h-14"
              >
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Hora</Text>
                <Text className="text-slate-900 font-bold text-sm">{endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <Text className="text-sm font-bold text-slate-900 mb-4">Resumo do período</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500">Valor diária</Text>
            <Text className="text-slate-900 font-medium">R$ {product?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-500">Total de dias (est.)</Text>
            <Text className="text-slate-900 font-medium">{calculatedDays} {calculatedDays === 1 ? 'dia' : 'dias'}</Text>
          </View>
          <View className="h-px bg-slate-200 w-full mb-4" />
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-slate-900">Total estimado</Text>
            <Text className="text-xl font-bold text-primary-600">
              R$ {totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        
        <View className="h-20" />
      </ScrollView>

      <View className="px-6 py-6 border-t border-slate-100 bg-white">
        <Button 
          label="Continuar para o contrato" 
          onPress={handleContinue}
          className="h-14"
        />
      </View>

      {/* Date/Time Picker Modal wrapper */}
      <Modal
        isOpen={activePicker !== null}
        onClose={() => setActivePicker(null)}
        title={getModalTitle()}
      >
        {activePicker && (activePicker.endsWith('date') ? renderCalendar() : renderTimePicker())}
      </Modal>
    </View>
  );
}
