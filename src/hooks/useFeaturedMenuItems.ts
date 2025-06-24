import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useFeaturedMenuItems = () => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeaturedItems = async () => {
    try {
      console.log('Buscando pratos em destaque...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('featured', true)
        .order('updated_at', { ascending: false })
        .limit(3);

      console.log('Pratos em destaque recebidos:', data);
      
      if (error) {
        console.error('Erro ao buscar pratos em destaque:', error);
        throw error;
      }
      
      setFeaturedItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar pratos em destaque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pratos em destaque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  return {
    featuredItems,
    loading,
    refetch: fetchFeaturedItems,
  };
};
