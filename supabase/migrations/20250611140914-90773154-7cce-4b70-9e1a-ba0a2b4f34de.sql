
-- Inserir torneios de exemplo na tabela site_content
INSERT INTO public.site_content (type, title, content) VALUES
  ('tournament', 'Freeroll Segunda-feira', 
   '{"date": "2025-06-16", "time": "20:00", "buy_in": "Gratuito", "prize": "R$ 500,00", "max_players": 16}'),
  
  ('tournament', 'Torneio Terça Premium', 
   '{"date": "2025-06-17", "time": "21:00", "buy_in": "R$ 30,00", "prize": "R$ 1.200,00", "max_players": 24}'),
  
  ('tournament', 'Quarta-feira All-In', 
   '{"date": "2025-06-18", "time": "19:30", "buy_in": "R$ 50,00", "prize": "R$ 2.000,00", "max_players": 32}'),
  
  ('tournament', 'Quinta Turbo', 
   '{"date": "2025-06-19", "time": "20:30", "buy_in": "R$ 25,00", "prize": "R$ 800,00", "max_players": 20}'),
  
  ('tournament', 'Sexta High Roller', 
   '{"date": "2025-06-20", "time": "21:30", "buy_in": "R$ 100,00", "prize": "R$ 5.000,00", "max_players": 18}'),
  
  ('tournament', 'Sábado Championship', 
   '{"date": "2025-06-21", "time": "15:00", "buy_in": "R$ 75,00", "prize": "R$ 3.500,00", "max_players": 28}'),
  
  ('tournament', 'Domingo Special', 
   '{"date": "2025-06-22", "time": "18:00", "buy_in": "R$ 40,00", "prize": "R$ 1.800,00", "max_players": 22}');
