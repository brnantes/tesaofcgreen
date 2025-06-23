import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tournament, TournamentData } from '@/types/tournament';
import { Calendar, Clock, DollarSign, Users, Trophy, Star, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

interface TournamentFormProps {
  editingTournament: Tournament | null;
  onSubmit: (data: TournamentData) => Promise<void>;
  onCancel: () => void;
  defaultDayOfWeek?: number;
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

export const TournamentForm = ({ editingTournament, onSubmit, onCancel, defaultDayOfWeek }: TournamentFormProps) => {
  // Definindo um tipo para o formulário que usa string para day_of_week
  type TournamentFormData = Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'day_of_week' | 'date'> & {
    day_of_week: string; // Usando string no formulário para facilitar a manipulação
    date?: string; // Usando string para o input de data
  };

  const [formData, setFormData] = useState<TournamentFormData>(() => ({
    name: editingTournament?.name || '',
    day_of_week: editingTournament?.day_of_week?.toString() || defaultDayOfWeek?.toString() || '0',
    time: editingTournament?.time || '19:00',
    buy_in: editingTournament?.buy_in || 'R$ 50,00',
    prize: editingTournament?.prize || 'R$ 6.000,00',
    description: editingTournament?.description || '',
    is_guaranteed: editingTournament?.is_guaranteed || false,
    date: editingTournament?.date ? new Date(editingTournament.date).toISOString().split('T')[0] : '',
    max_players: editingTournament?.max_players || 100,
    special_features: editingTournament?.special_features || ''
  }));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [buyInNumeric, setBuyInNumeric] = useState(0);
  const [prizeNumeric, setPrizeNumeric] = useState(0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.time) newErrors.time = 'Horário é obrigatório';
    if (!formData.buy_in) newErrors.buy_in = 'Buy-in é obrigatório';
    if (!formData.prize) newErrors.prize = 'Premiação é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 TournamentForm: Iniciando submissão do formulário');
    console.log('📊 TournamentForm: Dados do formulário:', formData);
    
    if (!validateForm()) {
      console.error('❌ Campos obrigatórios não preenchidos');
      return;
    }
    
    setSaving(true);
    try {
      const dataToSubmit: TournamentData = {
        name: formData.name.trim(),
        day_of_week: parseInt(formData.day_of_week),
        time: formData.time,
        buy_in: formData.buy_in,
        prize: formData.prize,
        description: formData.description?.trim() || '',
        is_guaranteed: formData.is_guaranteed,
        date: formData.date || undefined,
        max_players: formData.max_players,
        special_features: formData.special_features?.trim() || ''
      };
      
      console.log('🚀 TournamentForm: Enviando dados:', dataToSubmit);
      await onSubmit(dataToSubmit);
      console.log('✅ TournamentForm: Submissão concluída com sucesso');
    } catch (error) {
      console.error('❌ TournamentForm: Erro na submissão:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev, 
      [field]: value
    }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Atualiza o formulário quando o torneio para edição muda
  useEffect(() => {
    if (editingTournament) {
      setFormData({
        ...editingTournament,
        day_of_week: editingTournament.day_of_week?.toString() || '0',
        buy_in: editingTournament.buy_in || '',
        prize: editingTournament.prize || '',
        date: editingTournament.date ? new Date(editingTournament.date).toISOString().split('T')[0] : '',
      });
      // Garantir que os valores sejam números
      const buyInValue = typeof editingTournament.buy_in === 'string' 
        ? parseFloat(editingTournament.buy_in) || 0 
        : editingTournament.buy_in || 0;
      const prizeValue = typeof editingTournament.prize === 'string' 
        ? parseFloat(editingTournament.prize) || 0 
        : editingTournament.prize || 0;
      
      setBuyInNumeric(buyInValue);
      setPrizeNumeric(prizeValue);
    } else {
      // Reset para valores padrão quando criando um novo torneio
      setFormData({
        name: '',
        day_of_week: defaultDayOfWeek?.toString() || '0',
        time: '19:00',
        buy_in: 'R$ 50,00',
        prize: 'R$ 6.000,00',
        description: '',
        is_guaranteed: false,
        date: '',
        max_players: 100,
        special_features: ''
      });
      setBuyInNumeric(50); // Valor correspondente a R$ 50,00
      setPrizeNumeric(6000); // Valor correspondente a R$ 6.000,00
    }
  }, [editingTournament, defaultDayOfWeek]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-400" />
            {editingTournament ? 'Editar Torneio' : 'Novo Torneio'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Torneio */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Nome do Torneio *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Torneio de Quinta 6k Garantido"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
                disabled={saving}
              />
              {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
            </div>

            {/* Dia e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day_of_week" className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dia da Semana *
                </Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) => handleChange('day_of_week', value)}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem 
                        key={day.value} 
                        value={day.value}
                        className="text-white hover:bg-gray-700"
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white focus:border-green-400 focus:ring-green-400"
                  disabled={saving}
                />
                {errors.time && <p className="text-red-400 text-sm">{errors.time}</p>}
              </div>
            </div>

            {/* Buy-in e Premiação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buy_in" className="text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Buy-in *
                </Label>
                <CurrencyInput
                  id="buy_in"
                  value={formData.buy_in}
                  onChange={(value) => {
                    handleChange('buy_in', value);
                    setBuyInNumeric(parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0);
                  }}
                  placeholder="R$ 50,00"
                  disabled={saving}
                />
                {errors.buy_in && <p className="text-red-400 text-sm">{errors.buy_in}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize" className="text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Premiação *
                </Label>
                <CurrencyInput
                  id="prize"
                  value={formData.prize}
                  onChange={(value) => {
                    handleChange('prize', value);
                    setPrizeNumeric(parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0);
                  }}
                  placeholder="R$ 6.000,00"
                  disabled={saving}
                />
                {errors.prize && <p className="text-red-400 text-sm">{errors.prize}</p>}
              </div>
            </div>

            {/* Premiação Garantida */}
            <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg">
              <Switch
                id="is_guaranteed"
                checked={formData.is_guaranteed}
                onCheckedChange={(checked) => handleChange('is_guaranteed', checked)}
                disabled={saving}
                className="data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="is_guaranteed" className="text-white cursor-pointer flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Premiação Garantida
              </Label>
            </div>

            {/* Características Especiais */}
            <div className="space-y-2">
              <Label htmlFor="special_features" className="text-white flex items-center gap-2">
                <Star className="w-4 h-4" />
                Descrição/Características Especiais
              </Label>
              <Textarea
                id="special_features"
                value={formData.special_features || ''}
                onChange={(e) => handleChange('special_features', e.target.value)}
                placeholder="Ex: Estrutura de blinds acelerada, fichas extras, etc."
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400 min-h-[100px]"
                disabled={saving}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingTournament ? 'Atualizar' : 'Criar'} Torneio
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                disabled={saving}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
