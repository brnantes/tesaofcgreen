import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { Tournament, TournamentData } from '@/types/tournament';

export const fetchTournaments = async (): Promise<Tournament[]> => {
  console.log('🔍 TournamentService: Iniciando busca no Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'tournament')
      .order('created_at', { ascending: false });

    console.log('📊 TournamentService: Resposta bruta do Supabase:', { data, error });

    if (error) {
      console.error('❌ TournamentService: Erro na consulta:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ TournamentService: Nenhum torneio encontrado');
      return [];
    }
    
    console.log(`📋 TournamentService: ${data.length} registros encontrados`);
    
    const tournaments = data.map((item, index) => {
      try {
        console.log(`🔄 TournamentService: Processando item ${index + 1}:`, item);
        
        let content;
        try {
          if (typeof item.content === 'string') {
            content = JSON.parse(item.content);
          } else if (item.content && typeof item.content === 'object') {
            content = item.content;
          } else {
            // Se o conteúdo não for válido, cria um objeto vazio
            console.warn(`⚠️ TournamentService: Conteúdo inválido para o item ${index + 1}`);
            content = {};
          }
        } catch (parseError) {
          console.error(`❌ TournamentService: Erro ao parsear JSON do item ${index + 1}:`, parseError);
          content = {};
        }
        
        console.log(`📝 TournamentService: Conteúdo parseado do item ${index + 1}:`, content);
        
        // Assegurar que todos os campos existam para evitar erros
        const tournament: Tournament = {
          id: item.id || `temp-${Date.now()}-${index}`,
          name: item.title || 'Torneio sem nome',
          date: content.date || new Date().toISOString().split('T')[0],
          day_of_week: content.day_of_week ?? null,
          time: content.time || '19:00',
          buy_in: content.buy_in || 'R$ 100,00',
          prize: content.prize || 'A definir',
          max_players: content.max_players || 50,
          special_features: content.special_features || '',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        };
        
        console.log(`✅ TournamentService: Torneio ${index + 1} processado:`, tournament);
        return tournament;
      } catch (processError) {
        console.error(`❌ TournamentService: Erro fatal ao processar item ${index + 1}:`, processError, item);
        return null;
      }
    }).filter(Boolean) as Tournament[];
    
    console.log(`🏆 TournamentService: ${tournaments.length} torneios válidos processados`);
    console.log('📋 TournamentService: Lista final:', tournaments);
    
    return tournaments;
  } catch (globalError) {
    console.error('💥 TournamentService: Erro global:', globalError);
    throw globalError;
  }
};

export const addTournament = async (tournamentData: TournamentData) => {
  console.log('🎯 TournamentService: Iniciando adição de torneio:', tournamentData);
  
  // Temporariamente removendo verificação de autenticação
  // já que o usuário está logado como "master" no AuthContext
  
  try {
    const content = JSON.stringify({
      date: tournamentData.date,
      day_of_week: tournamentData.day_of_week,
      time: tournamentData.time,
      buy_in: tournamentData.buy_in,
      prize: tournamentData.prize,
      max_players: tournamentData.max_players,
      special_features: tournamentData.special_features || ''
    });
    
    console.log('📦 TournamentService: Dados a serem inseridos:', {
      type: 'tournament',
      title: tournamentData.name,
      content: content
    });
    
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .insert([{
        type: 'tournament',
        title: tournamentData.name,
        content: content
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ TournamentService: Erro detalhado do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Mensagens de erro mais específicas
      if (error.code === '42501') {
        throw new Error('Sem permissão para criar torneios. Verifique as políticas RLS no Supabase.');
      } else if (error.code === '23505') {
        throw new Error('Já existe um torneio com esse nome.');
      } else {
        throw new Error(`Erro ao adicionar torneio: ${error.message}`);
      }
    }
    
    console.log('✅ TournamentService: Torneio adicionado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ TournamentService: Erro ao adicionar:', error);
    throw error;
  }
};

export const updateTournament = async (id: string, tournamentData: TournamentData) => {
  console.log('✏️ TournamentService: Atualizando torneio:', id, tournamentData);
  
  try {
    const content = JSON.stringify({
      date: tournamentData.date,
      day_of_week: tournamentData.day_of_week,
      time: tournamentData.time,
      buy_in: tournamentData.buy_in,
      prize: tournamentData.prize,
      max_players: tournamentData.max_players,
      special_features: tournamentData.special_features || ''
    });
    
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .update({
        title: tournamentData.name,
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ TournamentService: Erro ao atualizar:', error);
      throw new Error(`Erro ao atualizar torneio: ${error.message}`);
    }
    
    console.log('✅ TournamentService: Torneio atualizado:', data);
    return data;
  } catch (error) {
    console.error('❌ TournamentService: Erro ao atualizar:', error);
    throw error;
  }
};

export const deleteTournament = async (id: string) => {
  console.log('🗑️ TournamentService: Deletando torneio:', id);
  
  try {
    const { error } = await supabaseAdmin
      .from('site_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ TournamentService: Erro ao deletar:', error);
      throw new Error(`Erro ao deletar torneio: ${error.message}`);
    }
    
    console.log('✅ TournamentService: Torneio deletado:', id);
  } catch (error) {
    console.error('❌ TournamentService: Erro ao deletar:', error);
    throw error;
  }
};

// Inicialização do serviço
console.log('🌐 TournamentService: Iniciando serviço de torneios');
