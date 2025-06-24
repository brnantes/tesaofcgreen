import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItem } from '@/types/database';
import { 
  Upload, 
  X, 
  ChefHat, 
  DollarSign, 
  ImageIcon, 
  Check, 
  AlertCircle, 
  Loader2,
  Camera,
  FileImage
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MenuItemFormProps {
  item?: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  category?: string;
}

const CATEGORIES = [
  { value: 'Lanches', label: 'Lanches', color: 'bg-orange-500/20 text-orange-400', icon: '🍔' },
  { value: 'Bebidas', label: 'Bebidas', color: 'bg-blue-500/20 text-blue-400', icon: '🥤' },
  { value: 'Pratos Principais', label: 'Pratos Principais', color: 'bg-green-500/20 text-green-400', icon: '🍽️' },
  { value: 'Sobremesas', label: 'Sobremesas', color: 'bg-pink-500/20 text-pink-400', icon: '🍰' },
  { value: 'Aperitivos', label: 'Aperitivos', color: 'bg-purple-500/20 text-purple-400', icon: '🥨' },
];

export const MenuItemForm = ({ item, open, onClose }: MenuItemFormProps) => {
  const { addMenuItem, updateMenuItem } = useMenuItems();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'Lanches',
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (item) {
      console.log('Preenchendo formulário com dados do item:', item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        image_url: item.image_url || '',
        category: item.category || 'Lanches',
        featured: item.featured || false,
      });
      setImagePreview(item.image_url || '');
    } else {
      console.log('Limpando formulário para novo item');
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: 'Lanches',
        featured: false,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setErrors({});
  }, [item, open]);

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
        break;
      case 'description':
        if (!value.trim()) return 'Descrição é obrigatória';
        if (value.length < 10) return 'Descrição deve ter pelo menos 10 caracteres';
        break;
      case 'price':
        if (!value.trim()) return 'Preço é obrigatório';
        break;
      case 'category':
        if (!value.trim()) return 'Categoria é obrigatória';
        break;
    }
    return undefined;
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const number = parseInt(numericValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(number);
  };

  const handlePriceChange = (value: string) => {
    const formattedPrice = formatCurrency(value);
    setFormData(prev => ({ ...prev, price: formattedPrice }));
    
    const error = validateField('price', formattedPrice);
    setErrors(prev => ({ ...prev, price: error }));
  };

  // Upload de imagem usando bucket existente 'menu-images'
  const handleImageUpload = async (file: File) => {
    // Bucket existente para imagens de itens do menu
    const BUCKET_NAME = 'menu-images';
    console.log('Iniciando upload da imagem:', file.name, `(${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Fazendo upload para o bucket', BUCKET_NAME + ':', filePath);

      // Configuração melhorada para uploads maiores
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        // Mostrar mensagem de erro mais detalhada
        let errorMessage = "Erro ao fazer upload da imagem.";
        
        // Verificar se é erro de tamanho
        if (error.message && error.message.includes("size")) {
          errorMessage = `Erro de tamanho: ${error.message}. Verifique as configurações do bucket no Supabase.`;
        } else if (error.message) {
          errorMessage = `Erro: ${error.message}`;
        }
        
        toast({
          title: "Falha no upload",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw error;
      }

      console.log('Upload concluído:', data);

      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const imageUrl = publicData.publicUrl;
      console.log('URL pública da imagem:', imageUrl);

      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);

      toast({
        title: "Upload concluído",
        description: "Imagem enviada com sucesso!",
      });

      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };
  // Fim do bloco de upload com bucket 'menu-itens'

  const handleFileSelect = (file: File) => {
    console.log('Arquivo selecionado:', file.name, file.type, file.size);
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }
    
    // Não há mais validação de tamanho máximo de arquivo
    // Apenas log do tamanho para debug
    console.log(`Tamanho do arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    
    setImageFile(file);
    
    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submetendo formulário:', formData);
    
    // Validar todos os campos
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field as keyof FormErrors] = error;
    });

    // Validar imagem
    if (!imagePreview && !formData.image_url) {
      newErrors.image_url = 'Imagem é obrigatória';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      let imageUrl = formData.image_url;
      
      // Se há um novo arquivo de imagem, fazer upload primeiro
      if (imageFile) {
        console.log('Fazendo upload da nova imagem');
        imageUrl = await handleImageUpload(imageFile);
      }
      
      const dataToSubmit = { ...formData, image_url: imageUrl };
      
      if (item) {
        console.log('Atualizando item existente:', item.id);
        await updateMenuItem(item.id, dataToSubmit);
        toast({
          title: "Item atualizado",
          description: `${formData.name} foi atualizado com sucesso!`,
        });
      } else {
        console.log('Criando novo item');
        await addMenuItem(dataToSubmit);
        toast({
          title: "Item criado",
          description: `${formData.name} foi adicionado ao cardápio!`,
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o item. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log('Alterando campo:', field, '=', value);
    
    if (field === 'price') {
      handlePriceChange(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Validar campo em tempo real
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const removeImagePreview = () => {
    setImagePreview('');
    setImageFile(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    setErrors(prev => ({ ...prev, image_url: 'Imagem é obrigatória' }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-poker-gray-medium border-poker-gold/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-poker-gold flex items-center gap-2 text-xl">
            <ChefHat className="w-6 h-6" />
            {item ? 'Editar Item do Cardápio' : 'Adicionar Novo Item'}
          </DialogTitle>
        </DialogHeader>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2 text-white">Categoria *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {CATEGORIES.map((category) => (
                <motion.div
                  key={category.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    type="button"
                    onClick={() => handleChange('category', category.value)}
                    className={`w-full p-3 rounded-lg border transition-all duration-300 text-sm font-medium ${
                      formData.category === category.value
                        ? 'border-poker-gold bg-poker-gold/20 text-poker-gold'
                        : 'border-poker-gold/30 bg-poker-black/50 text-gray-300 hover:border-poker-gold/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div>{category.label}</div>
                  </button>
                </motion.div>
              ))}
            </div>
            {errors.category && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </motion.p>
            )}
          </div>

          {/* Mais Pedidos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 border border-poker-gold/30 rounded-lg bg-poker-black/50">
              <input 
                type="checkbox" 
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-5 h-5 accent-poker-gold"
              />
              <label htmlFor="featured" className="text-sm font-medium text-white cursor-pointer flex items-center gap-2">
                <span className="text-lg">👍</span>
                <div>
                  <div className="font-medium">Marcar como mais pedido</div>
                  <div className="text-xs text-gray-400">Pratos mais pedidos aparecem na seção principal do site (máximo 3)</div>
                </div>
              </label>
            </div>
          </div>

          {/* Nome e Preço */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Nome do Item *</label>
              <Input 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Hambúrguer Artesanal"
                className={`bg-poker-black border transition-all duration-300 text-white focus:ring-2 focus:ring-poker-gold/50 ${
                  errors.name ? 'border-red-500' : 'border-poker-gold/30 focus:border-poker-gold'
                }`}
                required
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </motion.p>
                )}
                {!errors.name && formData.name.length >= 3 && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-sm mt-1 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Nome válido
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-poker-gold" />
                Preço *
              </label>
              <Input 
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="R$ 0,00"
                className={`bg-poker-black border transition-all duration-300 text-white focus:ring-2 focus:ring-poker-gold/50 ${
                  errors.price ? 'border-red-500' : 'border-poker-gold/30 focus:border-poker-gold'
                }`}
                required
              />
              {errors.price && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.price}
                </motion.p>
              )}
            </div>
          </div>
          
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Descrição *</label>
            <Textarea 
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva os ingredientes e características do item..."
              className={`bg-poker-black border transition-all duration-300 text-white focus:ring-2 focus:ring-poker-gold/50 ${
                errors.description ? 'border-red-500' : 'border-poker-gold/30 focus:border-poker-gold'
              }`}
              rows={3}
              required
            />
            <div className="flex items-center justify-between mt-1">
              <AnimatePresence>
                {errors.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </motion.p>
                )}
              </AnimatePresence>
              <span className={`text-xs ${
                formData.description.length < 10 ? 'text-gray-500' : 'text-green-400'
              }`}>
                {formData.description.length}/250
              </span>
            </div>
          </div>
          
          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-poker-gold" />
              Imagem do Item *
            </label>
            
            <motion.div 
              className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                isDragOver 
                  ? 'border-poker-gold bg-poker-gold/10' 
                  : errors.image_url
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-poker-gold/30 hover:border-poker-gold/50 hover:bg-poker-gold/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                {uploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-12 h-12 text-poker-gold mb-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center"
                  >
                    <FileImage className="w-12 h-12 text-poker-gold mb-4" />
                    <span className="text-poker-gold text-lg font-medium mb-2">
                      Arraste uma imagem ou clique aqui
                    </span>
                    <span className="text-gray-400 text-sm">
                      PNG, JPG, WEBP - Qualquer tamanho
                    </span>
                  </motion.div>
                )}
              </label>
            </motion.div>
            
            {errors.image_url && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.image_url}
              </motion.p>
            )}
          </div>
          
          {/* Preview da Imagem */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-white">Preview</label>
                <div className="relative w-40 h-40 border border-poker-gold/30 rounded-xl overflow-hidden group">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      console.log('Erro ao carregar imagem preview:', imagePreview);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.button
                      type="button"
                      onClick={removeImagePreview}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Botões */}
          <div className="flex gap-3 pt-6 border-t border-poker-gold/20">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button 
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-poker-gold text-poker-black hover:bg-poker-gold-light disabled:opacity-50 font-semibold py-3"
              >
                {loading || uploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploading ? 'Enviando imagem...' : 'Salvando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {item ? 'Atualizar Item' : 'Adicionar Item'}
                  </div>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || uploading}
                className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10 px-6"
              >
                Cancelar
              </Button>
            </motion.div>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};
