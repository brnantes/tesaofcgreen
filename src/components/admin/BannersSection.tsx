
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBanners } from '@/hooks/useBanners';

export const BannersSection = () => {
  const { banners, loading, saveBanner } = useBanners();
  const [formData, setFormData] = useState({
    title: 'O jogo começa aqui.',
    subtitle: 'Sinta a emoção de cada jogada no clube mais estratégico da cidade...',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBanner(formData);
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <Card className="bg-poker-gray-medium border-poker-gold/20">
      <CardHeader>
        <CardTitle className="text-poker-gold">Gerenciar Banners da Home</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Título do Banner</label>
          <Input 
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="bg-poker-black border-poker-gold/30 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Subtítulo</label>
          <Textarea 
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="bg-poker-black border-poker-gold/30 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-white">URL da Imagem</label>
          <Input 
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://..."
            className="bg-poker-black border-poker-gold/30 text-white"
          />
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-poker-gold text-poker-black hover:bg-poker-gold-light"
        >
          {saving ? 'Salvando...' : 'Salvar Banner'}
        </Button>
      </CardContent>
    </Card>
  );
};
