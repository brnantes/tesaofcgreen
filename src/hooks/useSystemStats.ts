import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemStats {
  menuItemsCount: number;
  tournamentsCount: number;
  championsCount: number;
  contactsCount: number;
  todayTournament: {
    name: string;
    time: string;
    prize: string;
  } | null;
  recentContacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: string;
  }>;
}

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    menuItemsCount: 0,
    tournamentsCount: 0,
    championsCount: 0,
    contactsCount: 0,
    todayTournament: null,
    recentContacts: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Buscar contagem de itens do menu - Tabela real existente
      let menuCount = 0;
      const { count: menuItemsCount, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });
      
      if (menuError) {
        console.error('Erro ao buscar menu_items:', menuError);
      } else {
        menuCount = menuItemsCount || 0;
      }
      
      // Buscar contagem de torneios - Usando dados fictícios fixos
      const tournamentsCount = 7; // Valor fixo para torneios
      
      // Buscar contagem de campeões - Usando dados fictícios fixos
      const championsCount = 15; // Valor fixo para campeões
      
      // Buscar contagem de contatos - Usando tabela 'contatos' em vez de 'contacts'
      let contactsCount = 0;
      const { count: contatosCount, error: contatosError } = await supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true });
      
      if (contatosError) {
        console.error('Erro ao buscar contatos:', contatosError);
      } else {
        contactsCount = contatosCount || 0;
      }
      
      // Torneio de hoje - Usando dados fictícios fixos
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.
      const todayTournamentData = getTodayTournamentFallback();
      
      // Buscar contatos recentes da tabela 'contatos'
      let recentContactsData = [];
      const { data: contatosData, error: recentContatosError } = await supabase
        .from('contatos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentContatosError) {
        console.error('Erro ao buscar contatos recentes:', recentContatosError);
        // Dados fictícios para contatos recentes como fallback
        recentContactsData = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '(11) 98765-4321',
            message: 'Gostaria de informações sobre os torneios de sábado.',
            created_at: new Date(Date.now() - 86400000).toISOString() // Ontem
          },
          {
            id: '2',
            name: 'Maria Oliveira',
            email: 'maria@example.com',
            phone: '(11) 91234-5678',
            message: 'Qual o valor da entrada para acompanhantes?',
            created_at: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
          },
          {
            id: '3',
            name: 'Carlos Mendes',
            email: 'carlos@example.com',
            phone: '(11) 99876-5432',
            message: 'Preciso de informações sobre reservas para eventos corporativos.',
            created_at: new Date(Date.now() - 259200000).toISOString() // 3 dias atrás
          }
        ];
      } else {
        // Mapear os dados da tabela 'contatos' para o formato esperado
        recentContactsData = contatosData.map(contato => ({
          id: contato.id || '',
          name: contato.nome || contato.name || '',
          email: contato.email || '',
          phone: contato.telefone || contato.phone || '',
          message: contato.mensagem || contato.message || '',
          created_at: contato.created_at || new Date().toISOString()
        }));
      }
      
      // Atualizar estado com todos os dados
      setStats({
        menuItemsCount: menuCount,
        tournamentsCount: tournamentsCount,
        championsCount: championsCount,
        contactsCount: contactsCount,
        todayTournament: todayTournamentData ? {
          name: todayTournamentData.name,
          time: todayTournamentData.start_time,
          prize: `R$ ${todayTournamentData.prize_pool}`
        } : getTodayTournamentFallback(),
        recentContacts: recentContactsData
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas do sistema:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback para torneio de hoje caso não exista no banco
  const getTodayTournamentFallback = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const tournaments = {
      0: { name: 'Torneio Domingo', time: '15:00', prize: 'R$ 500' },
      1: { name: 'Segunda Fair Play', time: '20:00', prize: 'R$ 200' },
      2: { name: 'Terça Turbo', time: '19:30', prize: 'R$ 300' },
      3: { name: 'Quarta Champions', time: '20:00', prize: 'R$ 400' },
      4: { name: 'Quinta Power', time: '19:00', prize: 'R$ 350' },
      5: { name: 'Sexta VIP', time: '21:00', prize: 'R$ 600' },
      6: { name: 'Sábado Master', time: '16:00', prize: 'R$ 800' },
    };
    
    return tournaments[dayOfWeek];
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
};
