
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

export interface SiteImage {
  id: string;
  type: string;
  title: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export const useSiteImages = () => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'site_image')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedImages = data?.map(item => ({
        id: item.id,
        type: item.title, // hero_background, about_image, etc.
        title: item.title,
        image_url: item.content,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setImages(formattedImages);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      // Usando o toast do Sonner em vez do toast padrão
      sonnerToast.error("Não foi possível carregar as imagens.");
    } finally {
      setLoading(false);
    }
  };

  const saveImage = async (imageType: string, imageUrl: string) => {
    try {
      console.log('Salvando imagem:', imageType, imageUrl);
      
      // Primeiro verificar se já existe um registro para este tipo de imagem
      const { data: existingData } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'site_image')
        .eq('title', imageType)
        .maybeSingle();
      
      let result;
      
      if (existingData) {
        // Se existe, atualiza o registro
        const { data, error } = await supabase
          .from('site_content')
          .update({
            content: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Se não existe, insere um novo registro
        const { data, error } = await supabase
          .from('site_content')
          .insert([{
            type: 'site_image',
            title: imageType,
            content: imageUrl
          }])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      await fetchImages();
      // Usando o toast do Sonner em vez do toast padrão
      sonnerToast.success("Imagem atualizada com sucesso!");
      return result;
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      // Usando o toast do Sonner em vez do toast padrão
      sonnerToast.error("Não foi possível salvar a imagem.");
      throw error;
    }
  };

  const getImageUrl = (imageType: string, fallbackUrl: string) => {
    const image = images.find(img => img.type === imageType);
    return image?.image_url || fallbackUrl;
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const uploadImage = async (file: File, imageType?: string): Promise<string> => {
    try {
      console.log('Iniciando upload de arquivo:', file.name, file.type, file.size);
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      // Criar uma pasta baseada no tipo de imagem, se fornecido
      const folderPath = imageType ? `${imageType}` : 'general';
      const filePath = `lovable-uploads/${folderPath}/${fileName}`;
      
      // Usar o bucket 'menu-images' existente
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log('Buckets disponíveis:', buckets);
        
        // Vamos usar o bucket 'menu-images' que já existe
        const bucketName = 'menu-images';
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Bucket '${bucketName}' não encontrado, tentando usar o bucket padrão...`);
        } else {
          console.log(`Bucket '${bucketName}' encontrado, prosseguindo com upload`);
        }
      } catch (bucketError) {
        console.error('Erro ao verificar buckets:', bucketError);
      }
      
      // Upload do arquivo para o Storage usando o bucket 'menu-images'
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type // Garantir que o tipo de conteúdo seja preservado
        });

      if (uploadError) {
        console.error('Erro específico do upload:', uploadError);
        throw uploadError;
      }
      
      // Obter a URL pública do arquivo
      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);
      
      // Se um tipo de imagem foi fornecido, salvar a referência no banco de dados
      if (imageType) {
        try {
          await saveImage(imageType, data.publicUrl);
          console.log(`Imagem salva com tipo: ${imageType}`);
          // Usando o toast do Sonner em vez do toast padrão
          sonnerToast.success(`Imagem enviada e aplicada como ${imageType} com sucesso!`);
        } catch (saveError) {
          console.error('Erro ao salvar referência da imagem:', saveError);
          // A imagem foi enviada, mas não foi possível salvar a referência
          sonnerToast.warning("Imagem enviada, mas não foi possível aplicá-la à seção selecionada.");
        }
      } else {
        // Usando o toast do Sonner em vez do toast padrão
        sonnerToast.success("Imagem enviada com sucesso!");
      }
      
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      
      // Tentar extrair mensagem de erro mais específica
      let errorMessage = "Não foi possível fazer o upload da imagem.";
      if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = `Erro: ${JSON.stringify(error)}`;
      }
      
      // Usando o toast do Sonner em vez do toast padrão
      sonnerToast.error(errorMessage);
      
      throw error;
    }
  };

  const deleteImage = async (image: SiteImage) => {
    try {
      // Extrai o caminho relativo do arquivo a partir da URL pública
      const urlParts = image.image_url.split('/menu-images/');
      const filePath = urlParts[1];
      if (!filePath) throw new Error('Caminho do arquivo não encontrado na URL da imagem.');

      // Remove do Storage
      const { error: storageError } = await supabase.storage.from('menu-images').remove([filePath]);
      if (storageError) throw storageError;

      // Remove do banco de dados
      const { error: dbError } = await supabase.from('site_content').delete().eq('id', image.id);
      if (dbError) throw dbError;

      // Atualiza a lista de imagens
      await fetchImages();
      sonnerToast.success('Imagem apagada com sucesso!');
    } catch (error) {
      console.error('Erro ao apagar imagem:', error);
      sonnerToast.error('Não foi possível apagar a imagem.');
      throw error;
    }
  };
  return {
    images,
    loading,
    saveImage,
    getImageUrl,
    uploadImage,
    refetch: fetchImages,
    deleteImage,
  };
};
