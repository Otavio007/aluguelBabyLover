import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar as CalendarIcon, Clock, Info, ChevronLeft, ChevronRight, ArrowRight, Minus, Plus } from 'lucide-react-native';
import { useProduct } from '@/hooks/useProducts';
import { useBookedDates } from '@/hooks/useReservations';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';
import {
  formatDateToBR,
  getProductDevolucaoDias,
  getProductEntregaHoraInicio,
  getProductEntregaHoraFim,
  isValidReturnDate,
  generateTimeSlots,
  getWeekdayDisplay,
} from '@/utils/schedulingHelper';
import { BRAND } from '@/constants/brand';

function calcDays(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  try {
    const d1 = new Date(start + 'T12:00:00');
    const d2 = new Date(end + 'T12:00:00');
    // Math.floor evita arredondamentos errados; +1 para incluir ambos os dias
    const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  } catch {
    return 0;
  }
}

function showAlert(msg: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(msg);
  }
}

export default function RentScheduling() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product } = useProduct(id!);
  const [selectedQty, setSelectedQty] = useState(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState<string | null>(null);
  const [endTime, setEndTime] = useState('18:00');
  const [rangeStep, setRangeStep] = useState<'start' | 'end'>('start');
  const [activePicker, setActivePicker] = useState<'period' | 'start-time' | 'end-time' | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const { bookedDatesSet, countMap, isLoading: isLoadingBooked } = useBookedDates(id!, product?.quantidade ?? 1);

  // Max units available for the selected period (product stock minus peak bookings in range)
  const maxAvailable = useMemo(() => {
    const stock = product?.quantidade ?? 1;
    if (!startDate || !endDate) return stock;
    let peakBooked = 0;
    const cur = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    while (cur <= end) {
      const ds = format(cur, 'yyyy-MM-dd');
      peakBooked = Math.max(peakBooked, countMap.get(ds) ?? 0);
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, stock - peakBooked);
  }, [product, startDate, endDate, countMap]);

  const calculatedDays = calcDays(startDate, endDate);
  const valorUnit = Number(product?.valor ?? 0);
  const totalEstimado = calculatedDays > 0 && valorUnit > 0
    ? valorUnit * calculatedDays * selectedQty
    : 0;

  const handleContinue = () => {
    if (!startDate || !endDate) {
      showAlert('Selecione as datas de retirada e devolução.');
      return;
    }
    router.push({
      pathname: `/contract/[id]`,
      params: { id: id!, startDate, startTime, endDate, endTime, quantidade: String(selectedQty) },
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

    const startD = startDate ? new Date(startDate + 'T12:00:00') : null;
    const endD = endDate ? new Date(endDate + 'T12:00:00') : null;

    // For end step: earliest booked date after startDate caps the selectable range
    const firstBookedAfterStart =
      rangeStep === 'end' && startDate
        ? [...bookedDatesSet].filter((d) => d > startDate).sort()[0]
        : undefined;

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`e-${i}`} className="w-[14.28%] aspect-square" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellD = new Date(dateStr + 'T12:00:00');
      const isBooked = bookedDatesSet.has(dateStr);

      let isDisabled = false;
      if (rangeStep === 'start') {
        isDisabled = cellD < tomorrow || isBooked;
      } else {
        const minReturn = startDate ? new Date(startDate + 'T12:00:00') : tomorrow;
        minReturn.setDate(minReturn.getDate() + 2);
        isDisabled =
          cellD < minReturn ||
          !isValidReturnDate(product, dateStr) ||
          isBooked ||
          (firstBookedAfterStart !== undefined && dateStr >= firstBookedAfterStart);
      }

      const isStart = startDate !== null && dateStr === startDate;
      const isEnd = endDate !== null && dateStr === endDate;
      const isInRange =
        startD !== null && endD !== null && cellD > startD && cellD < endD;

      cells.push(
        <TouchableOpacity
          key={`d-${day}`}
          disabled={isDisabled}
          onPress={() => {
            if (rangeStep === 'start') {
              setStartDate(dateStr);
              setEndDate(null);
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
              isStart || isEnd
                ? 'bg-primary-600'
                : isBooked
                ? 'bg-red-500'
                : isInRange
                ? ''
                : ''
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isStart || isEnd
                  ? 'text-white font-bold'
                  : isBooked
                  ? 'text-white line-through'
                  : isInRange
                  ? 'text-primary-700 font-semibold'
                  : isDisabled
                  ? 'text-slate-300'
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
        {/* Step indicator */}
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
              {startDate ? formatDateToBR(startDate) : 'Selecione'}
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
              {endDate ? formatDateToBR(endDate) : 'Selecione'}
            </Text>
          </View>
        </View>

        <Text className="text-center text-xs text-slate-400 mb-5">
          {rangeStep === 'start' ? '👆 Toque na data de retirada' : '👆 Toque na data de devolução'}
        </Text>

        {/* Month nav */}
        <View className="flex-row justify-between items-center mb-5">
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            className="p-2 border border-slate-200 rounded-xl bg-slate-50"
          >
            <ChevronLeft size={16} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            className="p-2 border border-slate-200 rounded-xl bg-slate-50"
          >
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

        {isLoadingBooked ? (
          <View className="py-3 items-center">
            <Text className="text-xs text-slate-400">Carregando disponibilidade...</Text>
          </View>
        ) : (
          <View>{rows}</View>
        )}

        {/* Legend */}
        <View className="mt-5 pt-4 border-t border-slate-100 flex-row flex-wrap gap-x-4 gap-y-2">
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-4 rounded-full bg-primary-600" />
            <Text className="text-xs text-slate-500">Selecionado</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-4 rounded-full bg-primary-100 border border-primary-200" />
            <Text className="text-xs text-slate-500">Período</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-4 rounded-full bg-red-500" />
            <Text className="text-xs text-slate-500">Indisponível</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200" />
            <Text className="text-xs text-slate-400 line-through">Bloqueado</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const isStart = activePicker === 'start-time';
    const slots = generateTimeSlots(
      getProductEntregaHoraInicio(product),
      getProductEntregaHoraFim(product)
    );
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

  const devolucaoDias = getProductDevolucaoDias(product).map(getWeekdayDisplay).join(', ');

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
            <Text className="font-bold">{devolucaoDias}</Text>.
          </Text>
        </View>

        {/* Period card */}
        <TouchableOpacity
          onPress={() => {
            setRangeStep('start');
            setCalendarDate(startDate ? new Date(startDate + 'T12:00:00') : new Date());
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
              <Text className="text-white text-[10px] font-bold">
                {startDate ? 'Alterar' : 'Selecionar'}
              </Text>
            </View>
          </View>

          {startDate || endDate ? (
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Retirada
                </Text>
                <Text className="text-slate-900 font-bold text-base">
                  {startDate ? formatDateToBR(startDate) : '— / — / ——'}
                </Text>
              </View>

              <View className="px-3">
                <ArrowRight size={20} color={BRAND.primaryMuted} />
              </View>

              <View className="flex-1 items-end">
                <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Devolução
                </Text>
                <Text className={`font-bold text-base ${endDate ? 'text-slate-900' : 'text-slate-300'}`}>
                  {endDate ? formatDateToBR(endDate) : '— / — / ——'}
                </Text>
              </View>
            </View>
          ) : (
            <View className="py-4 items-center">
              <CalendarIcon size={28} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-2">Toque para selecionar o período</Text>
            </View>
          )}

          {calculatedDays > 0 && (
            <View className="mt-4 bg-primary-100 rounded-xl py-2 items-center">
              <Text className="text-primary-700 text-sm font-bold">
                {calculatedDays} {calculatedDays === 1 ? 'dia' : 'dias'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Quantity selector — only when stock > 1 */}
        {(product?.quantidade ?? 1) > 1 && (
          <View className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Quantidade
                </Text>
                <Text className="text-xs text-slate-400">
                  Máx. disponível: {maxAvailable} {maxAvailable === 1 ? 'unidade' : 'unidades'}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setSelectedQty(q => Math.max(1, q - 1))}
                  disabled={selectedQty <= 1}
                  className={`w-9 h-9 rounded-full items-center justify-center border ${
                    selectedQty <= 1
                      ? 'border-slate-200 bg-slate-100'
                      : 'border-primary-600 bg-white'
                  }`}
                >
                  <Minus size={16} color={selectedQty <= 1 ? '#cbd5e1' : '#4C007D'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900 w-6 text-center">
                  {selectedQty}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedQty(q => Math.min(maxAvailable, q + 1))}
                  disabled={selectedQty >= maxAvailable}
                  className={`w-9 h-9 rounded-full items-center justify-center border ${
                    selectedQty >= maxAvailable
                      ? 'border-slate-200 bg-slate-100'
                      : 'border-primary-600 bg-primary-600'
                  }`}
                >
                  <Plus size={16} color={selectedQty >= maxAvailable ? '#cbd5e1' : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Time fields — always visible */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => setActivePicker('start-time')}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 items-center"
          >
            <Clock size={14} color={BRAND.primary} />
            <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-2 mb-1">
              Hora Retirada
            </Text>
            <Text className="text-slate-900 font-bold text-sm">{startTime}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActivePicker('end-time')}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 items-center"
          >
            <Clock size={14} color={BRAND.primary} />
            <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-2 mb-1">
              Hora Devolução
            </Text>
            <Text className="text-slate-900 font-bold text-sm">{endTime}</Text>
          </TouchableOpacity>
        </View>

        {/* Summary — only when both dates selected */}
        {startDate && endDate && (
          <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <Text className="text-sm font-bold text-slate-900 mb-4">Resumo do período</Text>

            {valorUnit === 0 && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-yellow-800 text-xs">
                  ⚠️ Valor deste produto não está configurado. Contate o administrador.
                </Text>
              </View>
            )}

            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500">
                {(() => {
                  const t = (product?.tipo_cobranca ?? '').toLowerCase();
                  if (t === 'hora') return 'Valor por hora';
                  if (t === 'semana') return 'Valor por semana';
                  return 'Valor por dia';
                })()}
              </Text>
              <Text className="text-slate-900 font-medium">
                R$ {valorUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500">Dias</Text>
              <Text className="text-slate-900 font-medium">
                {calculatedDays} {calculatedDays === 1 ? 'dia' : 'dias'}
              </Text>
            </View>
            {selectedQty > 1 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-500">Quantidade</Text>
                <Text className="text-slate-900 font-medium">{selectedQty} unidades</Text>
              </View>
            )}
            <View className="h-px bg-slate-200 w-full mb-4 mt-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-slate-900">Total estimado</Text>
              <Text className="text-xl font-bold text-primary-600">
                R$ {totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      <View className="px-6 py-6 border-t border-slate-100 bg-white">
        <Button
          label="Continuar"
          onPress={handleContinue}
          className="h-14"
          disabled={!startDate || !endDate}
        />
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
