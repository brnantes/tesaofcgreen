
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useChampions } from '@/hooks/useChampions';
import { Trash2, Plus } from 'lucide-react';

export const ChampionsSection = () => {
  const { champions, loading, addChampion, deleteChampion } = useChampions();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    achievement: '',
    prize: '',
    image_url: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addChampion(formData);
      setFormData({
        name: '',
        achievement: '',
        prize: '',
        image_url: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao adicionar campeão:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este campeão?')) {
      await deleteChampion(id);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-poker-gray-medium border-poker-gold/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-poker-gold">Gerenciar Campeões</CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-poker-gold text-poker-black hover:bg-poker-gold-light"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancelar' : 'Adicionar Campeão'}
          </Button>
        </CardHeader>
        <CardContent>
          {champions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhum campeão cadastrado ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-poker-gold">Foto</TableHead>
                  <TableHead className="text-poker-gold">Nome</TableHead>
                  <TableHead className="text-poker-gold">Conquista</TableHead>
                  <TableHead className="text-poker-gold">Prêmio</TableHead>
                  <TableHead className="text-poker-gold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {champions.map((champion) => (
                  <TableRow key={champion.id}>
                    <TableCell>
                      <img 
                        src={champion.image_url} 
                        alt={champion.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    </TableCell>
                    <TableCell className="text-white">{champion.name}</TableCell>
                    <TableCell className="text-gray-300">{champion.achievement}</TableCell>
                    <TableCell className="text-poker-gold font-semibold">{champion.prize}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(champion.id)}
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-poker-gray-medium border-poker-gold/20">
          <CardHeader>
            <CardTitle className="text-poker-gold">Adicionar Campeão</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Nome do Campeão</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Carlos Mendes"
                    className="bg-poker-black border-poker-gold/30 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Conquista</label>
                  <Input 
                    value={formData.achievement}
                    onChange={(e) => handleChange('achievement', e.target.value)}
                    placeholder="Ex: Campeão 2024"
                    className="bg-poker-black border-poker-gold/30 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Prêmio</label>
                  <Input 
                    value={formData.prize}
                    onChange={(e) => handleChange('prize', e.target.value)}
                    placeholder="R$ 15.000"
                    className="bg-poker-black border-poker-gold/30 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">URL da Foto</label>
                  <Input 
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="https://..."
                    className="bg-poker-black border-poker-gold/30 text-white"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit"
                disabled={saving}
                className="bg-poker-gold text-poker-black hover:bg-poker-gold-light"
              >
                {saving ? 'Adicionando...' : 'Adicionar Campeão'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
