import { useState, useEffect, useMemo } from 'react';
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
  console.log('Inicializando hook useSiteImages');
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Criar objeto de imagens para acesso fácil por tipo
  const imagesObject = useMemo(() => {
    console.log('Calculando imagesObject com', images.length, 'imagens');
    const obj: Record<string, string> = {};
    images.forEach(img => {
      if (img.type && img.image_url) {
        obj[img.type] = img.image_url;
      }
    });
    return obj;
  }, [images]);
  
  // Carregar imagens ao inicializar o componente
  useEffect(() => {
    console.log('Efeito de inicialização - carregando imagens');
    fetchImages();
  }, []);

  let BUCKET_NAME = 'meu-itens';

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de imagens... [DEBUG]');
      
      // Verificar quais buckets existem e usar o correto
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error('Erro ao listar buckets:', bucketsError);
        } else {
          console.log('Buckets disponíveis:', buckets.map(b => b.name));
          
          // Verificar se algum dos buckets que queremos existe
          const meuItensBucketExists = buckets.some(b => b.name === 'meu-itens');
          const menuImagesBucketExists = buckets.some(b => b.name === 'menu-images');
          
          if (meuItensBucketExists) {
            BUCKET_NAME = 'meu-itens';
            console.log('Usando bucket existente: meu-itens');
          } else if (menuImagesBucketExists) {
            BUCKET_NAME = 'menu-images';
            console.log('Usando bucket existente: menu-images');
          } else {
            // Nenhum dos buckets existe, vamos criar um
            console.log('Nenhum bucket encontrado. Tentando criar o bucket meu-itens...');
            try {
              const { data, error } = await supabase.storage.createBucket('meu-itens', {
                public: true
              });
              
              if (error) {
                console.error('Erro ao criar bucket meu-itens:', error);
                // Tentar criar o outro bucket como fallback
                const { data: data2, error: error2 } = await supabase.storage.createBucket('menu-images', {
                  public: true
                });
                
                if (error2) {
                  console.error('Erro ao criar bucket menu-images:', error2);
                } else {
                  BUCKET_NAME = 'menu-images';
                  console.log('Bucket menu-images criado com sucesso');
                }
              } else {
                BUCKET_NAME = 'meu-itens';
                console.log('Bucket meu-itens criado com sucesso');
              }
            } catch (e) {
              console.error('Exceção ao criar bucket:', e);
            }
          }
        }
      } catch (e) {
        console.error('Exceção ao verificar buckets:', e);
      }
      
      console.log(`Usando bucket: ${BUCKET_NAME} para operações de imagem`);
      
      // Buscar imagens do banco de dados (site_content)
      const { data: dbImages, error: dbError } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'site_image')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Erro ao buscar imagens do banco:', dbError);
        throw dbError;
      }
      
      console.log('Imagens encontradas no banco:', dbImages?.length || 0);
      
      // Formatar imagens do banco de dados
      const formattedDbImages = dbImages?.map(item => ({
        id: item.id,
        type: item.title, // hero_background, about_image, etc.
        title: item.title,
        image_url: item.content,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      // Buscar TODAS as imagens do bucket
      // Primeiro, listar a pasta raiz
      console.log('Buscando arquivos no bucket menu-images...');
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' },
        });
      
      console.log('Resposta da API de listagem:', { data: rootFiles, error: rootError });
        
      if (rootError) {
        console.error('Erro ao listar arquivos da raiz do bucket:', rootError);
        console.error('Detalhes do erro:', JSON.stringify(rootError));
        // Mesmo com erro, continuar com as imagens do banco
        setImages(formattedDbImages);
        setLoading(false);
        return;
      }
      
      // Se não houver arquivos, verificar se o bucket existe
      if (!rootFiles || rootFiles.length === 0) {
        console.log('Nenhum arquivo encontrado no bucket. Verificando se o bucket existe...');
        
        // Tentar listar buckets disponíveis
        try {
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          
          if (bucketsError) {
            console.error('Erro ao listar buckets:', bucketsError);
          } else {
            console.log('Buckets disponíveis:', buckets.map(b => b.name));
            
            // Verificar se o bucket 'menu-images' existe
            const bucketExists = buckets.some(b => b.name === 'menu-images');
            console.log(`O bucket 'menu-images' ${bucketExists ? 'existe' : 'NÃO existe'}!`);
            
            if (!bucketExists) {
              console.log('Tentando criar o bucket menu-images...');
              try {
                const { data, error } = await supabase.storage.createBucket('menu-images', {
                  public: true
                });
                if (error) {
                  console.error('Erro ao criar bucket:', error);
                } else {
                  console.log('Bucket criado com sucesso:', data);
                }
              } catch (e) {
                console.error('Exceção ao criar bucket:', e);
              }
            }
          }
        } catch (e) {
          console.error('Exceção ao listar buckets:', e);
        }
      }
      
      console.log('Arquivos na raiz do bucket:', rootFiles);
      console.log('Quantidade de arquivos encontrados:', rootFiles?.length || 0);
      
      // Lista para armazenar todos os arquivos
      let allBucketFiles = [];
      
      // Adicionar arquivos da raiz (exceto pastas)
      const rootImages = (rootFiles || []).filter(file => !file.id.endsWith('/'));
      console.log('Imagens na raiz (excluindo pastas):', rootImages.length);
      allBucketFiles.push(...rootImages);
      
      // Listar todas as pastas na raiz
      const folders = (rootFiles || []).filter(file => file.id.endsWith('/'));
      console.log('Pastas encontradas:', folders.map(f => f.name));
      
      // Para cada pasta, listar seu conteúdo
      for (const folder of folders) {
        const folderPath = folder.name;
        console.log(`Listando conteúdo da pasta: ${folderPath}`);
        
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folderPath, {
            sortBy: { column: 'created_at', order: 'desc' },
          });
          
        if (folderError) {
          console.error(`Erro ao listar arquivos da pasta ${folderPath}:`, folderError);
          continue;
        }
        
        // Adicionar arquivos da pasta (não subpastas)
        const folderImages = (folderFiles || []).filter(file => !file.id.endsWith('/'));
        
        // Adicionar caminho da pasta ao nome do arquivo com tipagem correta
        const folderImagesWithPath = folderImages.map(file => ({
          ...file,
          // Adicionando propriedade customizada com caminho completo
          customPath: `${folderPath}${file.name}`
        }));
        
        allBucketFiles.push(...folderImagesWithPath);
      }
      
      console.log('Total de arquivos encontrados no bucket:', allBucketFiles.length);
      
      // Criar registros para imagens que estão no bucket
      const bucketImages = allBucketFiles.map(file => {
        // Determinar o caminho correto do arquivo para a URL pública
        const fullPath = (file as any).customPath || file.name;
        
        // Obter URL pública
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
        
        return {
          id: `bucket-${fullPath}`,
          type: 'gallery_image', // Todas as imagens do bucket são consideradas da galeria
          title: file.name,
          image_url: data.publicUrl,
          created_at: file.created_at || new Date().toISOString(),
          updated_at: file.updated_at || new Date().toISOString()
        };
      });
      
      console.log(`Encontradas ${formattedDbImages.length} imagens no banco e ${bucketImages.length} no bucket`);
      
      // Combinar imagens do banco com imagens do bucket
      // Mostrar todas as imagens do bucket, independentemente se estão no banco ou não
      // Isso garante que todas as imagens do bucket sejam exibidas
      console.log('Todas as imagens do bucket:', bucketImages);
      
      // Apenas para depuração - verificar se há URLs duplicadas
      const uniqueUrls = new Set();
      bucketImages.forEach(img => {
        if (uniqueUrls.has(img.image_url)) {
          console.log('URL duplicada encontrada:', img.image_url);
        } else {
          uniqueUrls.add(img.image_url);
        }
      });
      
      // Usar todas as imagens do bucket e adicionar as imagens do banco que não estão no bucket
      const bucketUrls = new Set(bucketImages.map(img => img.image_url));
      const uniqueDbImages = formattedDbImages.filter(img => !bucketUrls.has(img.image_url));
      
      const allImages = [...bucketImages, ...uniqueDbImages];
      setImages(allImages);
      console.log(`Total de ${allImages.length} imagens únicas carregadas`);
      console.log('Primeiras 5 imagens:', allImages.slice(0, 5));
      
      // Se não houver imagens, tentar fazer upload de uma imagem de teste
      if (allImages.length === 0) {
        console.log('Nenhuma imagem encontrada. Verificando permissões do bucket...');
        
        // Verificar permissões do bucket
        try {
          const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
          
          if (bucketError) {
            console.error('Erro ao obter informações do bucket:', bucketError);
          } else {
            console.log('Informações do bucket:', bucketData);
          }
        } catch (e) {
          console.error('Exceção ao verificar bucket:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
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
      
      // Definir caminho do arquivo - simplificado para evitar problemas de path
      let filePath;
      if (imageType) {
        // Se tiver tipo, salvar em pasta específica
        filePath = `${imageType}/${fileName}`;
      } else {
        // Se não tiver tipo, salvar na raiz
        filePath = fileName;
      }
      
      console.log(`Salvando arquivo em: ${filePath}`);
      
      // Verificar tamanho do arquivo
      console.log(`Tamanho do arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      
      // Upload do arquivo para o Storage usando o bucket 'menu-images'
      // Usando uploadToSignedUrl para arquivos grandes (>10MB)
      let uploadResult;
      
      if (file.size > 10 * 1024 * 1024) { // Se for maior que 10MB
        console.log('Arquivo grande detectado, usando upload com URL assinada');
        
        // Passo 1: Criar URL assinada
        const { data: signedURLData, error: signedURLError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUploadUrl(filePath);
          
        if (signedURLError) {
          console.error('Erro ao criar URL assinada:', signedURLError);
          throw signedURLError;
        }
        
        // Passo 2: Fazer upload usando a URL assinada
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .uploadToSignedUrl(filePath, signedURLData.token, file, {
            contentType: file.type
          });
          
        if (uploadError) {
          console.error('Erro ao fazer upload com URL assinada:', uploadError);
          throw uploadError;
        }
        
        uploadResult = { data: uploadData, error: null };
      } else {
        // Upload normal para arquivos menores
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type // Garantir que o tipo de conteúdo seja preservado
          });
          
        if (uploadError) {
          console.error('Erro específico do upload:', uploadError);
          throw uploadError;
        }
        
        uploadResult = { data: uploadData, error: null };
      }

      console.log('Upload concluído com sucesso:', uploadResult.data);
      
      // Obter a URL pública do arquivo
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      console.log('URL pública gerada:', data.publicUrl);
      
      // Salvar a referência no banco de dados
      try {
        // Usar um tipo efetivo para todas as imagens
        const effectiveType = imageType || 'gallery_image';
        
        // Salvar no banco de dados
        const savedImage = await saveImage(effectiveType, data.publicUrl);
        console.log('Imagem salva no banco de dados:', savedImage);
        
        // Recarregar imagens para atualizar a galeria
        await fetchImages();
        
        if (imageType) {
          sonnerToast.success(`Imagem aplicada como ${imageType} com sucesso!`);
        } else {
          sonnerToast.success("Imagem salva na galeria com sucesso!");
        }
      } catch (saveError) {
        console.error('Erro ao salvar referência da imagem:', saveError);
        sonnerToast.warning("Imagem enviada, mas não foi possível registrá-la no banco de dados.");
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
      
      sonnerToast.error(errorMessage);
      throw error;
    }
  };

  const deleteImage = async (image: SiteImage) => {
    try {
      console.log('Tentando apagar imagem:', image);
      
      // Verificar se temos um objeto de imagem válido
      if (!image || !image.image_url) {
        console.error('Objeto de imagem inválido:', image);
        sonnerToast.error('Dados da imagem inválidos.');
        return;
      }

      // Extrai o caminho relativo do arquivo a partir da URL pública
      // Verificar qual bucket está sendo usado na URL
      let filePath;
      if (image.image_url.includes('/meu-itens/')) {
        const urlParts = image.image_url.split('/meu-itens/');
        filePath = urlParts[1];
        console.log('URL parts (meu-itens):', urlParts);
      } else if (image.image_url.includes('/menu-images/')) {
        const urlParts = image.image_url.split('/menu-images/');
        filePath = urlParts[1];
        console.log('URL parts (menu-images):', urlParts);
      } else {
        console.error('URL não contém o nome do bucket esperado:', image.image_url);
        throw new Error('Formato de URL inválido');
      }
      
      if (!filePath) {
        console.error('Não foi possível extrair o caminho do arquivo da URL:', image.image_url);
        throw new Error('Formato de URL inválido');
      }
      
      console.log('Removendo arquivo do storage:', filePath);

      // Remove do Storage
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (storageError) {
        console.error('Erro ao remover do storage:', storageError);
        throw storageError;
      }

      console.log('Removendo registro do banco de dados, ID:', image.id);
      // Remove do banco de dados
      const { error: dbError } = await supabase.from('site_content')
        .delete()
        .eq('id', image.id);
        
      if (dbError) {
        console.error('Erro ao remover do banco de dados:', dbError);
        throw dbError;
      }

      console.log('Imagem apagada com sucesso!');
      // Atualiza a lista de imagens
      await fetchImages();
      sonnerToast.success('Imagem apagada com sucesso!');
    } catch (error) {
      console.error('Erro ao apagar imagem:', error);
      sonnerToast.error('Não foi possível apagar a imagem.');
      throw error;
    }
  };
  // Já temos imagesObject definido com useMemo acima

  console.log('Retornando do hook useSiteImages:', { imagesLength: images.length, loading });
  return {
    images,
    imagesList: images,  // Adicionar imagesList para compatibilidade
    imagesObject,
    loading,
    saveImage,
    uploadImage,
    deleteImage,
    fetchImages,
    getImageUrl
  };
};
