import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Edit2, Trash2, Package, LogOut, FileText, Key, Share2, ExternalLink } from 'lucide-react-native';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Product } from '@/types';
import { getProductImages, getFirstProductImage } from '@/utils/imageHelper';
import { getProductRules, getProductDescription } from '@/utils/rulesHelper';
import { getProductDevolucaoDias, getProductEntregaHoraInicio, getProductEntregaHoraFim } from '@/utils/schedulingHelper';
import { useNewRentalsCount } from '@/hooks/useNewRentalsCount';
import { BRAND } from '@/constants/brand';
import { settingsService, SocialLink } from '@/services/settingsService';

export default function AdminProducts() {
  const { data: products, isLoading, refetch } = useProducts();
  const { newCount } = useNewRentalsCount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleText, setNewRuleText] = useState('');
  const router = useRouter();

  // State for changing password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // State for social links
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newSocialTexto, setNewSocialTexto] = useState('');
  const [newSocialLink, setNewSocialLink] = useState('');
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  const loadSocialLinks = async () => {
    try {
      const links = await settingsService.getSocialLinks();
      setSocialLinks(links);
    } catch (err: any) {
      console.warn('Erro ao carregar redes sociais:', err.message);
    }
  };

  const handleOpenSocialModal = async () => {
    await loadSocialLinks();
    setIsSocialModalOpen(true);
  };

  const handleAddSocialLink = () => {
    if (!newSocialTexto.trim()) {
      alert('Digite um texto para o link.');
      return;
    }
    if (!newSocialLink.trim()) {
      alert('Cole o link/URL da rede social.');
      return;
    }
    setSocialLinks(prev => [
      ...prev,
      { texto: newSocialTexto.trim(), link: newSocialLink.trim() },
    ]);
    setNewSocialTexto('');
    setNewSocialLink('');
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSocialLinks = async () => {
    setIsSavingSocial(true);
    try {
      await settingsService.saveSocialLinks(socialLinks);
      alert('Redes sociais salvas com sucesso!');
      setIsSocialModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Preencha ambos os campos.');
      return;
    }
    if (newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('Senha alterada com sucesso!');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert('Erro ao atualizar senha: ' + err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  const handleOpenNewModal = () => {
    setEditingProduct({ tipo_cobranca: 'Dia', quantidade: 1 });
    setNewRuleTitle('');
    setNewRuleText('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Product) => {
    setEditingProduct(item);
    setNewRuleTitle('');
    setNewRuleText('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const valorStr = editingProduct?.valor?.toString().trim();
    if (!editingProduct?.nome || !valorStr) {
      alert('Nome e valor são obrigatórios.');
      return;
    }

    // Replace comma with dot for proper float parsing
    const parsedValor = Number(valorStr.replace(',', '.'));
    if (isNaN(parsedValor) || parsedValor <= 0) {
      alert('Por favor, insira um valor numérico válido maior que zero.');
      return;
    }

    const parsedQty = Number(editingProduct?.quantidade);
    const finalQty = isNaN(parsedQty) || parsedQty < 1 ? 1 : Math.floor(parsedQty);

    setIsSubmitting(true);
    try {
      const rules = getProductRules(editingProduct);
      const desc = getProductDescription(editingProduct);
      const devolucaoDias = getProductDevolucaoDias(editingProduct);
      const entregaHoraInicio = getProductEntregaHoraInicio(editingProduct);
      const entregaHoraFim = getProductEntregaHoraFim(editingProduct);

      const payload: any = {
        nome: editingProduct.nome,
        descricao: JSON.stringify({
          descricao: desc,
          regras: rules,
          devolucao_dias: devolucaoDias,
          entrega_hora_inicio: entregaHoraInicio,
          entrega_hora_fim: entregaHoraFim,
        }),
        categoria: editingProduct.categoria,
        valor: parsedValor,
        tipo_cobranca: editingProduct.tipo_cobranca || 'Dia',
        marca: editingProduct.marca,
        estado_conservacao: editingProduct.estado_conservacao,
        quantidade: finalQty,
        ativo: true,
        regras_uso: JSON.stringify(rules),
        devolucao_dias: JSON.stringify(devolucaoDias),
        entrega_hora_inicio: entregaHoraInicio,
        entrega_hora_fim: entregaHoraFim,
      };

      if (editingProduct.imagem) {
        payload.imagem = editingProduct.imagem;
      }

      let saveError;
      if (editingProduct.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        saveError = error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        saveError = error;
      }

      if (saveError) {
        if (saveError.code === '42703' || saveError.message.includes('regras_uso') || saveError.message.includes('devolucao_dias') || saveError.message.includes('entrega_hora_inicio') || saveError.message.includes('entrega_hora_fim')) {
          const { regras_uso, devolucao_dias, entrega_hora_inicio, entrega_hora_fim, ...safePayload } = payload;
          let retryError;
          if (editingProduct.id) {
            const { error } = await supabase.from('products').update(safePayload).eq('id', editingProduct.id);
            retryError = error;
          } else {
            const { error } = await supabase.from('products').insert(safePayload);
            retryError = error;
          }
          if (retryError) throw retryError;
        } else {
          throw saveError;
        }
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      refetch();
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center">
      <Image
        source={{ uri: getFirstProductImage(item.imagem, 'https://via.placeholder.com/100') }}
        className="w-16 h-16 rounded-xl bg-slate-100 mr-4"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900" numberOfLines={1}>{item.nome}</Text>
        <Text className="text-xs text-slate-500 mb-1">{item.categoria} • {item.tipo_cobranca}</Text>
        <Text className="text-sm font-bold text-primary-600">
          R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity 
          onPress={() => handleOpenEditModal(item)}
          className="p-2 bg-slate-50 rounded-lg"
        >
          <Edit2 size={18} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          className="p-2 bg-red-50 rounded-lg"
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: 'Gerenciar Produtos' }} />
      
      <View className="px-6 py-6 bg-white border-b border-slate-100 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-slate-900">Estoque</Text>
          <Text className="text-slate-500">Controle seus produtos</Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => router.push('/admin/rentals')}
            className="p-3 bg-slate-100 rounded-xl relative"
            accessibilityLabel={
              newCount > 0 ? `Contratos, ${newCount} aluguéis novos` : 'Contratos'
            }
          >
            <FileText size={20} color={newCount > 0 ? BRAND.primary : '#475569'} />
            {newCount > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-[10px] font-bold text-white">
                  {newCount > 9 ? '9+' : newCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenSocialModal}
            className="p-3 bg-primary-50 rounded-xl"
            accessibilityLabel="Gerenciar redes sociais"
          >
            <Share2 size={20} color={BRAND.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsPasswordModalOpen(true)}
            className="p-3 bg-slate-100 rounded-xl"
          >
            <Key size={20} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleLogout}
            className="p-3 bg-red-50 rounded-xl"
          >
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="p-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-24 mb-3" />)}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProductItem}
          contentContainerClassName="p-6 pb-24"
          ListEmptyComponent={
            <View className="items-center py-20">
              <Package size={48} color="#cbd5e1" className="mb-4" />
              <Text className="text-slate-400">Nenhum produto cadastrado.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={handleOpenNewModal}
        className="absolute bottom-10 right-6 w-16 h-16 bg-primary-600 rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct?.id ? 'Editar Produto' : 'Novo Produto'}
      >
        <ScrollView className="max-h-[70vh]">
          <Input
            label="Nome do Produto"
            value={editingProduct?.nome}
            onChangeText={v => setEditingProduct({ ...editingProduct, nome: v })}
          />
          <Input
            label="Descrição"
            value={getProductDescription(editingProduct)}
            onChangeText={v => {
              const currentRules = getProductRules(editingProduct);
              const currentDays = getProductDevolucaoDias(editingProduct);
              const start = getProductEntregaHoraInicio(editingProduct);
              const end = getProductEntregaHoraFim(editingProduct);
              setEditingProduct({
                ...editingProduct,
                descricao: JSON.stringify({
                  descricao: v,
                  regras: currentRules,
                  devolucao_dias: currentDays,
                  entrega_hora_inicio: start,
                  entrega_hora_fim: end
                })
              });
            }}
            multiline
          />
          <View className="flex-row space-x-4">
            <Input
              label="Categoria"
              value={editingProduct?.categoria}
              onChangeText={v => setEditingProduct({ ...editingProduct, categoria: v })}
              containerClassName="flex-1"
            />
            <Input
              label="Marca"
              value={editingProduct?.marca}
              onChangeText={v => setEditingProduct({ ...editingProduct, marca: v })}
              containerClassName="flex-1"
            />
          </View>
          <View className="flex-row space-x-4">
            <Input
              label="Valor (R$)"
              value={editingProduct?.valor?.toString()}
              onChangeText={v => setEditingProduct({ ...editingProduct, valor: v as any })}
              keyboardType="numeric"
              containerClassName="flex-1"
            />
            <View className="flex-1 mb-4">
              <Text className="mb-1 text-sm font-medium text-slate-700">Cobrança</Text>
              <View className="flex-row bg-slate-100 rounded-xl p-1">
                {['Hora', 'Dia', 'Semana'].map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEditingProduct({ ...editingProduct, tipo_cobranca: type as any })}
                    className={`flex-1 py-2 rounded-lg items-center ${editingProduct?.tipo_cobranca === type ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-[10px] font-bold ${editingProduct?.tipo_cobranca === type ? 'text-primary-600' : 'text-slate-500'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-slate-700">Fotos do Produto</Text>
            
            {getProductImages(editingProduct?.imagem).length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {getProductImages(editingProduct?.imagem).map((url, index) => (
                  <View key={index} className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => {
                        const current = getProductImages(editingProduct?.imagem);
                        const updated = current.filter((_, idx) => idx !== index);
                        setEditingProduct({
                          ...editingProduct,
                          imagem: updated.length > 0 ? JSON.stringify(updated) : '',
                        });
                      }}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-sm"
                    >
                      <Trash2 size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity 
              onPress={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = async (e: any) => {
                  const files = Array.from(e.target.files || []) as File[];
                  if (files.length === 0) return;
                  
                  setIsSubmitting(true);
                  try {
                    const uploadedUrls: string[] = [];
                    for (const file of files) {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Math.random()}.${fileExt}`;
                      const filePath = `products/${fileName}`;
                      
                      const { data, error } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, file);
                      
                      if (error) throw error;
                      
                      const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(filePath);
                      
                      uploadedUrls.push(publicUrl);
                    }
                    
                    const currentImages = getProductImages(editingProduct?.imagem);
                    const updatedImages = [...currentImages, ...uploadedUrls];
                    setEditingProduct({ ...editingProduct, imagem: JSON.stringify(updatedImages) });
                  } catch (err: any) {
                    alert('Erro no upload: ' + err.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                };
                input.click();
              }}
              className="w-full h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 items-center justify-center overflow-hidden"
            >
              <View className="items-center">
                <Plus size={20} color="#94a3b8" />
                <Text className="text-slate-400 text-xs mt-1">Adicionar Foto(s)</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="flex-row space-x-4">
            <Input
              label="Estado"
              placeholder="Ex: Novo, Semi-novo"
              value={editingProduct?.estado_conservacao}
              onChangeText={v => setEditingProduct({ ...editingProduct, estado_conservacao: v })}
              containerClassName="flex-1"
            />
            <Input
              label="Qtd"
              value={editingProduct?.quantidade?.toString()}
              onChangeText={v => setEditingProduct({ ...editingProduct, quantidade: v as any })}
              keyboardType="numeric"
              containerClassName="w-20"
            />
          </View>

          {/* Configurações de Agendamento */}
          <View className="mb-4 mt-2">
            <Text className="mb-2 text-sm font-medium text-slate-700">Dias Permitidos para Devolução</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => {
                const currentDays = getProductDevolucaoDias(editingProduct);
                const isSelected = currentDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      let updated;
                      if (isSelected) {
                        updated = currentDays.filter(d => d !== day);
                      } else {
                        updated = [...currentDays, day];
                      }
                      setEditingProduct({
                        ...editingProduct,
                        devolucao_dias: JSON.stringify(updated),
                        descricao: JSON.stringify({
                          descricao: getProductDescription(editingProduct),
                          regras: getProductRules(editingProduct),
                          devolucao_dias: updated,
                          entrega_hora_inicio: getProductEntregaHoraInicio(editingProduct),
                          entrega_hora_fim: getProductEntregaHoraFim(editingProduct)
                        })
                      });
                    }}
                    className={`px-3 py-2 rounded-xl border ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-200'}`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-sm font-medium text-slate-700 mb-2">Horários de Entrega/Devolução</Text>
            <View className="flex-row space-x-3">
              <Input
                label="Primeiro Horário"
                placeholder="08:00"
                value={getProductEntregaHoraInicio(editingProduct)}
                onChangeText={v => setEditingProduct({ 
                  ...editingProduct, 
                  entrega_hora_inicio: v,
                  descricao: JSON.stringify({
                    descricao: getProductDescription(editingProduct),
                    regras: getProductRules(editingProduct),
                    devolucao_dias: getProductDevolucaoDias(editingProduct),
                    entrega_hora_inicio: v,
                    entrega_hora_fim: getProductEntregaHoraFim(editingProduct)
                  })
                })}
                containerClassName="flex-1"
              />
              <Input
                label="Último Horário"
                placeholder="18:00"
                value={getProductEntregaHoraFim(editingProduct)}
                onChangeText={v => setEditingProduct({ 
                  ...editingProduct, 
                  entrega_hora_fim: v,
                  descricao: JSON.stringify({
                    descricao: getProductDescription(editingProduct),
                    regras: getProductRules(editingProduct),
                    devolucao_dias: getProductDevolucaoDias(editingProduct),
                    entrega_hora_inicio: getProductEntregaHoraInicio(editingProduct),
                    entrega_hora_fim: v
                  })
                })}
                containerClassName="flex-1"
              />
            </View>
          </View>

          <View className="mb-4 mt-2">
            <Text className="mb-2 text-sm font-medium text-slate-700">Regras de Uso</Text>
            
            {getProductRules(editingProduct).map((rule, index) => (
              <View key={index} className="flex-row items-center justify-between bg-slate-50 p-3 rounded-xl mb-2 border border-slate-100">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-bold text-slate-800">{rule.titulo}</Text>
                  <Text className="text-xs text-slate-500">{rule.texto}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const currentRules = getProductRules(editingProduct);
                    const updated = currentRules.filter((_, idx) => idx !== index);
                    setEditingProduct({
                      ...editingProduct,
                      regras_uso: JSON.stringify(updated),
                      descricao: JSON.stringify({
                        descricao: getProductDescription(editingProduct),
                        regras: updated,
                        devolucao_dias: getProductDevolucaoDias(editingProduct),
                        entrega_hora_inicio: getProductEntregaHoraInicio(editingProduct),
                        entrega_hora_fim: getProductEntregaHoraFim(editingProduct)
                      })
                    });
                  }}
                  className="p-1 bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2">
              <Text className="text-xs font-bold text-slate-600 mb-2">Adicionar Regra</Text>
              <Input
                label="Título da Regra"
                placeholder="Ex: Seguro de Danos"
                value={newRuleTitle}
                onChangeText={setNewRuleTitle}
                containerClassName="mb-2"
              />
              <Input
                label="Texto/Descrição da Regra"
                placeholder="Ex: Cobertura de avarias simples."
                value={newRuleText}
                onChangeText={setNewRuleText}
                containerClassName="mb-3"
              />
              <Button
                label="Adicionar Regra"
                onPress={() => {
                  if (!newRuleTitle.trim() || !newRuleText.trim()) {
                    alert('Preencha o título e a descrição da regra.');
                    return;
                  }
                  const currentRules = getProductRules(editingProduct);
                  const updated = [...currentRules, { titulo: newRuleTitle.trim(), texto: newRuleText.trim() }];
                  setEditingProduct({
                    ...editingProduct,
                    regras_uso: JSON.stringify(updated),
                    descricao: JSON.stringify({
                      descricao: getProductDescription(editingProduct),
                      regras: updated,
                      devolucao_dias: getProductDevolucaoDias(editingProduct),
                      entrega_hora_inicio: getProductEntregaHoraInicio(editingProduct),
                      entrega_hora_fim: getProductEntregaHoraFim(editingProduct)
                    })
                  });
                  setNewRuleTitle('');
                  setNewRuleText('');
                }}
                className="h-10 py-1 bg-slate-800"
              />
            </View>
          </View>

          <Button
            label="Salvar Produto"
            onPress={handleSave}
            isLoading={isSubmitting}
            className="mt-4"
          />
        </ScrollView>
      </Modal>

      {/* Modal para Alterar Senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setNewPassword('');
          setConfirmPassword('');
        }}
        title="Alterar Senha do Perfil"
      >
        <View className="space-y-4">
          <Input
            label="Nova Senha"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Input
            label="Confirmar Nova Senha"
            placeholder="Repita a nova senha"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button
            label="Atualizar Senha"
            onPress={handleUpdatePassword}
            isLoading={isUpdatingPassword}
            className="mt-4 h-12 bg-primary-600"
          />
        </View>
      </Modal>

      {/* Modal Redes Sociais */}
      <Modal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        title="Redes Sociais"
      >
        <ScrollView className="max-h-[70vh]" showsVerticalScrollIndicator={false}>

          {/* Links cadastrados */}
          {socialLinks.length === 0 ? (
            <View className="items-center py-6 mb-4">
              <ExternalLink size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-3 text-center">
                Nenhuma rede social cadastrada ainda.{`\n`}Adicione abaixo.
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Links cadastrados
              </Text>
              {socialLinks.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-2"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
                      {item.texto}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                      {item.link}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveSocialLink(index)}
                    className="p-2 bg-red-50 rounded-xl"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Formulário para adicionar */}
          <View className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-4">
            <Text className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-3">
              Adicionar novo link
            </Text>
            <Input
              label="Texto do botão"
              placeholder="Ex: Siga nosso Instagram"
              value={newSocialTexto}
              onChangeText={setNewSocialTexto}
              containerClassName="mb-3"
            />
            <Input
              label="Link / URL"
              placeholder="Ex: https://instagram.com/babylover"
              value={newSocialLink}
              onChangeText={setNewSocialLink}
              containerClassName="mb-3"
              autoCapitalize="none"
              keyboardType="url"
            />
            <Button
              label="+ Adicionar"
              onPress={handleAddSocialLink}
              className="h-10 py-1 bg-primary-600"
            />
          </View>

          <Button
            label="Salvar Redes Sociais"
            onPress={handleSaveSocialLinks}
            isLoading={isSavingSocial}
            className="mt-2 h-12"
          />
        </ScrollView>
      </Modal>
    </View>
  );
}
