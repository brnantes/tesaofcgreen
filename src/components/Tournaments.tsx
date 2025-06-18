import { useState, useEffect, useMemo } from 'react';
import { useTournaments } from '@/hooks/useTournaments';
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
  const { tournaments, loading } = useTournaments();
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

  const TournamentCard = ({ tournament, isHighlighted = false }) => (
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
            DESTAQUE HOJE
          </Badge>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
            {tournament.description && (
              <p className="text-sm text-gray-400">{tournament.description}</p>
            )}
          </div>
          {tournament.is_guaranteed && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              GARANTIDO
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-poker-gold" />
            <span className="text-sm">{tournament.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-poker-gold" />
            <span className="text-sm">{tournament.max_players} jogadores</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-semibold">{tournament.buy_in}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-poker-gold" />
            <span className="text-sm text-poker-gold font-semibold">{tournament.prize}</span>
          </div>
        </div>

        {tournament.special_features && (
          <div className="text-xs text-gray-400 bg-poker-black/30 p-3 rounded">
            {tournament.special_features}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <section id="tournaments" className="py-20 bg-gradient-to-b from-poker-black to-poker-gray-dark">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse text-poker-gold mb-4">Carregando torneios...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="tournaments" className="py-20 bg-gradient-to-b from-poker-black to-poker-gray-dark">
      <div className="container mx-auto px-4">
        {/* Header com destaque do dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Torneios <span className="text-poker-gold">Premium</span>
          </h2>
          
          {todaysTournament ? (
            <div className="mb-8">
              <p className="text-xl text-gray-300 mb-6">
                Destaque de <span className="text-poker-gold font-semibold">
                  {DAYS_OF_WEEK[currentDay].name}
                </span>
              </p>
              <div className="max-w-2xl mx-auto">
                <TournamentCard tournament={todaysTournament} isHighlighted={true} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 mb-8">
              Calendário semanal de torneios - {tournaments.length} torneios cadastrados
            </p>
          )}
        </motion.div>

        {/* Navegação por dias da semana */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-poker-gray-medium rounded-lg p-2 gap-1">
            {DAYS_OF_WEEK.map((day) => {
              const dayTournaments = tournamentsByDay.find(d => d.id === day.id)?.tournaments || [];
              const isToday = day.id === currentDay;
              const isActive = day.id === activeDay;
              
              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-poker-gold text-poker-black'
                      : isToday
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-poker-gold/10'
                  }`}
                >
                  <div className="text-center">
                    <div>{day.short}</div>
                    <div className="text-xs opacity-75">
                      {dayTournaments.length}
                    </div>
                  </div>
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de torneios do dia selecionado */}
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const dayData = tournamentsByDay.find(d => d.id === activeDay);
            const dayTournaments = dayData?.tournaments || [];
            
            if (dayTournaments.length === 0) {
              return (
                <Card className="bg-poker-black/30 border-poker-gold/20 border-dashed max-w-2xl mx-auto">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Nenhum torneio em {dayData?.name}
                    </h3>
                    <p className="text-gray-400">
                      Verifique outros dias da semana ou entre em contato para mais informações.
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
                    {dayData?.name}
                    {activeDay === currentDay && (
                      <Badge className="bg-green-500/20 text-green-400">HOJE</Badge>
                    )}
                  </h3>
                  <p className="text-gray-400 mt-2">
                    {dayTournaments.length} torneio{dayTournaments.length !== 1 ? 's' : ''} disponível{dayTournaments.length !== 1 ? 'is' : ''}
                  </p>
                </div>
                
                <div className="grid gap-6 max-w-4xl mx-auto">
                  {dayTournaments.map((tournament, index) => (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TournamentCard 
                        tournament={tournament} 
                        isHighlighted={activeDay === currentDay && index === 0}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-6">
            Pronto para participar dos melhores torneios de poker?
          </p>
          <Button 
            size="lg" 
            className="bg-poker-gold text-poker-black hover:bg-poker-gold-light font-semibold px-8"
          >
            Entre em Contato
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Tournaments;
