
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'banner')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBanners = data?.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.content,
        image_url: item.content.split('|')[1] || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setBanners(formattedBanners);
    } catch (error) {
      console.error('Erro ao buscar banners:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os banners.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBanner = async (bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const content = `${bannerData.subtitle}|${bannerData.image_url}`;
      
      const { data, error } = await supabase
        .from('site_content')
        .upsert([{
          type: 'banner',
          title: bannerData.title,
          content: content
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchBanners();
      toast({
        title: "Sucesso",
        description: "Banner salvo com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o banner.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    saveBanner,
    refetch: fetchBanners,
  };
};
