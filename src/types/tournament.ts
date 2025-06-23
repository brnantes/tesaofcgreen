export interface Tournament {
  id: string;
  name: string;
  date?: string; // Opcional para manter compatibilidade
  day_of_week?: number; // 0 = Domingo, 1 = Segunda, etc.
  time: string;
  buy_in: string;
  prize: string;
  max_players?: number; // Tornado opcional
  description?: string;
  is_guaranteed?: boolean;
  special_features?: string; // Mantido para compatibilidade
  created_at: string;
  updated_at: string;
}

export type TournamentData = Omit<Tournament, 'id' | 'created_at' | 'updated_at'>;
