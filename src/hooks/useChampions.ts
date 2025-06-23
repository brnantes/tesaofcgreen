
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Champion {
  id: string;
  name: string;
  achievement: string;
  prize: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export const useChampions = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChampions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'champion')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedChampions = data?.map(item => {
        const content = JSON.parse(item.content);
        return {
          id: item.id,
          name: item.title,
          achievement: content.achievement,
          prize: content.prize,
          image_url: content.image_url,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }) || [];
      
      setChampions(formattedChampions);
    } catch (error) {
      console.error('Erro ao buscar campeões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os campeões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addChampion = async (championData: Omit<Champion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const content = JSON.stringify({
        achievement: championData.achievement,
        prize: championData.prize,
        image_url: championData.image_url
      });
      
      const { data, error } = await supabase
        .from('site_content')
        .insert([{
          type: 'champion',
          title: championData.name,
          content: content
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchChampions();
      toast({
        title: "Sucesso",
        description: "Campeão adicionado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar campeão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o campeão.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteChampion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setChampions(prev => prev.filter(champion => champion.id !== id));
      toast({
        title: "Sucesso",
        description: "Campeão removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar campeão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o campeão.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchChampions();
  }, []);

  return {
    champions,
    loading,
    addChampion,
    deleteChampion,
    refetch: fetchChampions,
  };
};
