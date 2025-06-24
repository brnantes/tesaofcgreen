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
    let filtered = [...availableImages];
    
    // Aplicar filtro de busca
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(imgUrl => {
        // Extrair o nome do arquivo da URL completa
        const parts = imgUrl.split('/');
        const filename = parts[parts.length - 1].toLowerCase();
        return filename.includes(query);
      });
    }
    
    // Aplicar filtro de tipo
    if (selectedFilter) {
      // Aqui poderíamos filtrar por tipo se tivéssemos metadados das imagens
      // Por enquanto, vamos simular isso com base nos nomes dos arquivos
      const filterKeywords: Record<string, string[]> = {
        'hero_background': ['hero', 'background'],
        'about_image': ['about', 'restaurant'],
        'contact_background': ['contact', 'background'],
        'tournaments_background': ['tournament', 'poker', 'cards', 'chips'],
        'menu_background': ['menu', 'food', 'burger', 'hamburger'],
        'gastronomy_image': ['gastronomy', 'food', 'burger', 'hamburger']
      };
      
      const keywords = filterKeywords[selectedFilter] || [];
      if (keywords.length) {
        filtered = filtered.filter(imgUrl => {
          // Extrair o nome do arquivo da URL completa
          const parts = imgUrl.split('/');
          const filename = parts[parts.length - 1].toLowerCase();
          return keywords.some(keyword => filename.includes(keyword));
        });
      }
    }
    
    return filtered;
  }, [availableImages, searchQuery, selectedFilter]);

  const handleSave = async (imageType: string) => {
    setSaving(true);
    try {
      // Se estamos usando uma imagem da galeria, usamos o selectedImage
      // Caso contrário, usamos a URL do formulário
      const imageUrl = selectedImage || formData[imageType];
      await saveImage(imageType, imageUrl);
      // Limpar a seleção após salvar
      setSelectedImage(null);
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`Aplicando imagem para ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Atualizar o botão de aplicar imagem
    const typeName = imageTypes.find(t => t.key === field)?.label || field;
    toast.success(`Imagem selecionada para ${typeName}. Clique em "Aplicar Imagem" para salvar.`);
    
    // Destacar visualmente a seção selecionada
    setSelectedImageType(field);
  };


  const handleSelectImage = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
    // Se a imagem já estiver selecionada, mostrar a prévia
    if (selectedImage === imageUrl) {
      setPreviewImage(imageUrl);
      setPreviewDialogOpen(true);
    }
  }, [selectedImage]);

  const getCurrentImageUrl = useCallback((imageType: string) => {
    const image = imagesList.find(img => img.type === imageType);
    return image?.image_url || '';
  }, [imagesList]);

  if (loading) {
    return <div className="text-center py-8 text-poker-gold">Carregando...</div>;
  }

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
            <Button 
              onClick={() => setHeroBannerModalOpen(true)}
              className="bg-green-primary hover:bg-green-primary/90 text-white"
            >
              <Image className="w-4 h-4 mr-2" />
              Trocar Banner Principal
            </Button>
          </div>
        </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-poker-black w-full mb-6">
            <TabsTrigger value="site_images" className="data-[state=active]:bg-poker-gold data-[state=active]:text-poker-black">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Imagens do Site
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-poker-gold data-[state=active]:text-poker-black">
              <FileImage className="w-4 h-4 mr-2" />
              Galeria de Imagens
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="site_images" className="space-y-6">
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
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5';
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
          <h4 className="text-poker-gold font-medium mb-2">💡 Dicas para imagens:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use imagens de alta qualidade para melhor resultado</li>
            <li>• Recomendamos usar serviços como Unsplash, Pexels ou seu próprio servidor</li>
            <li>• Para melhor performance, use imagens otimizadas (WebP, JPG comprimido)</li>
            <li>• Teste sempre as URLs antes de salvar</li>
            <li>• Ou use a galeria de imagens para escolher entre as imagens já disponíveis</li>
          </ul>
        </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="space-y-6">
            {/* Seção de Upload de Imagem */}
            <div className="bg-poker-black/30 p-6 rounded-lg border border-poker-gold/10 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h3 className="text-poker-gold font-medium mb-1 flex items-center">
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
                          <li>• Limite de 5MB por arquivo</li>
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
                    // Verificar tamanho do arquivo (limite de 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('O arquivo é muito grande. O tamanho máximo é 5MB.');
                      e.target.value = '';
                      return;
                    }
                    
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
                      
                      // Adicionar a nova imagem à galeria
                      setAvailableImages(prev => [imageUrl, ...prev]);
                      
                      // Selecionar a nova imagem
                      setSelectedImage(imageUrl);
                      
                      // Se um tipo de imagem foi selecionado, atualizar o formData
                      if (selectedImageType) {
                        // Atualizar o formData com a nova imagem para a seção selecionada
                        setFormData(prev => ({
                          ...prev,
                          [selectedImageType]: imageUrl
                        }));
                        
                        const typeName = imageTypes.find(t => t.key === selectedImageType)?.label || selectedImageType;
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
                  className={selectedFilter === null ? "bg-poker-gold text-poker-black" : "bg-transparent text-gray-400 hover:text-white cursor-pointer"}
                  onClick={() => setSelectedFilter(null)}
                >
                  Todas
                </Badge>
                {imageTypes.map((type) => (
                  <Badge 
                    key={type.key} 
                    variant={selectedFilter === type.key ? "default" : "outline"}
                    className={selectedFilter === type.key ? "bg-poker-gold text-poker-black" : "bg-transparent text-gray-400 hover:text-white cursor-pointer"}
                    onClick={() => setSelectedFilter(type.key)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
              
              {/* Grid de imagens */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((imageUrl, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === imageUrl ? 'border-poker-gold scale-105 shadow-lg' : 'border-transparent hover:border-poker-gold/50'}`}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Imagem ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5';
                      }}
                      onClick={() => handleSelectImage(imageUrl)}
                    />
                    {selectedImage === imageUrl && (
                      <div className="absolute inset-0 bg-poker-gold/20 flex items-center justify-center">
                        <div className="bg-poker-gold text-poker-black font-semibold px-3 py-1 rounded-full text-sm">
                          Selecionada
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 rounded-full bg-poker-black/70 border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(imageUrl);
                                setPreviewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar imagem</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7 rounded-full bg-poker-black/70 border-red-500/50 text-red-500 hover:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Encontrar o objeto de imagem correspondente à URL
                                const imageToDelete = imagesList.find(img => img.image_url === imageUrl);
                                if (imageToDelete) {
                                  if (confirm('Tem certeza que deseja apagar esta imagem? Esta ação não pode ser desfeita.')) {
                                    deleteImage(imageToDelete);
                                    if (selectedImage === imageUrl) {
                                      setSelectedImage(null);
                                    }
                                  }
                                } else {
                                  toast.error('Imagem não encontrada no sistema.');
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
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-poker-black/70 border-poker-gold/30 text-red-500 hover:bg-red-500/10 ml-1"
                        title="Apagar imagem"
                        onClick={async (e) => {
                          e.stopPropagation();
                          console.log('Tentando apagar imagem com URL:', imageUrl);
                          
                          // Procurar a imagem pelo URL exato
                          const imageObj = imagesList.find(i => i.image_url === imageUrl);
                          
                          if (imageObj) {
                            console.log('Imagem encontrada para deleção:', imageObj);
                            try {
                              await deleteImage(imageObj);
                              // Atualizar a lista de imagens disponíveis após a deleção
                              setAvailableImages(prev => prev.filter(img => img !== imageUrl));
                              toast.success('Imagem apagada com sucesso!');
                            } catch (error) {
                              console.error('Erro ao apagar imagem:', error);
                              toast.error('Não foi possível apagar a imagem.');
                            }
                          } else {
                            console.error('Imagem não encontrada para deleção. URL:', imageUrl);
                            toast.error('Imagem não encontrada no banco de dados.');
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
              
              {/* Painel de aplicação da imagem selecionada */}
              {selectedImage && (
                <div className="mt-6 p-4 bg-poker-black/50 rounded-lg border border-poker-gold/30">
                  <h4 className="text-poker-gold font-medium mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Aplicar imagem selecionada
                  </h4>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Select onValueChange={(value) => handleChange(value, selectedImage)}>
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
                      onClick={() => {
                        const selectedType = Object.keys(formData).find(key => formData[key] === selectedImage);
                        if (selectedType) {
                          handleSave(selectedType);
                        }
                      }}
                      disabled={!Object.values(formData).includes(selectedImage) || saving}
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
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5';
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
  );
};

export { ImagesSection };
