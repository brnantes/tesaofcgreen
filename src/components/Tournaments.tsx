import { useTournaments } from '@/hooks/useTournaments';
import { useSiteImages } from '@/hooks/useSiteImages';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CreditCard, Trophy, Users, Star, Calendar, Timer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'DOM' },
  { id: 1, name: 'Segunda-feira', short: 'SEG' },
  { id: 2, name: 'Terça-feira', short: 'TER' },
  { id: 3, name: 'Quarta-feira', short: 'QUA' },
  { id: 4, name: 'Quinta-feira', short: 'QUI' },
  { id: 5, name: 'Sexta-feira', short: 'SEX' },
  { id: 6, name: 'Sábado', short: 'SAB' },
];

const Tournaments = () => {
  const { tournaments, loading: loadingTournaments, error } = useTournaments();
  const { getImageUrl, loading: loadingImages } = useSiteImages();
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const currentDay = new Date().getDay();

  // Organizar torneios por dia da semana usando o novo campo day_of_week
  const tournamentsByDay = useMemo(() => {
    return DAYS_OF_WEEK.map(day => ({
      ...day,
      tournaments: tournaments.filter(t => (t.day_of_week ?? 0) === day.id)
    }));
  }, [tournaments]);

  // Encontrar o torneio destaque do dia atual
  const todaysTournament = useMemo(() => {
    const todaysData = tournamentsByDay.find(d => d.id === currentDay);
    return todaysData?.tournaments[0] || null;
  }, [tournamentsByDay, currentDay]);

  // Avançar automaticamente para o próximo dia à meia-noite
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      setActiveDay(new Date().getDay());
      // Recarregar a página ou atualizar dados se necessário
      window.location.reload();
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  if (loadingTournaments || loadingImages) {
    return (
      <section id="tournaments" className="py-20 bg-gradient-to-b from-poker-black to-poker-gray-dark">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse text-poker-gold mb-4">Carregando torneios...</div>
        </div>
      </section>
    );
  }

  return (
    <div id="tournaments" className="relative py-24 min-h-screen">
      {/* Imagem de fundo com overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={getImageUrl('tournaments_background', '/lovable-uploads/a51d0bdb-8cb1-4dcb-80a0-90df1afb8b1b.png')} 
          alt="Fundo de torneios" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-poker-black/90 via-poker-gray-dark/90 to-poker-black/90"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 max-w-7xl">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Torneios de Poker</h2>
          <p className="text-xl text-gray-400">Participe dos melhores torneios da região</p>
        </div>

        {/* Navegação dos dias da semana */}
        <div className="bg-poker-black/50 backdrop-blur-sm rounded-xl p-6 mb-12 shadow-xl border border-poker-gold/20">
          <div className="grid grid-cols-7 gap-4">
            {tournamentsByDay.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 ${activeDay === day.id
                  ? 'bg-poker-gold/20 text-poker-gold shadow-lg shadow-poker-gold/10'
                  : 'hover:bg-poker-black/50 text-gray-400 hover:text-white'
                  }`}
              >
                <span className="text-sm font-medium mb-1">{day.name}</span>
                <span className="text-xs opacity-75">
                  {day.tournaments.length} torneio{day.tournaments.length !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Área do torneio em destaque */}
        {todaysTournament && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-poker-gold/10 via-poker-black/50 to-poker-gold/10 rounded-2xl p-8 border border-poker-gold/30 shadow-2xl">
              <TournamentCard tournament={todaysTournament} isHighlighted={true} />
            </div>
          </motion.div>
        )}

        {/* Lista de torneios do dia */}
        {(function() {
          const dayData = tournamentsByDay.find(d => d.id === activeDay);
          const dayTournaments = dayData?.tournaments || [];

          if (dayTournaments.length === 0) {
            return (
              <motion.div
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-poker-black/30 border-poker-gold/20 border-dashed rounded-xl overflow-hidden">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      Nenhum torneio em {dayData?.name}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Verifique outros dias da semana ou entre em contato para mais informações.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }

          if (todaysTournament) {
            return null;
          }

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white flex items-center justify-center gap-3 mb-3">
                  {activeDay === currentDay && (
                    <Badge className="bg-green-500/20 text-green-400 text-sm px-3 py-1">HOJE</Badge>
                  )}
                  {dayData?.name}
                </h3>
                <p className="text-xl text-gray-400">
                  {dayTournaments.length} torneio{dayTournaments.length !== 1 ? 's' : ''} disponível{dayTournaments.length !== 1 ? 'is' : ''}
                </p>
              </div>

              <div className="grid gap-8 max-w-5xl mx-auto">
                {dayTournaments.map((tournament, index) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-poker-black/40 rounded-xl p-6 border border-poker-gold/10 hover:border-poker-gold/30 transition-all duration-300"
                  >
                    <TournamentCard 
                      tournament={tournament} 
                      isHighlighted={false}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
};

const TournamentCard = ({ tournament, isHighlighted = false }) => {
  if (!tournament) return null;
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border ${
        isHighlighted 
          ? 'border-poker-gold bg-gradient-to-br from-poker-gold/20 to-transparent' 
          : 'border-poker-gold/30 bg-poker-black/50'
      } backdrop-blur-sm`}
    >
      {isHighlighted && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-poker-gold text-poker-black font-semibold">
            DESTAQUE
          </Badge>
        </div>
      )}
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <Trophy className="w-10 h-10 text-poker-gold" />
        <div>
          <CardTitle className="text-2xl text-white mb-1">
            {tournament.name}
          </CardTitle>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            {tournament.time}
            <Users className="w-4 h-4 ml-4" />
            {tournament.players} jogadores
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-3 mb-3">
          <Badge className="bg-poker-gold/20 text-poker-gold">
            Buy-in: R$ {tournament.buy_in}
          </Badge>
          <Badge className="bg-poker-gold/10 text-poker-gold">
            Premiação: R$ {tournament.prize}
          </Badge>
          {tournament.rebuy && (
            <Badge className="bg-green-500/20 text-green-400">
              Rebuy disponível
            </Badge>
          )}
        </div>
        <div className="text-gray-300 text-base mb-2">
          {tournament.description}
        </div>
        {tournament.link && (
          <Button asChild className="mt-4 bg-poker-gold text-poker-black hover:bg-poker-gold/80">
            <a href={tournament.link} target="_blank" rel="noopener noreferrer">
              Saiba mais <ChevronRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        )}
      </CardContent>
    </motion.div>
  );
};

export default Tournaments;