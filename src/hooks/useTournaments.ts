
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tournament, TournamentData } from '@/types/tournament';
import { 
  fetchTournaments as fetchTournamentsService,
  addTournament as addTournamentService,
  updateTournament as updateTournamentService,
  deleteTournament as deleteTournamentService
} from '@/services/tournamentService';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTournaments = async () => {
    try {
      console.log('🚀 useTournaments: Iniciando busca de torneios...');
      setLoading(true);
      setError(null);
      
      const data = await fetchTournamentsService();
      
      console.log('📥 useTournaments: Dados recebidos do service:', data);
      console.log('📊 useTournaments: Quantidade de torneios:', data.length);
      console.log('🔍 useTournaments: Primeiro torneio:', data[0]);
      
      setTournaments(data);
      
      if (data.length > 0) {
        console.log('🎉 useTournaments: Torneios carregados com sucesso!', data.length, 'torneios');
        console.log('📝 useTournaments: Detalhes dos torneios:', data.map(t => ({ 
          id: t.id, 
          name: t.name, 
          date: t.date, 
          time: t.time 
        })));
      } else {
        console.log('⚠️ useTournaments: Nenhum torneio encontrado');
      }
    } catch (error) {
      console.error('💥 useTournaments: Erro ao buscar torneios:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os torneios. Tente novamente.",
        variant: "destructive",
      });
      setTournaments([]);
    } finally {
      console.log('🏁 useTournaments: Finalizando carregamento');
      setLoading(false);
    }
  };

  const addTournament = async (tournamentData: TournamentData) => {
    try {
      console.log('➕ useTournaments: Adicionando torneio:', tournamentData);
      await addTournamentService(tournamentData);
      await fetchTournaments();
      toast({
        title: "Sucesso",
        description: "Torneio adicionado com sucesso!",
      });
    } catch (error) {
      console.error('❌ useTournaments: Erro ao adicionar torneio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o torneio.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTournament = async (id: string, tournamentData: TournamentData) => {
    try {
      console.log('✏️ useTournaments: Atualizando torneio:', id, tournamentData);
      await updateTournamentService(id, tournamentData);
      await fetchTournaments();
      toast({
        title: "Sucesso",
        description: "Torneio atualizado com sucesso!",
      });
    } catch (error) {
      console.error('❌ useTournaments: Erro ao atualizar torneio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o torneio.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      console.log('🗑️ useTournaments: Iniciando exclusão do torneio:', id);
      
      // Primeiro, remove o torneio da lista local para feedback imediato
      setTournaments(prev => {
        const updated = prev.filter(tournament => tournament.id !== id);
        console.log('🔄 useTournaments: Lista local atualizada. Torneios restantes:', updated.length);
        return updated;
      });
      
      // Tenta excluir o torneio no servidor
      console.log('🔄 useTournaments: Enviando requisição para excluir o torneio no servidor...');
      await deleteTournamentService(id);
      
      // Atualiza a lista completa do servidor para garantir consistência
      console.log('🔄 useTournaments: Atualizando lista completa do servidor...');
      await fetchTournaments();
      
      toast({
        title: "Sucesso",
        description: "Torneio removido com sucesso!",
      });
      
      console.log('✅ useTournaments: Torneio excluído e lista atualizada com sucesso');
    } catch (error) {
      console.error('❌ useTournaments: Erro ao deletar torneio:', error);
      
      // Se houver erro, restaura a lista original
      console.log('🔄 useTournaments: Restaurando lista de torneios do servidor...');
      await fetchTournaments();
      
      toast({
        title: "Erro",
        description: "Não foi possível remover o torneio. A lista foi atualizada.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔄 useTournaments: Hook inicializado, iniciando busca automática...');
    fetchTournaments();
  }, []);

  console.log('📊 useTournaments: Estado atual - tournaments:', tournaments.length, 'loading:', loading, 'error:', error);

  return {
    tournaments,
    loading,
    error,
    addTournament,
    updateTournament,
    deleteTournament,
    refetch: fetchTournaments,
  };
};
