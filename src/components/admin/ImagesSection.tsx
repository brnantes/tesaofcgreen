import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSiteImages } from '@/hooks/useSiteImages';
import { Upload, Eye, Image, FileImage, LayoutDashboard, Check, Loader2, RefreshCw, Search, Trash2, X, Filter } from 'lucide-react';
import { HeroBannerModal } from './HeroBannerModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ImagesSection = () => {
  console.log('Renderizando ImagesSection');
  const { images: imagesList, imagesObject, loading, saveImage, uploadImage, deleteImage, fetchImages } = useSiteImages();
  console.log('Dados recebidos do hook:', { imagesList, loading });
  
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12); // Número de imagens por página
  
  const [formData, setFormData] = useState({
    hero_background: '',
    about_image: '',
    contact_background: '',
    tournaments_background: '',
    menu_background: '',
    gastronomy_image: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroBannerModalOpen, setHeroBannerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('site_images');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSectionSelect, setShowSectionSelect] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const imageTypes = [
    {
      key: 'hero_background',
      label: 'Imagem de Fundo do Hero',
      description: 'Imagem principal da seção hero (1920x1080px recomendado)',
      component: 'Hero.tsx'
    },
    {
      key: 'tournaments_background',
      label: 'Imagem de Fundo dos Torneios',
      description: 'Imagem de fundo da seção de torneios (1920x1080px recomendado)',
      component: 'Tournaments.tsx'
    },
    {
      key: 'about_image',
      label: 'Imagem da Seção Sobre',
      description: 'Imagem da seção sobre nós (800x600px recomendado)',
      component: 'About.tsx'
    },
    {
      key: 'gastronomy_image',
      label: 'Imagem da Seção Gastronomia',
      description: 'Imagem do card de gastronomia (800x600px recomendado)',
      component: 'About.tsx'
    },
    {
      key: 'contact_background',
      label: 'Imagem de Fundo do Contato',
      description: 'Imagem de fundo da seção de contato (1920x1080px recomendado)',
      component: 'Contact.tsx'
    },
    {
      key: 'menu_background',
      label: 'Imagem de Fundo do Menu',
      description: 'Imagem de fundo da seção de cardápio (1920x1080px recomendado)',
      component: 'Menu.tsx'
    }
  ];

  // Efeito para gerar a lista de imagens disponíveis a partir das imagens do site
  useEffect(() => {
    // Usar as URLs completas em vez de apenas os nomes dos arquivos
    const imageUrls = imagesList.map(img => img.image_url);
    
    // Remover duplicatas usando Set
    const uniqueImageUrls = [...new Set(imageUrls)];
    console.log('Lista de imagens únicas carregadas:', uniqueImageUrls.length);
    console.log('Exemplos de URLs:', uniqueImageUrls.slice(0, 2));
    
    setAvailableImages(uniqueImageUrls);
  }, [imagesList]);
  
  // Função para apagar uma imagem
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      // Encontrar o objeto de imagem correspondente à URL
      const imageToDelete = imagesList.find(img => img.image_url === imageUrl);
      
      if (!imageToDelete) {
        toast.error('Imagem não encontrada no sistema.');
        return;
      }
      
      // Confirmar antes de apagar
      if (confirm('Tem certeza que deseja apagar esta imagem? Esta ação não pode ser desfeita.')) {
        await deleteImage(imageToDelete);
        toast.success('Imagem apagada com sucesso!');
        // Atualizar lista de imagens após deletar
        await fetchImages();
        // Remover a imagem selecionada se for a que foi apagada
        if (selectedImage === imageUrl) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Erro ao apagar imagem:', error);
      toast.error('Não foi possível apagar a imagem.');
    }
  };

  // Filtragem de imagens com base na busca e no filtro selecionado
  const filteredImages = useMemo(() => {
    // Filtrar imagens inválidas primeiro (URLs vazias ou que não começam com http)
    let filtered = availableImages.filter(url => {
      return url && url.trim() !== '' && url.startsWith('http');
    })
    // Aplicar filtro de busca
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(url => {
        // Extrair o nome do arquivo da URL
        const fileName = url.split('/').pop()?.toLowerCase() || '';
        return fileName.includes(query);
      });
    }
    
    // Aplicar filtro por tipo
    if (selectedFilter) {
      // Mapeamento de tipos de imagem para termos de busca relacionados
      const typeKeywords: Record<string, string[]> = {
        'hero_background': ['hero', 'banner', 'header', 'background'],
        'about_image': ['about', 'sobre', 'quem somos'],
        'contact_background': ['contact', 'contato', 'fale conosco'],
        'tournaments_background': ['tournament', 'torneio', 'competicao', 'competition'],
        'menu_background': ['menu', 'cardapio', 'food', 'comida'],
        'gastronomy_image': ['gastronomy', 'food', 'burger', 'hamburger']
      };
      
      // Obter palavras-chave para o tipo selecionado
      const keywords = typeKeywords[selectedFilter] || [];
      
      filtered = filtered.filter(url => {
        // Extrair o nome do arquivo da URL
        const fileName = url.split('/').pop()?.toLowerCase() || '';
        // Verificar se o nome do arquivo contém alguma das palavras-chave
        return keywords.some(keyword => fileName.includes(keyword));
      });
    }
    
    console.log(`Filtradas ${filtered.length} imagens válidas de ${availableImages.length} disponíveis`);
    return filtered;
  }, [availableImages, searchQuery, selectedFilter]);

  const handleSave = async (imageType: string) => {
    setSaving(true);
    try {
      console.log(`Salvando imagem para a seção ${imageType}...`);
      // Se estamos usando uma imagem da galeria, usamos o selectedImage
      // Caso contrário, usamos a URL do formulário
      const imageUrl = selectedImage || formData[imageType];
      
      if (!imageUrl) {
        console.error(`URL da imagem não definida para ${imageType}`);
        toast.error("URL da imagem não definida.");
        return;
      }
      
      console.log(`Salvando imagem para ${imageType} com URL:`, imageUrl);
      await saveImage(imageType, imageUrl);
      await fetchImages();
      // Atualizar o formData após salvar
      setFormData(prev => ({
        ...prev,
        [imageType]: imageUrl
      }));
      
      // Limpar a seleção após salvar
      setSelectedImage(null);
      
      // Mostrar mensagem de sucesso com o nome amigável da seção
      const typeName = imageTypes.find(t => t.key === imageType)?.label || imageType;
      toast.success(`Imagem aplicada com sucesso à seção ${typeName}!`);
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast.error("Não foi possível salvar a imagem.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`Aplicando imagem para ${field}:`, value);
    
    // Verificar se o campo e valor são válidos
    if (!field || !value) {
      console.error('Campo ou valor inválidos:', { field, value });
      toast.error("Dados inválidos para aplicar imagem.");
      return;
    }
    
    // Atualizar o formData com a nova imagem
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      console.log('Novo formData:', newFormData);
      return newFormData;
    });
    
    // Atualizar o botão de aplicar imagem
    const typeName = imageTypes.find(t => t.key === field)?.label || field;
    toast.success(`Imagem selecionada para ${typeName}. Clique em "Aplicar Imagem" para salvar.`);
    
    // Destacar visualmente a seção selecionada
    setSelectedImageType(field);
    
    // Salvar imediatamente se for necessário
    // handleSave(field);
  };

  const handleSelectImage = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
    // Se um tipo de imagem estiver selecionado, atualize o formData
    if (selectedImageType && imageUrl) {
      setFormData(prev => ({
        ...prev,
        [selectedImageType]: imageUrl
      }));
    }
    // Se a imagem já estiver selecionada, mostrar a prévia
    if (selectedImage === imageUrl) {
      setPreviewImage(imageUrl);
      setPreviewDialogOpen(true);
    }
  }, [selectedImage, selectedImageType]);

  // Função para obter a URL atual da imagem para um tipo específico
  const getCurrentImageUrl = useCallback((imageType: string) => {
    const image = imagesList.find(img => img.type === imageType);
    return image?.image_url || '';
  }, [imagesList]);
  
  // Função para mudar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Função para gerar URL de thumbnail otimizada
  const getOptimizedImageUrl = (url: string) => {
    // Se for uma URL do Supabase Storage, adicionar parâmetros de transformação
    if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
      // Adicionar parâmetros para redimensionar para thumbnail
      return `${url}?width=300&quality=80`;
    }
    return url;
  };

  // Verificar se está carregando
      
      console.log(`Salvando imagem para ${imageType} com URL:`, imageUrl);
      await saveImage(imageType, imageUrl);
      await fetchImages();
      // Atualizar o formData após salvar
      setFormData(prev => ({
        ...prev,
        [imageType]: imageUrl
      }));
      
      // Limpar a seleção após salvar
      setSelectedImage(null);
      
      // Mostrar mensagem de sucesso com o nome amigável da seção
      const typeName = imageTypes.find(t => t.key === imageType)?.label || imageType;
      toast.success(`Imagem aplicada com sucesso à seção ${typeName}!`);
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast.error("Não foi possível salvar a imagem.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`Aplicando imagem para ${field}:`, value);
    // Verificar se o campo e valor são válidos
    if (!field || !value) {
      console.error('Campo ou valor inválidos:', { field, value });
      toast.error("Dados inválidos para aplicar imagem.");
      return;
    }
    // Atualizar o formData com a nova imagem
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      console.log('Novo formData:', newFormData);
      return newFormData;
    });
    // Atualizar o botão de aplicar imagem
    const typeName = imageTypes.find(t => t.key === field)?.label || field;
    toast.success(`Imagem selecionada para ${typeName}. Clique em "Aplicar Imagem" para salvar.`);
    // Destacar visualmente a seção selecionada
    setSelectedImageType(field);
    // Salvar imediatamente se for necessário
    // handleSave(field);
  };





// Implementação completa da função getOptimizedImageUrl
const getOptimizedImageUrl = (url: string) => {
  // Se for uma URL do Supabase Storage, adicionar parâmetros de transformação
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    // Adicionar parâmetros para redimensionar para thumbnail
    return `${url}?width=300&quality=80`;
  }
  return url;
};
// Verificar se está carregando
if (loading) {
return (
  <div>
    <div className="text-center py-8 text-poker-gold">Carregando...</div>
  </div>
);
}
// Calcular índices para paginação
const indexOfLastImage = currentPage * imagesPerPage;
const indexOfFirstImage = indexOfLastImage - imagesPerPage;
const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
// Retornar a interface do componente
return (
  <div>
    {/* Modal para gerenciar o banner principal */}
    <HeroBannerModal
      open={heroBannerModalOpen}
      onOpenChange={setHeroBannerModalOpen}
    />
    <Card className="bg-poker-gray-medium border-poker-gold/20">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-poker-gold">Gerenciar Imagens do Site</CardTitle>
            <p className="text-gray-400 text-sm">
              Gerencie as imagens principais exibidas no site. Escolha entre usar URLs externas ou imagens da galeria local.
            </p>
          </div>
          {imageTypes.map((imageType) => {
            // Se for o banner principal, adicione uma observação sobre o modal
            const currentUrl = getCurrentImageUrl(imageType.key);
            const formUrl = formData[imageType.key] || currentUrl;
            const isHeroBanner = imageType.key === 'hero_background';
            
            return (
              <div key={imageType.key} className="space-y-4 p-4 bg-poker-black/30 rounded-lg border border-poker-gold/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-poker-gold font-medium">{imageType.label}</h4>
                    <p className="text-gray-400 text-sm">{imageType.description}</p>
                  </div>
                  {isHeroBanner && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setHeroBannerModalOpen(true)}
                  Gerencie as imagens principais exibidas no site. Escolha entre usar URLs externas ou imagens da galeria local.
                </p>
              </div>
              {imageTypes.map((imageType) => {
          // Se for o banner principal, adicione uma observação sobre o modal
          const currentUrl = getCurrentImageUrl(imageType.key);
          const formUrl = formData[imageType.key] || currentUrl;
          const isHeroBanner = imageType.key === 'hero_background';
          
          return (
            <div key={imageType.key} className="space-y-4 p-4 bg-poker-black/30 rounded-lg border border-poker-gold/10">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-poker-gold font-medium">{imageType.label}</h4>
                  <p className="text-gray-400 text-sm">{imageType.description}</p>
                </div>
                {isHeroBanner && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setHeroBannerModalOpen(true)}
                    className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                  >
                    <Image className="w-4 h-4 mr-1" />
                    Editor Avançado
                  </Button>
                )}
              </div>
              
              {currentUrl && (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">Imagem Atual:</label>
                  <div className="flex items-center gap-2">
                    <img 
                      src={currentUrl} 
                      alt={imageType.label}
                      className="w-20 h-20 object-cover rounded border border-poker-gold/30"
                      onError={(e) => {
                        // Usar diretamente um placeholder confiável
                        e.currentTarget.src = 'https://placehold.co/600x400/222222/22c55e?text=Green+Table';
                        e.currentTarget.onerror = null; // Evitar loops infinitos
                        console.error('Erro ao carregar imagem:', currentUrl);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(currentUrl, '_blank')}
                      className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  {currentUrl ? 'Nova URL da Imagem:' : 'URL da Imagem:'}
                </label>
                <Input 
                  value={formUrl}
                  onChange={(e) => handleChange(imageType.key, e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="bg-poker-black border-poker-gold/30 text-white"
                />
              </div>
              
              <Button 
                onClick={() => handleSave(imageType.key)}
                disabled={saving || !formUrl}
                className="bg-poker-gold text-poker-black hover:bg-poker-gold-light disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : (currentUrl ? 'Atualizar' : 'Salvar')}
              </Button>
            </div>
          );
        })}
        
        <div className="bg-poker-black/50 p-4 rounded border border-poker-gold/10">
          <h4 className="text-poker-gold font-medium mb-2"> Dicas para imagens:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use imagens de alta qualidade para melhor resultado</li>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Nova Imagem
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Arraste e solte ou selecione uma imagem para fazer upload para a galeria.
                  </p>
                </div>
                <div className="mt-2 md:mt-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10">
                          <Eye className="w-4 h-4 mr-1" />
                          Dicas
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-poker-black border-poker-gold/30 text-white max-w-xs">
                        <ul className="text-xs space-y-1">
                          <li>• Use imagens otimizadas (WebP, JPG)</li>
                          <li>• Tamanho recomendado: 1920x1080px</li>
                          <li>• Sem limite de tamanho de arquivo</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Select onValueChange={(value) => setSelectedImageType(value)}>
                      <SelectTrigger className="bg-poker-black border-poker-gold/30 text-white">
                        <SelectValue placeholder="Selecione o tipo de imagem" />
                      </SelectTrigger>
                      <SelectContent className="bg-poker-black border-poker-gold/30 text-white">
                        {imageTypes.map((type) => (
                          <SelectItem key={type.key} value={type.key}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedImageType && (
                      <Badge variant="outline" className="mt-2 bg-poker-gold/10 text-poker-gold border-poker-gold/30">
                        <Check className="w-3 h-3 mr-1" />
                        {imageTypes.find(t => t.key === selectedImageType)?.label}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div 
                  className="border-2 border-dashed border-poker-gold/30 rounded-lg p-8 text-center cursor-pointer hover:bg-poker-black/50 transition-colors relative"
                  onClick={() => !uploading && document.getElementById('gallery-file-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const fileInput = document.getElementById('gallery-file-upload') as HTMLInputElement;
                      if (fileInput) {
                        // Criar um novo objeto FileList com o arquivo arrastado
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;
                        
                        // Disparar o evento de change manualmente
                        const event = new Event('change', { bubbles: true });
                        fileInput.dispatchEvent(event);
                      }
                    } else {
                      toast.error('Apenas arquivos de imagem são permitidos.');
                    }
                  }}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 mx-auto text-poker-gold mb-2 animate-spin" />
                      <p className="text-white font-medium">Enviando imagem...</p>
                      <div className="w-full max-w-xs bg-poker-black/50 h-2 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="h-full bg-poker-gold transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{uploadProgress}% concluído</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-poker-gold/10 rounded-full p-4 inline-block mb-4">
                        <Upload className="w-10 h-10 text-poker-gold" />
                      </div>
                      <p className="text-white font-medium">
                        Arraste e solte sua imagem aqui
                      </p>
                      <p className="text-sm text-gray-400 mt-2 mb-4">
                        ou clique para selecionar do seu dispositivo
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('gallery-file-upload')?.click();
                        }}
                      >
                        Selecionar Arquivo
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <input
                id="gallery-file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Sem limite de tamanho de arquivo
                    // Apenas log do tamanho para debug
                    console.log(`Tamanho do arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
                    
                    try {
                      setUploading(true);
                      setUploadProgress(0);
                      
                      // Simular progresso de upload
                      const progressInterval = setInterval(() => {
                        setUploadProgress(prev => {
                          if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                          }
                          return prev + 10;
                        });
                      }, 300);
                      
                      // Fazer upload da imagem usando a função do hook
                      const imageUrl = await uploadImage(file, selectedImageType || undefined);
                      
                      // Completar o progresso
                      clearInterval(progressInterval);
                      setUploadProgress(100);
                      
                      // Se um tipo de imagem foi selecionado, atualizar o formData
                      if (selectedImageType) {
                        // Atualizar o formData com a nova imagem para a seção selecionada
                        setFormData(prev => ({
                          ...prev,
                          [selectedImageType]: imageUrl
                        }));
                        
                        const typeName = imageTypes.find(t => t.key === selectedImageType)?.label || selectedImageType;
                        const BUCKET_NAME = 'menu-images';
                        toast.success(`Imagem enviada com sucesso e pronta para ser aplicada como "${typeName}"!`);
                      } else {
                        toast.success('Imagem enviada com sucesso! Selecione uma seção para aplicá-la.');
                      }
                      
                      // Mostrar diálogo de prévia da imagem
                      setPreviewDialogOpen(true);
                      setPreviewImage(imageUrl);
                    } catch (error) {
                      console.error('Erro ao fazer upload:', error);
                      toast.error('Erro ao fazer upload da imagem. Tente novamente.');
                    } finally {
                      // Limpar o input e resetar o estado
                      e.target.value = '';
                      setUploading(false);
                      setUploadProgress(0);
                    }
                  }
                }}
                disabled={uploading}
              />
            </div>
            
            {/* Galeria de Imagens */}
            <div className="bg-poker-black/30 p-6 rounded-lg border border-poker-gold/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h3 className="text-poker-gold font-medium mb-1 flex items-center">
                    <FileImage className="w-4 h-4 mr-2" />
                    Galeria de Imagens
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Selecione uma imagem da galeria para aplicar em uma seção do site.
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Buscar imagens..." 
                      className="bg-poker-black border-poker-gold/30 text-white pl-10 w-full md:w-auto"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-poker-black border-poker-gold/30 text-white">
                        Filtrar por tipo
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Filtros de tipo de imagem */}
               <div className="flex flex-wrap gap-2 mb-4">
                <Badge 
                  variant={selectedFilter === null ? "default" : "outline"}
                  onClick={() => setSelectedFilter(null)}
                >
                  Todas
                </Badge>
                {imageTypes.map((type) => (
                  <Badge
                    key={type.key}
                    variant={selectedFilter === type.key ? "default" : "outline"}
                    onClick={() => setSelectedFilter(type.key)}
                    className="cursor-pointer"
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
              
              {/* Galeria de imagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentImages.map((imageUrl, index) => (
                  <div key={imageUrl}>
                    <div className="w-full h-full bg-poker-black/50 flex items-center justify-center">
                      {/* Placeholder enquanto a imagem carrega */}
                      <div className="absolute inset-0 flex items-center justify-center bg-poker-black/30">
                        <Loader2 className="w-8 h-8 text-poker-gold/50 animate-spin" />
                      </div>
                      <img 
                        src={getOptimizedImageUrl(imageUrl)} 
                        alt={`Imagem ${indexOfFirstImage + index + 1}`} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        onLoad={(e) => {
                          // Remover o placeholder quando a imagem carregar
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const placeholder = parent.querySelector('div.absolute') as HTMLElement;
                            if (placeholder) placeholder.style.display = 'none';
                          }
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/logo-green-table.png';
                          e.currentTarget.onerror = () => {
                            e.currentTarget.src = 'https://placehold.co/600x400/222222/22c55e?text=Green+Table';
                            e.currentTarget.onerror = null;
                          };
                          console.error('Erro ao carregar imagem:', imageUrl);
                        }}
                      />
                    </div>
                    {showSectionSelect === imageUrl && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                        <div className="bg-poker-black border border-poker-gold/40 rounded-lg p-4 flex flex-col gap-2">
                          <span className="text-poker-gold font-medium mb-2">Escolha a seção:</span>
                          {imageTypes.map(type => (
                            <Button
                              key={type.key}
                              className="mb-2 bg-poker-gold text-poker-black hover:bg-poker-gold-light"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleSave(type.key);
                                setFormData(prev => ({ ...prev, [type.key]: imageUrl }));
                                await fetchImages();
                                setShowSectionSelect(null);
                                setSelectedImage(null);
                                toast.success(`Imagem aplicada à seção ${type.label}!`);
                              }}
                            >
                              {type.label}
                            </Button>
                          ))}
                          <Button variant="outline" className="mt-2" onClick={e => { e.stopPropagation(); setShowSectionSelect(null); }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                                  }
                                } else {
                                  // Se não encontrou no banco, tentar criar um objeto temporário para deleção
                                  console.log('Imagem não encontrada no banco, tentando deletar do storage:', imageUrl);
                                  
                                  try {
                                    // Criar um objeto temporário com a URL da imagem
                                    const tempImageObj = {
                                      id: `temp-${Date.now()}`,
                                      type: 'gallery_image',
                                      title: imageUrl.split('/').pop() || 'unknown',
                                      image_url: imageUrl,
                                      created_at: new Date().toISOString(),
                                      updated_at: new Date().toISOString()
                                    };
                                    
                                    await deleteImage(tempImageObj);
                                    
                                    // Limpar seleção se a imagem deletada estava selecionada
                                    if (selectedImage === imageUrl) {
                                      setSelectedImage(null);
                                    }
                                    
                                    // Atualizar a lista de imagens disponíveis após a deleção
                                    setAvailableImages(prev => prev.filter(img => img !== imageUrl));
                                    toast.success('Imagem removida do storage com sucesso!');
                                    
                                    // Recarregar imagens para garantir sincronização
                                    fetchImages();
                                  } catch (error) {
                                    console.error('Erro ao tentar remover imagem do storage:', error);
                                    toast.error('Não foi possível remover a imagem do storage.');
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-red-950 border-red-500/50">
                            <p>Apagar imagem</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mensagem de carregando ou nenhuma imagem encontrada */}
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  <Loader2 className="w-12 h-12 mx-auto text-gray-500 mb-2 animate-spin" />
                  <p>Carregando imagens...</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileImage className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                  <p>Nenhuma imagem encontrada</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4 bg-poker-black border-poker-gold/50 text-poker-gold hover:bg-poker-gold/10"
                    onClick={() => {
                      console.log('Recarregando imagens manualmente');
                      fetchImages();
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar imagens
                  </Button>
                </div>
              ) : null}
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 h-8 border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Lógica para mostrar páginas ao redor da atual
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 h-8 ${currentPage === pageNum ? 'bg-poker-gold text-poker-black' : 'border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 h-8 border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                  >
                    Próxima
                  </Button>
                </div>
              )}
              
              {/* Painel de aplicação da imagem selecionada */}
              {selectedImage && (
                <div className="mt-6 p-4 bg-poker-black/50 rounded-lg border border-poker-gold/30">
                  <h4 className="text-poker-gold font-medium mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Aplicar imagem selecionada
                  </h4>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Select onValueChange={(value) => setSelectedImageType(value)}>
                        <SelectTrigger className="bg-poker-black border-poker-gold/30 text-white">
                          <SelectValue placeholder="Selecione a seção do site" />
                        </SelectTrigger>
                        <SelectContent className="bg-poker-black border-poker-gold/30 text-white">
                          {imageTypes.map((type) => (
                            <SelectItem key={type.key} value={type.key}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={async () => {
                        if (selectedImage && selectedImageType) {
                          await handleSave(selectedImageType);
                          // Atualizar o formData imediatamente após salvar
                          setFormData(prev => ({
                            ...prev,
                            [selectedImageType]: selectedImage
                          }));
                          // Atualizar a lista de imagens após salvar
                          await fetchImages();
                          // Limpar seleção e fechar painel de aplicação
                          setSelectedImage(null);
                          setSelectedImageType(null);
                        }
                      }}
                      disabled={!selectedImage || !selectedImageType || saving}
                      className="bg-poker-gold text-poker-black hover:bg-poker-gold-light disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Aplicar Imagem
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Diálogo de prévia da imagem */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
              <DialogContent className="bg-poker-black border-poker-gold/30 text-white max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-poker-gold">Prévia da Imagem</DialogTitle>
                </DialogHeader>
                {previewImage && (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-h-[60vh] overflow-hidden rounded-lg border border-poker-gold/30">
                      <img 
                        src={previewImage} 
                        alt="Prévia da imagem" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Usar uma imagem de fallback mais amigável com o logo do Green Table
                          e.currentTarget.src = '/logo-green-table.png';
                          // Tentar um fallback genérico se o logo não carregar
                          e.currentTarget.onerror = () => {
                            e.currentTarget.src = 'https://placehold.co/600x400/222222/22c55e?text=Green+Table';
                            e.currentTarget.onerror = null; // Evitar loops infinitos
                          };
                          console.error('Erro ao carregar imagem de prévia:', previewImage);
                        }}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                        onClick={() => window.open(previewImage, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Abrir em Nova Aba
                      </Button>
                      <Button 
                        className="bg-poker-gold text-poker-black hover:bg-poker-gold-light"
                        onClick={() => {
                          setSelectedImage(previewImage);
                          setPreviewDialogOpen(false);
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Selecionar Esta Imagem
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImagesSection;
