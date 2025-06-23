import { Tournament } from '@/types/tournament';

// Torneios pré-carregados para exibição quando o Supabase não funcionar
export const initialTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Segunda-feira Texas Hold\'em',
    date: 'Segunda',
    time: '19:00',
    buy_in: 'R$ 50,00',
    prize: 'R$ 2.000,00',
    max_players: 50,
    special_features: 'Re-entry permitido nas 2 primeiras horas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Terça Turbo - Omaha',
    date: 'Terça',
    time: '20:00',
    buy_in: 'R$ 100,00',
    prize: 'R$ 5.000,00',
    max_players: 30,
    special_features: 'Estrutura de blinds acelerada',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Quarta KnockOut',
    date: 'Quarta',
    time: '19:30',
    buy_in: 'R$ 75,00',
    prize: 'R$ 3.500,00',
    max_players: 40,
    special_features: 'Bounty em cada eliminação',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Quinta-feira Mix',
    date: 'Quinta',
    time: '20:30',
    buy_in: 'R$ 60,00',
    prize: 'R$ 2.500,00',
    max_players: 36,
    special_features: 'Alternância entre variantes de poker a cada 30 minutos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Sexta High Rollers',
    date: 'Sexta',
    time: '21:00',
    buy_in: 'R$ 200,00',
    prize: 'R$ 10.000,00',
    max_players: 25,
    special_features: 'Mesa final televisionada',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Sábado Royal Flush Challenge',
    date: 'Sábado',
    time: '18:00',
    buy_in: 'R$ 150,00',
    prize: 'R$ 7.500,00',
    max_players: 60,
    special_features: 'Prêmio especial para quem conseguir Royal Flush',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Domingo Special - Mega Torneio',
    date: 'Domingo',
    time: '16:00',
    buy_in: 'R$ 125,00',
    prize: 'R$ 15.000,00 garantidos',
    max_players: 100,
    special_features: 'Mesas VIP com atendimento premium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
