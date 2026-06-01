import React from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BRAND } from '@/constants/brand';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { ExternalLink, Heart } from 'lucide-react-native';

export const Footer = () => {
  const router = useRouter();
  const { data: socialLinks, isLoading } = useSocialLinks();

  return (
    <View
      style={{
        backgroundColor: BRAND.primaryDark,
        paddingHorizontal: 24,
        paddingVertical: 48,
        borderTopWidth: 4,
        borderTopColor: BRAND.accent,
      }}
    >
      <View className="mb-8">
        <BrandLogo size="md" style={{ marginBottom: 16 }} />
        <Text className="text-white/70 leading-relaxed max-w-md text-sm">
          A melhor plataforma de locação de produtos infantis para o conforto do seu bebê e
          economia para você.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={BRAND.accent} className="mb-10" />
      ) : socialLinks && socialLinks.length > 0 ? (
        <View className="mb-10">
          <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
            Redes Sociais
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {socialLinks.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (item.link) Linking.openURL(item.link);
                }}
                className="flex-row items-center px-4 py-2.5 rounded-full gap-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,108,182,0.35)',
                }}
                activeOpacity={0.75}
              >
                <ExternalLink size={12} color={BRAND.accent} />
                <Text style={{ color: '#FFE0F1' }} className="font-semibold text-sm">
                  {item.texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 24 }} />

      <View className="flex-row items-center gap-1.5 mb-3">
        <Heart size={12} color={BRAND.accent} fill={BRAND.accent} />
        <Text className="text-white/50 text-xs">Cuidando do seu bebê com carinho</Text>
      </View>

      <View className="space-y-2">
        <Text className="text-white/40 text-sm">© 2026 AlugaKi Baby. Todos os direitos reservados.</Text>
        <Text className="text-white/30 text-xs">
          Desenvolvido por{' '}
          <Text
            className="underline"
            style={{ color: BRAND.accent }}
            onPress={() => Linking.openURL('https://www.linkedin.com/in/otavio-ribeiro07/')}
          >
            Otávio Ribeiro
          </Text>
        </Text>
        <TouchableOpacity onPress={() => router.push('/admin/login')} className="mt-3">
          <Text className="text-white/20 text-[10px]">Acesso administrativo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
