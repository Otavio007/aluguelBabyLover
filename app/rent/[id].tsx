import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar as CalendarIcon, Clock, Info, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react-native';
import { useProduct } from '@/hooks/useProducts';
import { useBookedDates } from '@/hooks/useReservations';
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
  generateTimeSlots,
} from '@/utils/schedulingHelper';
import { BRAND } from '@/constants/brand';

// Inclusive day count: pickup day + all days until return day (both ends counted)
function calcDays(start: string, end: string): number {
  try {
    const d1 = new Date(start + 'T12:00:00');
    const d2 = new Date(end + 'T12:00:00');
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  } catch {
    return 1;
  }
}

export default function RentScheduling() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product } = useProduct(id!);
  const { bookedDatesSet } = useBookedDates(id!);

  const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 8), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('18:00');

  // 'start' = user must pick start, 'end' = user must pick end
  const [rangeStep, setRangeStep] = useState<'start' | 'end'>('start');
  const [activePicker, setActivePicker] = useState<'period' | 'start-time' | 'end-time' | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const calculatedDays = calcDays(startDate, endDate);
  const totalEstimado = product ? product.valor * calculatedDays : 0;

  const handleContinue = () => {
    router.push({
      pathname: `/contract/[id]`,
      params: { id: id!, startDate, startTime, endDate, endTime },
    });
  };

  const changeMonth = (val: number) => {
    const d = new Date(calendarDate);
    d.setMonth(d.getMonth() + val);
    setCalendarDate(d);
  };

  const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const renderRangeCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startD = new Date(startDate + 'T12:00:00');
    const endD = new Date(endDate + 'T12:00:00');

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`e-${i}`} className="w-[14.28%] aspect-square" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellD = new Date(dateStr + 'T12:00:00');

      const isBooked = bookedDatesSet.has(dateStr);

      // For end step: cap selectable end before the first booked date after startDate
      const firstBookedAfterStart = rangeStep === 'end'
        ? [...bookedDatesSet].filter(d => d > startDate).sort()[0]
        : undefined;

      let isDisabled = false;
      if (rangeStep === 'start') {
        isDisabled = cellD < tomorrow || isBooked;
      } else {
        const minReturn = new Date(startDate + 'T12:00:00');
        minReturn.setDate(minReturn.getDate() + 2);
        isDisabled =
          cellD < minReturn ||
          !isValidReturnDate(product, dateStr) ||
          isBooked ||
          (firstBookedAfterStart !== undefined && dateStr >= firstBookedAfterStart);
      }

      const isStart = dateStr === startDate;
      const isEnd = dateStr === endDate;
      const isInRange = cellD > startD && cellD < endD;

      cells.push(
        <TouchableOpacity
          key={`d-${day}`}
          disabled={isDisabled}
          onPress={() => {
            if (rangeStep === 'start') {
              setStartDate(dateStr);
              // Auto-suggest end = start + 7 days, adjusted to valid return day and not booked
              const ret = new Date(dateStr + 'T12:00:00');
              ret.setDate(ret.getDate() + 7);
              let retStr = format(ret, 'yyyy-MM-dd');
              let attempts = 0;
              while (
                attempts < 14 &&
                (!isValidReturnDate(product, retStr) || bookedDatesSet.has(retStr))
              ) {
                ret.setDate(ret.getDate() + 1);
                retStr = format(ret, 'yyyy-MM-dd');
                attempts++;
              }
              setEndDate(retStr);
              setRangeStep('end');
            } else {
              setEndDate(dateStr);
              setActivePicker(null);
              setRangeStep('start');
            }
          }}
          className={`w-[14.28%] aspect-square items-center justify-center ${
            isInRange ? 'bg-primary-100' : ''
          }`}
        >
          <View
            className={`w-9 h-9 rounded-full items-center justify-center ${
              isStart || isEnd ? 'bg-primary-600' : isBooked ? 'bg-red-100' : ''
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isStart || isEnd
                  ? 'text-white font-bold'
                  : isInRange
                  ? 'text-primary-700 font-semibold'
                  : isBooked
                  ? 'text-red-300 line-through'
                  : isDisabled
                  ? 'text-slate-300 line-through'
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
        {/* Step tabs */}
        <View className="flex-row bg-slate-100 rounded-xl p-1 mb-4">
          <View
            className={`flex-1 py-2 rounded-lg items-center ${
              rangeStep === 'start' ? 'bg-primary-600' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${rangeStep === 'start' ? 'text-white' : 'text-slate-400'}`}>
              Retirada
            </Text>
            <Text className={`text-xs ${rangeStep === 'start' ? 'text-primary-200' : 'text-slate-500'}`}>
              {formatDateToBR(startDate)}
            </Text>
          </View>
          <View
            className={`flex-1 py-2 rounded-lg items-center ${
              rangeStep === 'end' ? 'bg-primary-600' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${rangeStep === 'end' ? 'text-white' : 'text-slate-400'}`}>
              Devolução
            </Text>
            <Text className={`text-xs ${rangeStep === 'end' ? 'text-primary-200' : 'text-slate-500'}`}>
              {formatDateToBR(endDate)}
            </Text>
          </View>
        </View>

        <Text className="text-center text-xs text-slate-400 mb-5">
          {rangeStep === 'start' ? '👆 Toque na data de retirada' : '👆 Toque na data de devolução'}
        </Text>

        {/* Month nav */}
        <View className="flex-row justify-between items-center mb-5">
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

        {/* Weekday headers */}
        <View className="flex-row mb-2">
          {WEEKDAYS.map((wd, i) => (
            <Text key={i} className="flex-1 text-center text-xs font-bold text-slate-400">
              {wd}
            </Text>
          ))}
        </View>

        <View>{rows}</View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const isStart = activePicker === 'start-time';
    const slots = generateTimeSlots(getProductEntregaHoraInicio(product), getProductEntregaHoraFim(product));
    const selected = isStart ? startTime : endTime;

    return (
      <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-2 pb-4">
          {slots.map((slot) => {
            const isSel = selected === slot;
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => {
                  if (isStart) setStartTime(slot);
                  else setEndTime(slot);
                  setActivePicker(null);
                }}
                className={`w-[30%] px-3 py-2.5 rounded-xl border items-center ${
                  isSel ? 'bg-primary-600 border-primary-600' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-600'}`}>
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const modalTitle = () => {
    if (activePicker === 'period')
      return rangeStep === 'start' ? 'Selecione a data de retirada' : 'Selecione a data de devolução';
    if (activePicker === 'start-time') return 'Horário de Retirada';
    if (activePicker === 'end-time') return 'Horário de Devolução';
    return '';
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
            Período mínimo de <Text className="font-bold">3 dias</Text>. Devoluções permitidas em:{' '}
            <Text className="font-bold">{getProductDevolucaoDias(product).join(', ')}</Text>.
          </Text>
        </View>

        {/* Single period field */}
        <TouchableOpacity
          onPress={() => {
            setRangeStep('start');
            setCalendarDate(new Date(startDate + 'T12:00:00'));
            setActivePicker('period');
          }}
          activeOpacity={0.8}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4"
        >
          <View className="flex-row items-center mb-4">
            <CalendarIcon size={15} color={BRAND.primary} />
            <Text className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Período de Locação
            </Text>
            <View className="ml-auto bg-primary-600 px-2.5 py-1 rounded-lg">
              <Text className="text-white text-[10px] font-bold">Alterar</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {/* Retirada: data + hora */}
            <View className="flex-1">
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Retirada
              </Text>
              <Text className="text-slate-900 font-bold text-base">{formatDateToBR(startDate)}</Text>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); setActivePicker('start-time'); }}
                className="flex-row items-center mt-1"
              >
                <Clock size={11} color={BRAND.primary} />
                <Text className="ml-1 text-primary-600 font-bold text-sm">{startTime}</Text>
              </TouchableOpacity>
            </View>

            <View className="px-3">
              <ArrowRight size={20} color={BRAND.primaryMuted} />
            </View>

            {/* Devolução: data + hora */}
            <View className="flex-1 items-end">
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Devolução
              </Text>
              <Text className="text-slate-900 font-bold text-base">{formatDateToBR(endDate)}</Text>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); setActivePicker('end-time'); }}
                className="flex-row items-center mt-1"
              >
                <Clock size={11} color={BRAND.primary} />
                <Text className="ml-1 text-primary-600 font-bold text-sm">{endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4 bg-primary-100 rounded-xl py-2 items-center">
            <Text className="text-primary-700 text-sm font-bold">
              {calculatedDays} {calculatedDays === 1 ? 'dia' : 'dias'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Summary */}
        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <Text className="text-sm font-bold text-slate-900 mb-4">Resumo do período</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500">
              Valor {product?.tipo_cobranca === 'dia' ? 'por dia' : `por ${product?.tipo_cobranca}`}
            </Text>
            <Text className="text-slate-900 font-medium">
              R$ {product?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-500">Total de dias</Text>
            <Text className="text-slate-900 font-medium">
              {calculatedDays} {calculatedDays === 1 ? 'dia' : 'dias'}
            </Text>
          </View>
          <View className="h-px bg-slate-200 w-full mb-4" />
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-slate-900">Total estimado</Text>
            <Text className="text-xl font-bold text-primary-600">
              R$ {totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      <View className="px-6 py-6 border-t border-slate-100 bg-white">
        <Button label="Continuar" onPress={handleContinue} className="h-14" />
      </View>

      <Modal
        isOpen={activePicker !== null}
        onClose={() => {
          setActivePicker(null);
          setRangeStep('start');
        }}
        title={modalTitle()}
      >
        {activePicker === 'period' ? renderRangeCalendar() : renderTimePicker()}
      </Modal>
    </View>
  );
}
