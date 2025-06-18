import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTournaments } from '@/hooks/useTournaments';
import { Tournament } from '@/types/tournament';
import { Plus, RefreshCw, AlertCircle, Calendar, Trophy, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { TournamentForm } from './TournamentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'DOM' },
  { id: 1, name: 'Segunda-feira', short: 'SEG' },
  { id: 2, name: 'Terça-feira', short: 'TER' },
  { id: 3, name: 'Quarta-feira', short: 'QUA' },
  { id: 4, name: 'Quinta-feira', short: 'QUI' },
  { id: 5, name: 'Sexta-feira', short: 'SEX' },
  { id: 6, name: 'Sábado', short: 'SAB' },
];

export const TournamentsSection = () => {
  const { tournaments, loading, error, addTournament, updateTournament, deleteTournament, refetch } = useTournaments();
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  // Organizar torneios por dia da semana
  const tournamentsByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    tournaments: tournaments.filter(t => (t.day_of_week ?? 0) === day.id)
  }));

  const resetForm = () => {
    setEditingTournament(null);
    setShowForm(false);
  };

  const handleSubmit = async (formData: any) => {
    console.log('💾 TournamentsSection: Submetendo formulário:', formData);
    try {
      if (editingTournament) {
        await updateTournament(editingTournament.id, formData);
        toast({
          title: "Torneio atualizado",
          description: `${formData.name} foi atualizado com sucesso!`,
        });
      } else {
        await addTournament(formData);
        toast({
          title: "Torneio criado",
          description: `${formData.name} foi criado com sucesso!`,
        });
      }
      resetForm();
      refetch();
    } catch (error) {
      console.error('❌ TournamentsSection: Erro ao submeter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o torneio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tournament: Tournament) => {
    console.log('✏️ TournamentsSection: Editando torneio:', tournament.name);
    setEditingTournament(tournament);
    setShowForm(true);
  };

  const handleDelete = async (tournamentId: string) => {
    if (deleteConfirm !== tournamentId) {
      setDeleteConfirm(tournamentId);
      setTimeout(() => setDeleteConfirm(null), 3000); // Remove confirmação após 3s
      return;
    }

    try {
      await deleteTournament(tournamentId);
      toast({
        title: "Torneio excluído",
        description: "O torneio foi excluído com sucesso!",
      });
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('❌ Erro ao excluir torneio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o torneio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    console.log('➕ TournamentsSection: Abrindo formulário para novo torneio');
    setShowForm(!showForm);
    if (showForm) resetForm();
  };

  const handleRefresh = () => {
    console.log('🔄 TournamentsSection: Atualizando lista de torneios');
    refetch();
  };

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <Card className="bg-poker-black/50 border-poker-gold/30 hover:border-poker-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-poker-gold/20 hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{tournament.name}</h4>
            {tournament.description && (
              <p className="text-sm text-gray-400 mb-2">{tournament.description}</p>
            )}
          </div>
          <div className="flex gap-2 ml-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(tournament)}
                className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/20 hover:border-poker-gold hover:shadow-md hover:shadow-poker-gold/30 p-2 transition-all duration-300 group"
              >
                <Edit className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(tournament.id)}
                className={`p-2 transition-all duration-300 group ${
                  deleteConfirm === tournament.id
                    ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                    : 'border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:shadow-md hover:shadow-red-500/30'
                }`}
              >
                <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-poker-gold" />
            <span>{tournament.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-poker-gold" />
            <span>{tournament.max_players} jogadores</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <span className="text-xs">Buy-in:</span>
            <span className="font-semibold">{tournament.buy_in}</span>
          </div>
          <div className="flex items-center gap-2 text-poker-gold">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{tournament.prize}</span>
            {tournament.is_guaranteed && (
              <Badge variant="secondary" className="text-xs bg-poker-gold/20 text-poker-gold">
                GTD
              </Badge>
            )}
          </div>
        </div>

        {deleteConfirm === tournament.id && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Clique novamente para confirmar exclusão
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-poker-gold mb-4">Carregando torneios...</div>
        <div className="text-sm text-gray-400">Conectando à base de dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-400">
          Erro ao carregar torneios: {error}
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="ml-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card className="bg-poker-gray-medium border-poker-gold/20 hover:border-poker-gold/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-poker-gold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendário de Torneios ({tournaments.length} cadastrados)
            </CardTitle>
            <div className="mt-2 text-sm text-gray-400">
              Organize torneios por dia da semana para exibição automática na landing page
            </div>
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10 hover:border-poker-gold hover:shadow-lg hover:shadow-poker-gold/20 transition-all duration-300 group"
              >
                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Atualizar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddNew}
                className="bg-poker-gold text-poker-black hover:bg-poker-gold-light hover:shadow-lg hover:shadow-poker-gold/40 font-semibold transition-all duration-300 group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Novo Torneio
              </Button>
            </motion.div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs por dia da semana */}
      <Tabs value={activeDay.toString()} onValueChange={(value) => setActiveDay(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-7 bg-poker-gray-medium border border-poker-gold/20">
          {DAYS_OF_WEEK.map((day) => {
            const dayTournaments = tournamentsByDay.find(d => d.id === day.id)?.tournaments || [];
            const isToday = day.id === new Date().getDay();
            
            return (
              <motion.div key={day.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TabsTrigger 
                  value={day.id.toString()}
                  className={`data-[state=active]:bg-poker-gold data-[state=active]:text-poker-black relative transition-all duration-300 hover:bg-poker-gold/20 ${
                    isToday ? 'ring-2 ring-green-500/50 ring-offset-2 ring-offset-poker-gray-medium' : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{day.short}</div>
                    <div className="text-xs opacity-75">
                      {dayTournaments.length} torneio{dayTournaments.length !== 1 ? 's' : ''}
                    </div>
                    {isToday && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                      />
                    )}
                  </div>
                </TabsTrigger>
              </motion.div>
            );
          })}
        </TabsList>

        {DAYS_OF_WEEK.map((day) => {
          const dayTournaments = tournamentsByDay.find(d => d.id === day.id)?.tournaments || [];
          
          return (
            <TabsContent key={day.id} value={day.id.toString()} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  {day.name}
                  {day.id === new Date().getDay() && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">HOJE</Badge>
                    </motion.div>
                  )}
                </h3>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => {
                      setEditingTournament({ day_of_week: day.id } as Tournament);
                      setShowForm(true);
                    }}
                    size="sm"
                    className="bg-poker-gold/20 text-poker-gold hover:bg-poker-gold/30 border border-poker-gold/30 hover:border-poker-gold hover:shadow-lg hover:shadow-poker-gold/20 transition-all duration-300 group"
                  >
                    <Plus className="w-4 h-4 mr-1 group-hover:rotate-90 transition-transform duration-200" />
                    Adicionar para {day.short}
                  </Button>
                </motion.div>
              </div>

              {dayTournaments.length === 0 ? (
                <Card className="bg-poker-black/30 border-poker-gold/20 border-dashed hover:border-poker-gold/40 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-400 mb-4">Nenhum torneio cadastrado para {day.name}</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => {
                          setEditingTournament({ day_of_week: day.id } as Tournament);
                          setShowForm(true);
                        }}
                        variant="outline"
                        className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10 hover:border-poker-gold hover:shadow-lg hover:shadow-poker-gold/20 transition-all duration-300 group"
                      >
                        <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                        Criar primeiro torneio
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {dayTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Formulário de criação/edição */}
      {showForm && (
        <TournamentForm
          editingTournament={editingTournament}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}
    </div>
  );
};
