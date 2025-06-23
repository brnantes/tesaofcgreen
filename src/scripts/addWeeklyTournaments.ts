// Script para adicionar torneios para todos os dias da semana
import { supabaseAdmin } from '../integrations/supabase/client';

export const addWeeklyTournaments = async () => {
  console.log('🎲 Iniciando cadastro de torneios premium para toda a semana...');
  
  // Obter a data de hoje
  const today = new Date();
  const currentDay = today.getDay(); // 0 (domingo) até 6 (sábado)
  
  const tournaments = [];
  
  // Cria torneios para os próximos 8 dias (cobrindo toda a semana, independente do dia atual)
  for (let i = 0; i < 8; i++) {
    // Calcula a data do torneio (data atual + i dias)
    const tournamentDate = new Date(today);
    tournamentDate.setDate(today.getDate() + i);
    
    const dayOfWeek = tournamentDate.getDay();
    let tournamentName, buyIn, prize, time, maxPlayers, specialFeatures;
    
    // Configurações específicas baseadas no dia da semana
    switch (dayOfWeek) {
      case 0: // Domingo
        tournamentName = "Sunday Special - Mega Torneio";
        buyIn = "R$ 200,00";
        prize = "R$ 25.000,00 garantidos";
        time = "16:00";
        maxPlayers = 120;
        specialFeatures = "Estrutura deep stack, blinds de 30 minutos, rebuys ilimitados na primeira hora";
        break;
      case 1: // Segunda
        tournamentName = "Monday Starter - Texas Hold'em";
        buyIn = "R$ 50,00";
        prize = "R$ 3.000,00";
        time = "19:30";
        maxPlayers = 40;
        specialFeatures = "Ideal para iniciantes, ritmo moderado, acúmulo de pontos para ranking semanal";
        break;
      case 2: // Terça
        tournamentName = "Tuesday Turbo - Pot Limit Omaha";
        buyIn = "R$ 75,00";
        prize = "R$ 5.000,00";
        time = "20:00";
        maxPlayers = 30;
        specialFeatures = "Estrutura turbo, blinds de 15 minutos, buy-in com bounties";
        break;
      case 3: // Quarta
        tournamentName = "Wednesday Knockout";
        buyIn = "R$ 100,00";
        prize = "R$ 8.000,00";
        time = "19:00";
        maxPlayers = 50;
        specialFeatures = "Formato bounty knockout, R$ 50,00 por eliminação, escalas de premiação VIP";
        break;
      case 4: // Quinta
        tournamentName = "Thursday Mix - Poker Misto";
        buyIn = "R$ 80,00";
        prize = "R$ 6.000,00";
        time = "20:30";
        maxPlayers = 36;
        specialFeatures = "Alternância de variantes: Texas Hold'em, Omaha, Stud e Razz";
        break;
      case 5: // Sexta
        tournamentName = "Friday High Rollers";
        buyIn = "R$ 500,00";
        prize = "R$ 40.000,00 garantidos";
        time = "21:00";
        maxPlayers = 60;
        specialFeatures = "Entrada VIP, coquetel exclusivo, estrutura profissional, transmissão ao vivo";
        break;
      case 6: // Sábado
        tournamentName = "Saturday Royal Flush Challenge";
        buyIn = "R$ 150,00";
        prize = "R$ 15.000,00 + Bracelete Exclusivo";
        time = "18:00";
        maxPlayers = 80;
        specialFeatures = "Prêmio especial para Royal Flush (R$ 2.000 extra), rebuys até nível 8";
        break;
    }
    
    // Formatação da data para YYYY-MM-DD
    const formattedDate = tournamentDate.toISOString().split('T')[0];
    
    tournaments.push({
      type: 'tournament',
      title: tournamentName,
      content: JSON.stringify({
        date: formattedDate,
        time: time,
        buy_in: buyIn,
        prize: prize,
        max_players: maxPlayers,
        special_features: specialFeatures
      })
    });
  }
  
  console.log(`Preparando para inserir ${tournaments.length} torneios premium...`);
  
  try {
    // Inserir os novos torneios sem limpar os existentes
    let successCount = 0;
    for (const tournament of tournaments) {
      try {
        const { data, error } = await supabaseAdmin
          .from('site_content')
          .insert([tournament]);
        
        if (error) {
          console.error('Erro ao inserir torneio:', tournament.title, error);
        } else {
          console.log('✅ Torneio inserido com sucesso:', tournament.title);
          successCount++;
        }
      } catch (e) {
        console.error('Exceção ao inserir torneio:', e);
      }
      
      // Pequena pausa entre as inserções para não sobrecarregar o Supabase
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Processo concluído! ${successCount} de ${tournaments.length} torneios adicionados com sucesso!`);
    return successCount;
  } catch (error) {
    console.error('Erro fatal ao adicionar torneios:', error);
    throw error;
  }
};
