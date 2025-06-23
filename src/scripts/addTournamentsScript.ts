// Script para adicionar torneios fictícios diretamente do painel admin
import { supabase } from '../integrations/supabase/client';
import { TournamentData } from '../types/tournament';

const addTournaments = async () => {
  console.log('Iniciando o cadastro de torneios fictícios...');
  
  // Obter a data de hoje e formatar no formato ISO
  const today = new Date();
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getTomorrowDate = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  };
  
  const getNextWeekDate = () => {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return formatDate(nextWeek);
  };
  
  const tournamentsData: (TournamentData & { title: string })[] = [
    {
      name: 'Torneio Royal Flush - Especial',
      title: 'Torneio Royal Flush - Especial',
      date: formatDate(today),
      time: '19:00',
      buy_in: 'R$ 150,00',
      prize: 'R$ 10.000,00',
      max_players: 32
    },
    {
      name: 'Torneio Texas Hold\'em',
      title: 'Torneio Texas Hold\'em',
      date: getTomorrowDate(),
      time: '20:00',
      buy_in: 'R$ 100,00',
      prize: 'R$ 5.000,00',
      max_players: 24
    },
    {
      name: 'Freeroll de Sexta-feira',
      title: 'Freeroll de Sexta-feira',
      date: getNextWeekDate(),
      time: '18:30',
      buy_in: 'Gratuito',
      prize: 'R$ 1.000,00',
      max_players: 50
    },
    {
      name: 'Torneio High Stakes',
      title: 'Torneio High Stakes',
      date: '2025-06-28',
      time: '21:00',
      buy_in: 'R$ 300,00',
      prize: 'R$ 15.000,00',
      max_players: 20
    },
    {
      name: 'Torneio Sit & Go',
      title: 'Torneio Sit & Go',
      date: '2025-07-05',
      time: '14:00',
      buy_in: 'R$ 75,00',
      prize: 'R$ 3.000,00',
      max_players: 16
    }
  ];

  console.log(`Preparando para inserir ${tournamentsData.length} torneios...`);
  
  for (const tournament of tournamentsData) {
    try {
      const content = {
        date: tournament.date,
        time: tournament.time,
        buy_in: tournament.buy_in,
        prize: tournament.prize,
        max_players: tournament.max_players
      };
      
      const { data, error } = await supabase
        .from('site_content')
        .insert([{
          type: 'tournament',
          title: tournament.title,
          content: JSON.stringify(content)
        }]);
      
      if (error) {
        console.error('Erro ao inserir torneio:', tournament.title, error);
      } else {
        console.log('Torneio inserido com sucesso:', tournament.title);
      }
    } catch (e) {
      console.error('Exceção ao inserir torneio:', e);
    }
  }

  console.log('Processo de inserção de torneios concluído!');
};

export { addTournaments };
