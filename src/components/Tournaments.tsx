import { useState, useEffect, useMemo } from 'react';
import { useTournaments } from '@/hooks/useTournaments';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CreditCard, Flame, Trophy, User, Zap, Star, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Tournaments = () => {
  const { tournaments, loading } = useTournaments();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gameOfTheDay, setGameOfTheDay] = useState<any>(null);
  const activeDay = useMemo(() => selectedDate.getDay(), [selectedDate]);

  // Dias da semana para navegação
  const weekDays = [
    { day: 'Dom', full: 'Domingo' },
    { day: 'Seg', full: 'Segunda' },
    { day: 'Ter', full: 'Terça' },
    { day: 'Qua', full: 'Quarta' },
    { day: 'Qui', full: 'Quinta' },
    { day: 'Sex', full: 'Sexta' },
    { day: 'Sáb', full: 'Sábado' },
  ];

  console.log('🏆 Tournaments Component - Estado:');
  console.log('   📊 tournaments:', tournaments);
  console.log('   📊 tournaments.length:', tournaments.length);
  console.log('   ⏳ loading:', loading);
  
  // Agrupar torneios por dia da semana - criamos um array fixo de 7 posições (uma para cada dia)
  const tournamentsByDay = Array(7).fill(0).map(() => []);
  
  // Usar a data atual do sistema em vez de uma data fixa
  const today = new Date(); // Data atual do sistema
  
  // Para armazenar as datas que têm torneios (para destacar no calendário)
  const [tournamentDates, setTournamentDates] = useState([]);
  
  // Efeito para selecionar o jogo do dia e agrupar os torneios por dia
  useEffect(() => {
    if (!tournaments || tournaments.length === 0) {
      console.log('⚠️ Nenhum torneio disponível');
      setGameOfTheDay(null);
      return;
    }
    
    console.log('🔄 Tournaments Component: Processando', tournaments.length, 'torneios');
    
    // Resetar os arrays de agrupamento por dia
    for (let i = 0; i < 7; i++) {
      tournamentsByDay[i] = [];
    }
    
    // Armazenar todas as datas com torneios para destacar no calendário
    const dates = [];
    
    // Processar cada torneio e agrupá-los por dia da semana
    tournaments.forEach(tournament => {
      try {
        // Determinar o dia da semana do torneio
        let day;
        
        // Se o torneio tem uma data específica em formato ISO
        if (tournament.date && tournament.date.includes('-')) {
          const tournamentDate = new Date(tournament.date);
          day = tournamentDate.getDay();
          
          // Adicionar à lista de datas para o calendário
          dates.push(tournamentDate);
        } 
        // Se o torneio tem um dia fixo da semana como string (ex: "Segunda")
        else if (typeof tournament.date === 'string') {
          const dayLower = tournament.date.toLowerCase();
          if (dayLower.includes('domingo')) day = 0;
          else if (dayLower.includes('segunda')) day = 1;
          else if (dayLower.includes('terça') || dayLower.includes('terca')) day = 2;
          else if (dayLower.includes('quarta')) day = 3;
          else if (dayLower.includes('quinta')) day = 4;
          else if (dayLower.includes('sexta')) day = 5;
          else if (dayLower.includes('sábado') || dayLower.includes('sabado')) day = 6;
          else day = 0; // Padrão para domingo em caso de erro
        } else {
          // Se não conseguimos determinar o dia, vamos assumir domingo
          day = 0;
        }
        
        // Adicionar regras especiais para segunda e sexta
        const isFreeDay = day === 1 || day === 5; // Segunda ou Sexta
        
        const processedTournament = {
          ...tournament,
          special_features: isFreeDay
            ? (tournament.special_features || '') + 
              '\n⭐ Free com registro tardio até o final do nível 7\n' +
              '⭐ Entrada free até o final do nível 3'
            : tournament.special_features
        };
        
        // Adicionar ao array do dia correspondente
        tournamentsByDay[day].push(processedTournament);
        
        // Para debug
        console.log(`✅ Torneio "${tournament.name}" agrupado no dia ${day} (${weekDays[day]?.full})`);
      } catch (error) {
        console.error(`❌ Erro ao processar torneio: ${tournament.name}`, error);
      }
    });
    
    // Verificar distribuição dos torneios por dia
    console.log('📊 Distribuição de torneios por dia:');
    for (let i = 0; i < 7; i++) {
      console.log(`   ${weekDays[i].full}: ${tournamentsByDay[i].length} torneios`);
    }
    
    // Atualizar as datas com torneios para o calendário
    setTournamentDates(dates);
    
    // Encontrar o jogo do dia (prioridade para o dia selecionado)
    const selectedDayTournaments = tournamentsByDay[selectedDate.getDay()];
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    if (selectedDayTournaments && selectedDayTournaments.length > 0) {
      // Seleciona o primeiro torneio do dia selecionado
      setGameOfTheDay(selectedDayTournaments[0]);
      console.log(`🌟 Jogo do dia para ${dias[selectedDate.getDay()]}: ${selectedDayTournaments[0].name}`);
    } else {
      // Procurar o próximo dia com torneios
      let nextDayWithTournament = null;
      let daysChecked = 0;
      
      // Verificar os próximos 7 dias
      while (!nextDayWithTournament && daysChecked < 7) {
        daysChecked++;
        const nextDay = (selectedDate.getDay() + daysChecked) % 7;
        if (tournamentsByDay[nextDay].length > 0) {
          nextDayWithTournament = tournamentsByDay[nextDay][0];
          console.log(`🌟 Próximo torneio encontrado: ${nextDayWithTournament.name} (${dias[nextDay]})`);
          break;
        }
      }
      
      if (nextDayWithTournament) {
        setGameOfTheDay(nextDayWithTournament);
      } else if (tournaments.length > 0) {
        // Se não encontrou nenhum torneio nos próximos dias, usa o primeiro disponível
        setGameOfTheDay(tournaments[0]);
        console.log(`🌟 Nenhum torneio encontrado nos próximos dias. Usando o primeiro disponível: ${tournaments[0].name}`);
      } else {
        setGameOfTheDay(null);
        console.log('⚠️ Nenhum torneio disponível para exibir como jogo do dia');
      }
    }
    
  }, [tournaments, selectedDate]);

  const formatDate = (dateString: string) => {
    try {
      // Verificar se é uma data no formato ISO
      if (dateString && dateString.includes('-')) {
        const date = new Date(dateString);
        // Verificar se a data é válida
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        }
      }
      
      // Se não é formato ISO ou é inválida, retornar a data como está
      // Mas verificar se tem alguma data separada por /
      if (dateString && dateString.includes('/')) {
        return dateString; // Já está formatada
      }
      
      // Para strings como 'Segunda', 'Terça', etc
      if (typeof dateString === 'string' && !dateString.includes('-') && !dateString.includes('/')) {
        const hoje = new Date();
        return hoje.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      
      return dateString;
    } catch (error) {
      console.error('Erro ao formatar data:', error, dateString);
      return dateString;
    }
  };
  
  const formatDayMonth = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    } catch (error) {
      console.error('Erro ao formatar data curta:', error, dateString);
      return dateString;
    }
  };

  const getDayOfWeek = (dateString: string) => {
    try {
      // Verificar se é uma data no formato ISO
      if (dateString && dateString.includes('-')) {
        const date = new Date(dateString);
        // Verificar se a data é válida
        if (!isNaN(date.getTime())) {
          const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
          return days[date.getDay()];
        }
      }
      
      // Se a string já contém o nome do dia
      const dayLower = dateString.toLowerCase();
      if (dayLower.includes('domingo')) return 'Domingo';
      if (dayLower.includes('segunda')) return 'Segunda-feira';
      if (dayLower.includes('terça') || dayLower.includes('terca')) return 'Terça-feira';
      if (dayLower.includes('quarta')) return 'Quarta-feira';
      if (dayLower.includes('quinta')) return 'Quinta-feira';
      if (dayLower.includes('sexta')) return 'Sexta-feira';
      if (dayLower.includes('sábado') || dayLower.includes('sabado')) return 'Sábado';
      
      return 'Hoje';
    } catch (error) {
      console.error('Erro ao obter dia da semana:', error, dateString);
      return 'Hoje';
    }
  };

  const isToday = (dateString: string) => {
    try {
      const today = new Date();
      const tournamentDate = new Date(dateString);
      return today.toDateString() === tournamentDate.toDateString();
    } catch (error) {
      return false;
    }
  };

  const isUpcoming = (dateString: string) => {
    try {
      const today = new Date();
      const tournamentDate = new Date(dateString);
      return tournamentDate > today;
    } catch (error) {
      return false;
    }
  };

  // Configurações de animação com tipagem correta para framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  } as const;
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  } as const;
  
  // Estado de carregamento
  if (loading) {
    return (
      <div id="tournaments" className="py-20 bg-poker-black relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-[url('/assets/poker-table-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-poker-black/0 via-poker-black/80 to-poker-black"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-poker-gold/5 blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 rounded-full bg-poker-gold/10 blur-3xl"></div>
        
        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Calendário de Torneios
            </h2>
            <p className="text-xl text-gray-300">
              Confira o jogo do dia e reserve seu lugar
            </p>
          </motion.div>
          
          {/* Calendário e navegação */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-center mb-2">
              <h3 className="text-2xl font-bold text-poker-gold">
                <span className="text-white bg-poker-gold px-2 py-1 rounded mr-2">Hoje</span>
                {(() => {
                  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                  const dia = dias[selectedDate.getDay()];
                  const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
                  return `${dia}, ${dataFormatada} - Programação de Torneios`;
                })()}
              </h3>
            </div>
            
            <div className="bg-poker-gray-dark/50 p-4 rounded-lg border border-poker-gold/20 backdrop-blur-sm mb-6">
              <div className="custom-calendar-container">
                <style dangerouslySetInnerHTML={{ __html: `
                  .react-datepicker {
                    background-color: #1a1a1a !important;
                    border: 1px solid rgba(212, 175, 55, 0.3) !important;
                    border-radius: 0.5rem !important;
                    font-family: inherit !important;
                    color: white !important;
                  }
                  .react-datepicker__header {
                    background-color: #222222 !important;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
                    color: white !important;
                  }
                  .react-datepicker__current-month, 
                  .react-datepicker__day-name {
                    color: white !important;
                  }
                  .react-datepicker__day {
                    color: #e0e0e0 !important;
                    border-radius: 0.25rem !important;
                  }
                  .react-datepicker__day:hover {
                    background-color: rgba(212, 175, 55, 0.3) !important;
                  }
                  .react-datepicker__day--selected {
                    background-color: #d4af37 !important;
                    color: black !important;
                    font-weight: bold !important;
                  }
                  .react-datepicker__day--today {
                    border: 1px solid rgba(212, 175, 55, 0.7) !important;
                    font-weight: bold !important;
                  }
                  .react-datepicker__day--highlighted {
                    background-color: rgba(212, 175, 55, 0.2) !important;
                    color: #d4af37 !important;
                    font-weight: 600 !important;
                  }
                  .react-datepicker__navigation-icon::before {
                    border-color: #d4af37 !important;
                  }
                  .react-datepicker__navigation:hover *::before {
                    border-color: white !important;
                  }
                ` }} />
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-poker-gold flex items-center gap-2">
                    <span>Calendário de Torneios</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold hover:text-poker-black"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Hoje
                    </Button>
                  </div>
                </div>
                
                {/* Código duplicado do calendário removido */}
                
                {/* Calendário removido */}
                
                {/* Botão para ver todos os torneios */}
                <div className="flex justify-center mt-8">
                  <Button 
                    className="bg-poker-gold hover:bg-poker-gold-light text-poker-black px-8 py-6 text-lg font-bold"
                  >
                    Ver Todos os Torneios
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Destaque do Torneio do Dia */}
          {gameOfTheDay && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-poker-gold/20 to-poker-gold/5 p-6 rounded-xl border-2 border-poker-gold/30 backdrop-blur-sm">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-poker-gold flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 animate-pulse" />
                    TORNEIO EM DESTAQUE
                    <Star className="w-6 h-6 animate-pulse" />
                  </h3>
                </div>
                
                <Card className="bg-poker-gray-dark/70 border-poker-gold/40 shadow-2xl shadow-poker-gold/20">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-8 h-8 text-poker-gold" />
                      <CardTitle className="text-3xl font-bold text-white">
                        {gameOfTheDay.name}
                      </CardTitle>
                      <Trophy className="w-8 h-8 text-poker-gold" />
                    </div>
                    {gameOfTheDay.subtitle && (
                      <p className="text-lg text-poker-gold/80 font-medium">
                        {gameOfTheDay.subtitle}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                        <div className="font-bold text-white text-lg">{gameOfTheDay.time || '19:30'}</div>
                        <div className="text-sm text-gray-400">Horário</div>
                      </div>
                      
                      <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                        <div className="font-bold text-white text-lg">{gameOfTheDay.buyin || 'R$ 50'}</div>
                        <div className="text-sm text-gray-400">Buy-in</div>
                      </div>
                      
                      <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                        <Trophy className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                        <div className="font-bold text-white text-lg">{gameOfTheDay.guaranteed_prize || 'R$ 500'}</div>
                        <div className="text-sm text-gray-400">Premiação Garantida</div>
                      </div>
                      
                      <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                        <User className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                        <div className="font-bold text-white text-lg">{gameOfTheDay.players || '9 max'}</div>
                        <div className="text-sm text-gray-400">Jogadores</div>
                      </div>
                    </div>
                    
                    {gameOfTheDay.description && (
                      <div className="text-center p-4 bg-poker-black/30 rounded-lg">
                        <p className="text-gray-300 leading-relaxed">
                          {gameOfTheDay.description}
                        </p>
                      </div>
                    )}
                    
                    {gameOfTheDay.special_features && (
                      <div className="bg-poker-gold/10 p-4 rounded-lg border-l-4 border-poker-gold">
                        <h4 className="font-bold text-poker-gold mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Características Especiais
                        </h4>
                        <div className="text-sm text-gray-300 whitespace-pre-line">
                          {gameOfTheDay.special_features}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-center pt-6">
                    <Button className="bg-poker-gold hover:bg-poker-gold-light text-poker-black font-bold px-8 py-3 text-lg transform transition-all hover:scale-105 shadow-lg hover:shadow-poker-gold/40">
                      <Trophy className="w-5 h-5 mr-2" />
                      Reservar Mesa
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          )}
          
          {/* Botão para ver todos os torneios */}
          <div className="flex justify-center mt-8">
            <Button 
              className="bg-poker-gold hover:bg-poker-gold-light text-poker-black px-8 py-6 text-lg font-bold"
            >
              Ver Todos os Torneios
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    console.log('⚠️ Tournaments Component: Nenhum torneio para exibir');
    return (
      <div id="tournaments" className="py-20 bg-poker-black relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-[url('/assets/poker-table-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-poker-black/0 via-poker-black/80 to-poker-black"></div>
        
        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Torneios emocionantes todas as semanas
            </h2>
            <p className="text-xl text-gray-300">
              Competições que elevam o nível do seu jogo
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-poker-gold/5 animate-pulse"></div>
              <div className="absolute -inset-4 rounded-full bg-poker-gold/10 animate-ping"></div>
              <Trophy className="w-24 h-24 text-poker-gold/70 relative z-10" />
            </div>
            
            <div className="mt-8 text-center max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-poker-gold mb-4">Novos torneios em breve!</h3>
              <p className="text-xl text-gray-300 mb-6">Estamos preparando experiências únicas para os amantes de poker.</p>
              <p className="text-gray-400 mb-10">Fique atento às nossas redes sociais para ser o primeiro a saber quando novos torneios forem anunciados.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-poker-gray-medium/50 border border-poker-gold/20 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <Flame className="w-12 h-12 mx-auto text-poker-gold mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Torneios Diários</h4>
                    <p className="text-gray-400">Em breve, torneios todos os dias da semana com prêmios incríveis</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-poker-gray-medium/50 border border-poker-gold/20 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <Award className="w-12 h-12 mx-auto text-poker-gold mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Campeonatos Mensais</h4>
                    <p className="text-gray-400">Grandes prêmios e reconhecimento para os melhores jogadores</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-poker-gray-medium/50 border border-poker-gold/20 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <Star className="w-12 h-12 mx-auto text-poker-gold mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Eventos VIP</h4>
                    <p className="text-gray-400">Experiências exclusivas para membros especiais do clube</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Organizar torneios por data/hora para encontrar o próximo
  const sortedTournaments = tournaments.sort((a, b) => {
    try {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    } catch (error) {
      return 0;
    }
  });

  console.log('🎯 Tournaments Component: Renderizando', sortedTournaments.length, 'torneios');

  return (
    <div id="tournaments" className="py-20 bg-poker-black relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-[url('/assets/poker-table-bg.jpg')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-poker-black/0 via-poker-black/80 to-poker-black"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-poker-gold/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-64 h-64 rounded-full bg-poker-gold/10 blur-3xl"></div>
      
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Calendário de Torneios
          </h2>
          <p className="text-xl text-gray-300">
            Confira o jogo do dia e reserve seu lugar
          </p>
        </motion.div>
        
        {/* Destaque do Torneio do Dia */}
        {gameOfTheDay && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-poker-gold/20 to-poker-gold/5 p-6 rounded-xl border-2 border-poker-gold/30 backdrop-blur-sm">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-poker-gold flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 animate-pulse" />
                  TORNEIO EM DESTAQUE
                  <Star className="w-6 h-6 animate-pulse" />
                </h3>
              </div>
              
              <Card className="bg-poker-gray-dark/70 border-poker-gold/40 shadow-2xl shadow-poker-gold/20">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-8 h-8 text-poker-gold" />
                    <CardTitle className="text-3xl font-bold text-white">
                      {gameOfTheDay.name}
                    </CardTitle>
                    <Trophy className="w-8 h-8 text-poker-gold" />
                  </div>
                  {gameOfTheDay.subtitle && (
                    <p className="text-lg text-poker-gold/80 font-medium">
                      {gameOfTheDay.subtitle}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                      <div className="font-bold text-white text-lg">{gameOfTheDay.time || '19:30'}</div>
                      <div className="text-sm text-gray-400">Horário</div>
                    </div>
                    
                    <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                      <CreditCard className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                      <div className="font-bold text-white text-lg">{gameOfTheDay.buyin || 'R$ 50'}</div>
                      <div className="text-sm text-gray-400">Buy-in</div>
                    </div>
                    
                    <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                      <Trophy className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                      <div className="font-bold text-white text-lg">{gameOfTheDay.guaranteed_prize || 'R$ 500'}</div>
                      <div className="text-sm text-gray-400">Premiação Garantida</div>
                    </div>
                    
                    <div className="text-center p-4 bg-poker-gray-medium/50 rounded-lg border border-poker-gold/20">
                      <User className="w-6 h-6 mx-auto mb-2 text-poker-gold" />
                      <div className="font-bold text-white text-lg">{gameOfTheDay.players || '9 max'}</div>
                      <div className="text-sm text-gray-400">Jogadores</div>
                    </div>
                  </div>
                  
                  {gameOfTheDay.description && (
                    <div className="text-center p-4 bg-poker-black/30 rounded-lg">
                      <p className="text-gray-300 leading-relaxed">
                        {gameOfTheDay.description}
                      </p>
                    </div>
                  )}
                  
                  {gameOfTheDay.special_features && (
                    <div className="bg-poker-gold/10 p-4 rounded-lg border-l-4 border-poker-gold">
                      <h4 className="font-bold text-poker-gold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Características Especiais
                      </h4>
                      <div className="text-sm text-gray-300 whitespace-pre-line">
                        {gameOfTheDay.special_features}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-center pt-6">
                  <Button className="bg-poker-gold hover:bg-poker-gold-light text-poker-black font-bold px-8 py-3 text-lg transform transition-all hover:scale-105 shadow-lg hover:shadow-poker-gold/40">
                    <Trophy className="w-5 h-5 mr-2" />
                    Reservar Mesa
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}
        
        {/* Botão para ver todos os torneios */}
        <div className="flex justify-center mt-8">
          <Button 
            className="bg-poker-gold hover:bg-poker-gold-light text-poker-black px-8 py-6 text-lg font-bold"
          >
            Ver Todos os Torneios
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
