import { useState, useEffect } from 'react';
import { useSiteImages } from '@/hooks/useSiteImages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Upload, Image, Link, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';

interface HeroBannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const HeroBannerModal = ({ open, onOpenChange, onSuccess }: HeroBannerModalProps) => {
  const { getImageUrl, saveImage, images, loading } = useSiteImages();
  
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('url');

  // Carregar a imagem atual ao abrir o modal
  useEffect(() => {
    if (open) {
      const currentBanner = images.find(img => img.type === 'hero_background');
      const currentUrl = currentBanner?.image_url || getImageUrl('hero_background', '/lovable-uploads/a51d0bdb-8cb1-4dcb-80a0-90df1afb8b1b.png');
      setImageUrl(currentUrl);
      setPreviewUrl(currentUrl);
      setUploadFile(null);
    }
  }, [open, images, getImageUrl]);

  // Função para lidar com upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      
      // Criar uma URL de visualização do arquivo
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Limpar URL ao desmontar
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Função para lidar com mudança de URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value.trim()) {
      setPreviewUrl(e.target.value);
    }
  };

  // Pré-visualizar URL
  const handlePreview = () => {
    if (imageUrl) {
      setPreviewUrl(imageUrl);
    }
  };

  // Função para converter arquivo para Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Salvar banner
  const handleSaveBanner = async () => {
    setUploading(true);
    
    try {
      let finalUrl = imageUrl;
      
      // Se estamos no modo upload e temos um arquivo
      if (activeTab === 'upload' && uploadFile) {
        // Converter arquivo para base64 ou fazer upload para um serviço de hospedagem
        // Aqui estamos convertendo para base64, mas em produção seria melhor
        // fazer upload para um bucket de armazenamento
        finalUrl = await fileToBase64(uploadFile);
      }
      
      await saveImage('hero_background', finalUrl);
      toast.success('Banner atualizado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
      toast.error('Erro ao salvar banner. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-poker-gray-dark border-poker-gold/50 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-poker-gold text-xl">
            Alterar Banner Principal
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-poker-black">
            <TabsTrigger value="url" className="data-[state=active]:bg-poker-gold data-[state=active]:text-poker-black">
              <Link className="w-4 h-4 mr-2" />
              URL da Imagem
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-poker-gold data-[state=active]:text-poker-black">
              <Upload className="w-4 h-4 mr-2" />
              Upload de Arquivo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://exemplo.com/banner.jpg"
                    className="flex-1 bg-poker-black border-poker-gold/30"
                  />
                  <Button 
                    onClick={handlePreview} 
                    variant="outline"
                    className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Pré-visualizar
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-amber-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Use imagens em 16:9 para melhores resultados (1920x1080px ideal)</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="py-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-poker-gold/30 rounded-lg p-6 text-center cursor-pointer hover:bg-poker-black/50 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-poker-gold mb-2" />
                <p className="text-white">
                  Clique para selecionar ou arraste sua imagem aqui
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  JPG, PNG ou WEBP (máximo 5MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </div>
              
              {uploadFile && (
                <div className="text-sm text-green-400 flex items-center">
                  <Check className="w-4 h-4 mr-1" /> 
                  <span>Arquivo selecionado: {uploadFile.name}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Pré-visualização da imagem */}
        <div className="mt-4">
          <Label className="block mb-2">Pré-visualização</Label>
          {previewUrl ? (
            <div className="relative aspect-video bg-poker-black rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Pré-visualização do banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          ) : (
            <div className="aspect-video bg-poker-black flex items-center justify-center rounded-md">
              <p className="text-gray-400">Nenhuma imagem selecionada</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-poker-gold/30 text-white hover:bg-poker-black"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveBanner}
            disabled={uploading || (!imageUrl && !uploadFile)}
            className="bg-poker-gold text-poker-black hover:bg-poker-gold-light disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvar Banner
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
