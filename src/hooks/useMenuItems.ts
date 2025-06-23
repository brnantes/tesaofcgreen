
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuItemInsert, MenuItemUpdate } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    try {
      console.log('Buscando itens do cardápio...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Dados recebidos:', data);
      console.log('Erro:', error);

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      setMenuItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens do cardápio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens do cardápio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: MenuItemInsert) => {
    try {
      console.log('Adicionando item:', item);
      
      // Garantir que todos os campos obrigatórios estão presentes
      const itemToAdd = {
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        category: item.category || 'Porções'
      };
      
      console.log('Item processado para adicionar:', itemToAdd);
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemToAdd])
        .select()
        .single();

      console.log('Resposta do Supabase - data:', data);
      console.log('Resposta do Supabase - error:', error);

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }
      
      if (data) {
        setMenuItems(prev => [data, ...prev]);
        toast({
          title: "Sucesso",
          description: "Item adicionado ao cardápio com sucesso!",
        });
        return data;
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item ao cardápio.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMenuItem = async (id: string, updates: MenuItemUpdate) => {
    try {
      console.log('Atualizando item:', id, updates);
      
      // Garantir que apenas campos válidos sejam enviados
      const updatedData = {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image_url: updates.image_url,
        category: updates.category,
        updated_at: new Date().toISOString()
      };
      
      console.log('Dados para atualizar:', updatedData);
      
      const { data, error } = await supabase
        .from('menu_items')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      console.log('Resposta da atualização - data:', data);
      console.log('Resposta da atualização - error:', error);

      if (error) {
        console.error('Erro detalhado na atualização:', error);
        throw error;
      }
      
      if (data) {
        setMenuItems(prev => prev.map(item => item.id === id ? data : item));
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso!",
        });
        return data;
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      console.log('Deletando item:', id);
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      console.log('Erro ao deletar:', error);

      if (error) throw error;
      
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Item removido do cardápio com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item do cardápio.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems,
  };
};
