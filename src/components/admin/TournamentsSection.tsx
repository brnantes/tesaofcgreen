import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTournaments } from '@/hooks/useTournaments';
import { Tournament } from '@/types/tournament';
import { Plus, RefreshCw, AlertCircle, Calendar, Trophy, Clock, Users, Edit, Trash2, Star, DollarSign } from 'lucide-react';
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
    console.log('🔍 TournamentsSection: Modo de edição?', !!editingTournament);
    console.log('🆔 TournamentsSection: ID do torneio sendo editado:', editingTournament?.id);
    
    try {
      // Verifica se estamos editando um torneio existente (tem ID) ou criando um novo
      const isEditing = editingTournament && editingTournament.id;
      
      if (isEditing) {
        console.log('🔄 TournamentsSection: Atualizando torneio existente:', editingTournament.id);
        await updateTournament(editingTournament.id, formData);
        toast({
          title: "✅ Torneio atualizado",
          description: `${formData.name} foi atualizado com sucesso!`,
          className: "bg-green-900 border-green-800 text-white",
        });
      } else {
        console.log('✨ TournamentsSection: Criando novo torneio');
        await addTournament(formData);
        toast({
          title: "✅ Torneio criado",
          description: `${formData.name} foi criado com sucesso!`,
          className: "bg-green-900 border-green-800 text-white",
        });
      }
      
      // Reseta o formulário após o sucesso
      resetForm();
      
      // Força uma atualização da lista de torneios
      console.log('🔄 TournamentsSection: Atualizando lista de torneios...');
      await refetch();
      console.log('✅ TournamentsSection: Lista de torneios atualizada');
      
    } catch (error) {
      console.error('❌ TournamentsSection: Erro ao submeter:', error);
      toast({
        title: "❌ Erro",
        description: `Não foi possível ${editingTournament ? 'atualizar' : 'criar'} o torneio. Tente novamente.`,
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
        title: "✅ Torneio excluído",
        description: "O torneio foi removido com sucesso.",
        className: "bg-green-900 border-green-800 text-white",
      });
      setDeleteConfirm(null);
    } catch (error) {
      console.error('❌ Erro ao excluir torneio:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível excluir o torneio.",
        variant: "destructive",
      });
    }
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-900">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar torneios: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Gerenciar Torneios</h2>
          <p className="text-gray-400">Crie e gerencie os torneios do clube</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={() => {
              setEditingTournament(null); // Limpa qualquer torneio em edição
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Torneio
          </Button>
        </div>
      </div>

      {/* Formulário de criação/edição */}
      {showForm && (
        <TournamentForm
          editingTournament={editingTournament}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          defaultDayOfWeek={activeDay}
        />
      )}

      {/* Tabs dos dias da semana */}
      <Tabs value={activeDay.toString()} onValueChange={(v) => setActiveDay(parseInt(v))}>
        <TabsList className="grid grid-cols-7 w-full bg-gray-800/50 border border-gray-700">
          {DAYS_OF_WEEK.map((day) => (
            <TabsTrigger
              key={day.id}
              value={day.id.toString()}
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-colors"
            >
              <span className="hidden sm:inline">{day.name}</span>
              <span className="sm:hidden">{day.short}</span>
              {tournamentsByDay[day.id].tournaments.length > 0 && (
                <Badge className="ml-2 bg-gray-700 text-gray-300">
                  {tournamentsByDay[day.id].tournaments.length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS_OF_WEEK.map((day) => (
          <TabsContent key={day.id} value={day.id.toString()} className="mt-6">
            {tournamentsByDay[day.id].tournaments.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-400 mb-4">
                    Nenhum torneio cadastrado para {day.name}
                  </p>
                  <Button
                    onClick={() => {
                      setEditingTournament(null); // Não criar objeto, apenas limpar
                      setActiveDay(day.id); // Define o dia ativo
                      setShowForm(true);
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro torneio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tournamentsByDay[day.id].tournaments.map((tournament) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:border-green-600/50 transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-white">
                                {tournament.name}
                              </h3>
                              {tournament.is_guaranteed && (
                                <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50">
                                  <Star className="w-3 h-3 mr-1" />
                                  Garantido
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4 text-green-400" />
                                <span>{tournament.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="font-semibold">{tournament.buy_in}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <span className="font-semibold text-yellow-400">{tournament.prize}</span>
                              </div>
                              {tournament.max_players && (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <Users className="w-4 h-4 text-green-400" />
                                  <span>{tournament.max_players} jogadores</span>
                                </div>
                              )}
                            </div>

                            {tournament.special_features && (
                              <p className="mt-3 text-gray-400 text-sm">
                                {tournament.special_features}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEdit(tournament)}
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(tournament.id)}
                              variant="outline"
                              size="sm"
                              className={`
                                ${deleteConfirm === tournament.id 
                                  ? 'border-red-600 text-red-400 hover:bg-red-600/20' 
                                  : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                                }
                              `}
                            >
                              <Trash2 className="w-4 h-4" />
                              {deleteConfirm === tournament.id && (
                                <span className="ml-1">Confirmar</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
