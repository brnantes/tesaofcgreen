import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSiteImages } from '@/hooks/useSiteImages';
import { Upload, FileImage, Check, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { toast } from 'sonner';

type ImageTypeKey = 'hero_background' | 'about_image' | 'contact_background' | 'tournaments_background' | 'menu_background' | 'gastronomy_image';

const imageTypes: { key: ImageTypeKey; label: string }[] = [
  { key: 'hero_background', label: 'Hero Banner' },
  { key: 'about_image', label: 'Sobre' },
  { key: 'contact_background', label: 'Contato' },
  { key: 'tournaments_background', label: 'Torneios' },
  { key: 'menu_background', label: 'Menu' },
  { key: 'gastronomy_image', label: 'Gastronomia' },
];

const ImagesSection = () => {
  const { images: imagesList, loading, saveImage, uploadImage, deleteImage, fetchImages } = useSiteImages();
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<ImageTypeKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableImages = useMemo(() => (
    Array.from(new Set(imagesList.map(img => img.image_url).filter(Boolean)))
  ), [imagesList]);

  const filteredImages = useMemo(() => (
    availableImages.filter(url =>
      url && url.startsWith('http') && url.toLowerCase().includes(search.toLowerCase())
    )
  ), [availableImages, search]);

  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const currentImages = filteredImages.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadImage(file);
      toast.success('Imagem enviada!');
      fetchImages();
    } catch {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedImage || !selectedImageType) return;
    setSaving(true);
    try {
      await saveImage(selectedImageType, selectedImage);
      toast.success('Imagem aplicada!');
      fetchImages();
      setSelectedImage(null);
      setSelectedImageType(null);
    } catch {
      toast.error('Erro ao salvar imagem');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (url: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta imagem?')) return;
    try {
      // Encontrar a imagem completa pelo URL
      const imageToDelete = imagesList.find(img => img.image_url === url);
      
      if (!imageToDelete) {
        // Se não encontrar a imagem na lista, criar um objeto temporário
        const tempImage = {
          id: `temp-${Date.now()}`,
          type: 'gallery_image',
          title: 'Imagem da galeria',
          image_url: url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await deleteImage(tempImage);
      } else {
        await deleteImage(imageToDelete);
      }
      
      toast.success('Imagem deletada!');
      fetchImages();
    } catch {
      toast.error('Erro ao deletar imagem');
    }
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewDialogOpen(true);
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Gerenciar Imagens do Site</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Buscar imagens..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="outline" onClick={fetchImages}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-gray-400">
              <Loader2 className="w-12 h-12 mx-auto animate-spin" />
              <p>Carregando imagens...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <FileImage className="w-12 h-12 mx-auto mb-2" />
              <p>Nenhuma imagem encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentImages.map(url => (
                <div key={url} className={`relative border rounded p-2 group ${selectedImage === url ? 'ring-2 ring-green-500 border-green-500' : 'bg-black/30'}`}>
                  <img
                    src={url}
                    alt="Imagem"
                    className="w-full h-32 object-cover rounded cursor-pointer transition-all hover:opacity-90"
                    onClick={() => handlePreview(url)}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedImage(url)} className="bg-black/50 hover:bg-black/70">
                      <Check className="w-4 h-4 text-green-400" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(url)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Próxima</Button>
            </div>
          )}
          {/* Aplicar imagem */}
          {selectedImage && (
            <div className="mt-6 p-4 bg-black/40 rounded border border-green-500/30">
              <h3 className="text-lg font-medium mb-3 text-green-400 flex items-center">
                <FileImage className="w-5 h-5 mr-2" />
                Aplicar imagem à seção do site
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="text-sm text-gray-400 mb-1">Imagem selecionada:</div>
                  <img 
                    src={selectedImage} 
                    alt="Selecionada" 
                    className="w-full max-w-xs h-40 object-cover rounded border border-gray-700" 
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-sm text-gray-400 mb-1">Escolha onde aplicar esta imagem:</div>
                  <Select 
                    value={selectedImageType ?? undefined} 
                    onValueChange={v => setSelectedImageType(v as ImageTypeKey)}
                  >
                    <SelectTrigger className="w-full mb-4">
                      <SelectValue placeholder="Selecione a seção do site" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageTypes.map(type => (
                        <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      className="flex-1" 
                      onClick={handleSave} 
                      disabled={!selectedImageType || saving}
                      variant="default"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                      Aplicar imagem
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Prévia */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Prévia da Imagem</DialogTitle>
              </DialogHeader>
              {previewImage && (
                <img src={previewImage} alt="Prévia" className="w-full max-h-[60vh] object-contain" />
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagesSection;