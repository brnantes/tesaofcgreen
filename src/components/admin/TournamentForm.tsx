import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tournament, TournamentData } from '@/types/tournament';
import { Calendar, Clock, DollarSign, Users, Trophy, Star } from 'lucide-react';

interface TournamentFormProps {
  editingTournament: Tournament | null;
  onSubmit: (data: TournamentData) => Promise<void>;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

export const TournamentForm = ({ editingTournament, onSubmit, onCancel }: TournamentFormProps) => {
  const [formData, setFormData] = useState({
    name: editingTournament?.name || '',
    day_of_week: editingTournament?.day_of_week?.toString() || '',
    time: editingTournament?.time || '',
    buy_in: editingTournament?.buy_in || '',
    prize: editingTournament?.prize || '',
    max_players: editingTournament?.max_players || 16,
    description: editingTournament?.description || '',
    is_guaranteed: editingTournament?.is_guaranteed || false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.day_of_week) newErrors.day_of_week = 'Dia da semana é obrigatório';
    if (!formData.time) newErrors.time = 'Horário é obrigatório';
    if (!formData.buy_in) newErrors.buy_in = 'Buy-in é obrigatório';
    if (!formData.prize) newErrors.prize = 'Premiação é obrigatória';
    if (formData.max_players < 1) newErrors.max_players = 'Mínimo 1 jogador';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('❌ Campos obrigatórios não preenchidos');
      return;
    }
    
    setSaving(true);
    try {
      console.log('💾 Salvando torneio:', formData);
      
      // Converter dados para o formato correto
      const tournamentData = {
        ...formData,
        day_of_week: parseInt(formData.day_of_week),
        max_players: Number(formData.max_players),
        buy_in: formData.buy_in,
        prize: formData.prize,
      };
      
      await onSubmit(tournamentData);
    } catch (error) {
      console.error('❌ Erro ao salvar torneio:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="bg-poker-gray-medium border-poker-gold/20">
      <CardHeader>
        <CardTitle className="text-poker-gold flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {editingTournament ? 'Editar Torneio' : 'Novo Torneio'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nome do Torneio */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-poker-gold" />
                Nome do Torneio *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Terça Turbo - Omaha"
                className="bg-poker-black border-poker-gold/30 text-white"
              />
              {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
            </div>

            {/* Dia da Semana */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-poker-gold" />
                Dia da Semana *
              </Label>
              <Select value={formData.day_of_week} onValueChange={(value) => handleChange('day_of_week', value)}>
                <SelectTrigger className="bg-poker-black border-poker-gold/30 text-white">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent className="bg-poker-black border-poker-gold/30">
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value} className="text-white hover:bg-poker-gold/20">
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.day_of_week && <p className="text-red-400 text-sm">{errors.day_of_week}</p>}
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-poker-gold" />
                Horário *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="bg-poker-black border-poker-gold/30 text-white"
              />
              {errors.time && <p className="text-red-400 text-sm">{errors.time}</p>}
            </div>

            {/* Buy-in */}
            <div className="space-y-2">
              <Label htmlFor="buy_in" className="text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-poker-gold" />
                Buy-in *
              </Label>
              <Input
                id="buy_in"
                value={formData.buy_in}
                onChange={(e) => handleChange('buy_in', e.target.value)}
                placeholder="Ex: R$ 50,00"
                className="bg-poker-black border-poker-gold/30 text-white"
              />
              {errors.buy_in && <p className="text-red-400 text-sm">{errors.buy_in}</p>}
            </div>

            {/* Premiação */}
            <div className="space-y-2">
              <Label htmlFor="prize" className="text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-poker-gold" />
                Premiação *
              </Label>
              <Input
                id="prize"
                value={formData.prize}
                onChange={(e) => handleChange('prize', e.target.value)}
                placeholder="Ex: R$ 500,00"
                className="bg-poker-black border-poker-gold/30 text-white"
              />
              {errors.prize && <p className="text-red-400 text-sm">{errors.prize}</p>}
            </div>

            {/* Máximo de Jogadores */}
            <div className="space-y-2">
              <Label htmlFor="max_players" className="text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-poker-gold" />
                Máximo de Jogadores
              </Label>
              <Input
                id="max_players"
                type="number"
                min="1"
                max="200"
                value={formData.max_players}
                onChange={(e) => handleChange('max_players', parseInt(e.target.value))}
                className="bg-poker-black border-poker-gold/30 text-white"
              />
              {errors.max_players && <p className="text-red-400 text-sm">{errors.max_players}</p>}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Descrição/Características Especiais
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ex: Estrutura de blinds acelerada, fichas extras, etc."
              className="bg-poker-black border-poker-gold/30 text-white min-h-[80px]"
            />
          </div>

          {/* Premiação Garantida */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_guaranteed"
              checked={formData.is_guaranteed}
              onChange={(e) => handleChange('is_guaranteed', e.target.checked)}
              className="rounded border-poker-gold/30"
            />
            <Label htmlFor="is_guaranteed" className="text-white">
              Premiação Garantida
            </Label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-poker-gold text-poker-black hover:bg-poker-gold-light font-semibold"
            >
              {saving ? 'Salvando...' : (editingTournament ? 'Atualizar' : 'Criar Torneio')}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
