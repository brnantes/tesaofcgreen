// Script para adicionar torneios fictícios
import { supabase } from '../integrations/supabase/client';

const addTournaments = async () => {
  console.log('Iniciando o cadastro de torneios fictícios...');
  
  // Obter a data de hoje e formatar no formato ISO
  const today = new Date();
  const formatDate = (date) => {
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
  
  const tournaments = [
    {
      title: 'Torneio Royal Flush - Especial',
      content: JSON.stringify({
        date: formatDate(today),
        time: '19:00',
        buy_in: 'R$ 150,00',
        prize: 'R$ 10.000,00',
        max_players: 32
      }),
      type: 'tournament'
    },
    {
      title: 'Torneio Texas Hold\'em',
      content: JSON.stringify({
        date: getTomorrowDate(),
        time: '20:00',
        buy_in: 'R$ 100,00',
        prize: 'R$ 5.000,00',
        max_players: 24
      }),
      type: 'tournament'
    },
    {
      title: 'Freeroll de Sexta-feira',
      content: JSON.stringify({
        date: getNextWeekDate(),
        time: '18:30',
        buy_in: 'Gratuito',
        prize: 'R$ 1.000,00',
        max_players: 50
      }),
      type: 'tournament'
    },
    {
      title: 'Torneio High Stakes',
      content: JSON.stringify({
        date: '2025-06-28',
        time: '21:00',
        buy_in: 'R$ 300,00',
        prize: 'R$ 15.000,00',
        max_players: 20
      }),
      type: 'tournament'
    },
    {
      title: 'Torneio Sit & Go',
      content: JSON.stringify({
        date: '2025-07-05',
        time: '14:00',
        buy_in: 'R$ 75,00',
        prize: 'R$ 3.000,00',
        max_players: 16
      }),
      type: 'tournament'
    }
  ];

  console.log(`Preparando para inserir ${tournaments.length} torneios...`);
  
  for (const tournament of tournaments) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .insert([tournament]);
      
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

addTournaments();
