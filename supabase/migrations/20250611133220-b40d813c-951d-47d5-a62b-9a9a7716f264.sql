
-- Inserir torneios de exemplo na tabela site_content
INSERT INTO site_content (type, title, content) VALUES 
(
  'tournament',
  'Segunda-feira Freeroll',
  '{"date": "2025-06-16", "time": "20:00", "buy_in": "Gratuito", "prize": "R$ 300,00", "max_players": 16}'
),
(
  'tournament', 
  'Terça-feira Rebuy Simples',
  '{"date": "2025-06-17", "time": "20:30", "buy_in": "R$ 30,00", "prize": "R$ 500,00", "max_players": 20}'
),
(
  'tournament',
  'Quarta-feira Freezeout',
  '{"date": "2025-06-18", "time": "21:00", "buy_in": "R$ 50,00", "prize": "R$ 800,00", "max_players": 16}'
),
(
  'tournament',
  'Quinta-feira Premium', 
  '{"date": "2025-06-19", "time": "20:00", "buy_in": "R$ 75,00", "prize": "R$ 1.200,00", "max_players": 24}'
),
(
  'tournament',
  'Sexta-feira Championship',
  '{"date": "2025-06-20", "time": "19:30", "buy_in": "R$ 100,00", "prize": "R$ 2.000,00", "max_players": 32}'
),
(
  'tournament',
  'Sábado Rebuy Duplo',
  '{"date": "2025-06-21", "time": "20:00", "buy_in": "R$ 60,00", "prize": "R$ 1.000,00", "max_players": 20}'
),
(
  'tournament',
  'Domingo Special',
  '{"date": "2025-06-22", "time": "18:00", "buy_in": "R$ 80,00", "prize": "R$ 1.500,00", "max_players": 28}'
);
