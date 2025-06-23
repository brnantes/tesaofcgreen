
-- Primeiro, vamos verificar se existem torneios e depois inserir os dados de exemplo
INSERT INTO site_content (type, title, content) VALUES 
('tournament', 'Segunda-feira Freeroll', '{"date": "2025-06-16", "time": "20:00", "buy_in": "Gratuito", "prize": "R$ 300,00", "max_players": 16}'),
('tournament', 'Terça-feira Rebuy Simples', '{"date": "2025-06-17", "time": "20:30", "buy_in": "R$ 30,00", "prize": "R$ 480,00", "max_players": 16}'),
('tournament', 'Quarta-feira Freezeout', '{"date": "2025-06-18", "time": "20:00", "buy_in": "R$ 50,00", "prize": "R$ 800,00", "max_players": 16}'),
('tournament', 'Quinta-feira Rebuy Duplo', '{"date": "2025-06-19", "time": "20:30", "buy_in": "R$ 60,00", "prize": "R$ 960,00", "max_players": 16}'),
('tournament', 'Sexta-feira Premium', '{"date": "2025-06-20", "time": "21:00", "buy_in": "R$ 100,00", "prize": "R$ 1.600,00", "max_players": 16}'),
('tournament', 'Sábado Championship', '{"date": "2025-06-21", "time": "19:00", "buy_in": "R$ 150,00", "prize": "R$ 2.400,00", "max_players": 16}'),
('tournament', 'Domingo Especial', '{"date": "2025-06-22", "time": "18:00", "buy_in": "R$ 80,00", "prize": "R$ 1.280,00", "max_players": 16}')
ON CONFLICT DO NOTHING;
