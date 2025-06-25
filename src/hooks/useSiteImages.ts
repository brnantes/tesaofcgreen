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
  
  // Carregar imagens  // Inicializar o hook
  useEffect(() => {
    console.log('Inicializando hook useSiteImages - useEffect');
    fetchImages();
  }, []);

  // [Cascade] Usar sempre o bucket unificado 'menu-images' para todas as operações de imagem
const BUCKET_NAME = 'menu-images';

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de imagens... [DEBUG]');
      
      // [Cascade] Não há mais lógica de múltiplos buckets. Usar sempre o bucket 'menu-images' para operações de imagem
      console.log(`[Cascade] Usando bucket existente: ${BUCKET_NAME} para operações de imagem`);
      
      // Buscar imagens do banco de dados (site_content)
    const { data: dbImages, error: dbError } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'site_image')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('Erro ao buscar imagens do banco:', dbError);
      // Não lançar exceção, apenas registrar o erro e continuar com array vazio
      console.log('Continuando com array vazio para imagens do banco');
    }
      
      console.log('Imagens encontradas no banco:', dbImages?.length || 0);
      
      // Formatar imagens do banco de dados
      const dbImagesFormatted = dbImages?.map(item => ({
        id: item.id,
        type: item.title, // hero_background, about_image, etc.
        title: item.title,
        image_url: item.content,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      // Buscar TODAS as imagens do bucket
      // Primeiro, listar a pasta raiz
      console.log(`[Cascade] Buscando arquivos no bucket ${BUCKET_NAME}...`);
      let rootFiles = [];
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list('', {
            sortBy: { column: 'created_at', order: 'desc' },
          });
        
        console.log('Resposta da API de listagem:', { data, error });
          
        if (error) {
          console.error('Erro ao listar arquivos da raiz do bucket:', error);
          console.error('Detalhes do erro:', JSON.stringify(error));
          // Não mostrar erro ao usuário, apenas registrar no console
          console.log('Continuando com array vazio para arquivos do bucket');
        } else {
          rootFiles = data || [];
        }
      } catch (e) {
        console.error('Exceção ao listar arquivos do bucket:', e);
        // Continuar com array vazio
        rootFiles = [];
      }
      
      // Se não houver arquivos, registrar no console apenas
      if (!rootFiles || rootFiles.length === 0) {
        console.log('Nenhum arquivo encontrado no bucket.');
      }
      
      console.log('Arquivos na raiz do bucket:', rootFiles);
      console.log('Quantidade de arquivos encontrados:', rootFiles?.length || 0);
      
      // Lista para armazenar todos os arquivos
      let allBucketFiles = [];
      
      try {
        // Adicionar arquivos da raiz (exceto pastas)
        const rootImages = (rootFiles || []).filter(file => !file.id?.endsWith('/'));
        console.log('Imagens na raiz (excluindo pastas):', rootImages.length);
        allBucketFiles.push(...rootImages);
        
        // Listar todas as pastas na raiz
        const folders = (rootFiles || []).filter(file => file.id?.endsWith('/'));
        console.log('Pastas encontradas:', folders.map(f => f.name));
        
        // Para cada pasta, listar seu conteúdo
        for (const folder of folders) {
          try {
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
            const folderImages = (folderFiles || []).filter(file => !file.id?.endsWith('/'));
            
            // Adicionar caminho da pasta ao nome do arquivo com tipagem correta
            const folderImagesWithPath = folderImages.map(file => ({
              ...file,
              // Adicionando propriedade customizada com caminho completo
              customPath: `${folderPath}${file.name}`
            }));
            
            allBucketFiles.push(...folderImagesWithPath);
          } catch (folderError) {
            console.error('Erro ao processar pasta:', folder.name, folderError);
            // Continuar com a próxima pasta
          }
        }
      } catch (filesError) {
        console.error('Erro ao processar arquivos do bucket:', filesError);
        // Continuar com array vazio
        allBucketFiles = [];
      }
      
      console.log('Total de arquivos encontrados no bucket:', allBucketFiles.length);
      
      // Criar registros para imagens que estão no bucket
      let bucketImages = [];
      try {
        bucketImages = allBucketFiles.map(file => {
          try {
            // Determinar o caminho correto do arquivo para a URL pública
            const fullPath = (file as any).customPath || file.name;
            
            // Obter URL pública
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
            
            // Verificar se a URL pública é válida
            const publicUrl = data?.publicUrl || '';
            
            // Validar se a URL é válida antes de retornar
            if (!publicUrl || !publicUrl.startsWith('http')) {
              console.warn(`URL inválida para arquivo ${fullPath}: ${publicUrl}`);
              return null;
            }
            
            return {
              id: `bucket-${fullPath}`,
              type: 'gallery_image', // Todas as imagens do bucket são consideradas da galeria
              title: file.name || 'imagem',
              image_url: publicUrl,
              created_at: file.created_at || new Date().toISOString(),
              updated_at: file.updated_at || new Date().toISOString()
            };
          } catch (fileError) {
            console.error('Erro ao processar arquivo individual:', file.name, fileError);
            // Retornar objeto vazio que será filtrado depois
            return null;
          }
        }).filter(Boolean); // Remover itens nulos
      } catch (e) {
        console.error('Erro ao mapear arquivos do bucket:', e);
        bucketImages = [];
      }
      
      // Garantir que formattedDbImages seja sempre um array válido
      const formattedDbImages = dbImages?.map(item => ({
        id: item.id,
        type: item.title, // hero_background, about_image, etc.
        title: item.title,
        image_url: item.content,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      console.log(`Encontradas ${formattedDbImages.length} imagens no banco e ${bucketImages.length} no bucket`);
      
      // Filtrar imagens do bucket para remover URLs inválidas
      const validBucketImages = bucketImages.filter(img => img && img.image_url);
      console.log('Imagens válidas do bucket:', validBucketImages.length);
      
      // Usar todas as imagens do bucket e adicionar as imagens do banco que não estão no bucket
      try {
        const bucketUrls = new Set(validBucketImages.map(img => img.image_url));
        const uniqueDbImages = formattedDbImages.filter(img => img && img.image_url && !bucketUrls.has(img.image_url));
        
        const allImages = [...validBucketImages, ...uniqueDbImages];
        setImages(allImages);
        console.log(`Total de ${allImages.length} imagens únicas carregadas`);
        if (allImages.length > 0) {
          console.log('Primeiras 5 imagens:', allImages.slice(0, 5));
        }
      } catch (combineError) {
        console.error('Erro ao combinar imagens:', combineError);
        // Em caso de erro, usar apenas as imagens do banco
        setImages(formattedDbImages);
      }
      
      // Se não houver imagens, verificar permissões do bucket
      if (images.length === 0) {
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
      
      if (!imageType || !imageUrl) {
        console.error('Tipo de imagem ou URL inválidos:', { imageType, imageUrl });
        sonnerToast.error("Dados da imagem inválidos.");
        return null;
      }
      
      // Verificar se a URL da imagem é válida
      if (!imageUrl.startsWith('http')) {
        console.error('URL de imagem inválida:', imageUrl);
        sonnerToast.error("URL da imagem inválida.");
        return null;
      }
      
      console.log(`Salvando imagem do tipo '${imageType}' com URL: ${imageUrl}`);
      
      // Primeiro verificar se já existe um registro para este tipo de imagem
      const { data: existingData, error: queryError } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', imageType)
        .maybeSingle();
      
      if (queryError) {
        console.error('Erro ao verificar imagem existente:', queryError);
      }
      
      console.log('Registro existente:', existingData);
      
      let result;
      
      if (existingData) {
        // Se existe, atualiza o registro
        console.log(`Atualizando registro existente ID ${existingData.id} para ${imageType}`);
        const { data, error } = await supabase
          .from('site_content')
          .update({
            content: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao atualizar registro:', error);
          throw error;
        }
        result = data;
        console.log('Registro atualizado com sucesso:', result);
      } else {
        // Se não existe, insere um novo registro
        console.log(`Criando novo registro para ${imageType}`);
        const { data, error } = await supabase
          .from('site_content')
          .insert([{
            type: imageType,
            title: imageType,
            content: imageUrl
          }])
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao inserir novo registro:', error);
          throw error;
        }
        result = data;
        console.log('Novo registro criado com sucesso:', result);
      }
      
      // Atualizar o estado local imediatamente para refletir a mudança
      // Isso garante que a interface seja atualizada mesmo antes de fetchImages() completar
      setImages(prevImages => {
        // Verificar se já existe uma imagem com este tipo
        const existingIndex = prevImages.findIndex(img => img.type === imageType);
        
        if (existingIndex >= 0) {
          // Atualizar a imagem existente
          const updatedImages = [...prevImages];
          updatedImages[existingIndex] = {
            ...updatedImages[existingIndex],
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          };
          return updatedImages;
        } else {
          // Adicionar nova imagem
          return [...prevImages, {
            id: `temp-${Date.now()}`,
            type: imageType,
            title: imageType,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
        }
      });
      
      // Recarregar imagens para garantir sincronização com o banco
      fetchImages();
      sonnerToast.success("Imagem atualizada com sucesso!");
      return result;
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      sonnerToast.error("Não foi possível salvar a imagem.");
      throw error;
    }
  };

  const getImageUrl = (imageType: string, fallbackUrl: string) => {
    console.log(`Buscando imagem do tipo: ${imageType}`);
    console.log(`Total de imagens disponíveis: ${images.length}`);
    
    // Primeiro, procurar nas imagens do site (site_content)
    const image = images.find(img => img.type === imageType);
    
    if (image && image.image_url) {
      console.log(`Imagem encontrada para ${imageType}:`, image.image_url);
      return image.image_url;
    }
    
    // Se não encontrou, procurar nas imagens da galeria que tenham o nome correspondente
    const galleryImage = images.find(img => 
      img.title && img.title.toLowerCase().includes(imageType.toLowerCase())
    );
    
    if (galleryImage && galleryImage.image_url) {
      console.log(`Imagem de galeria encontrada para ${imageType}:`, galleryImage.image_url);
      return galleryImage.image_url;
    }
    
    console.log(`Nenhuma imagem encontrada para ${imageType}, usando fallback:`, fallbackUrl);
    return fallbackUrl;
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

      // Primeiro, remover do banco de dados se a imagem tiver um ID válido
      let removedFromDB = false;
      if (image.id && !image.id.startsWith('temp-') && !image.id.startsWith('bucket-')) {
        console.log('Removendo registro do banco de dados, ID:', image.id);
        
        try {
          const { error: dbError } = await supabase.from('site_content')
            .delete()
            .eq('id', image.id);
            
          if (dbError) {
            console.error('Erro ao remover do banco de dados:', dbError);
            sonnerToast.warning('Erro ao remover registro do banco de dados.');
          } else {
            console.log('Registro removido do banco de dados com sucesso');
            removedFromDB = true;
          }
        } catch (dbError) {
          console.error('Exceção ao remover do banco de dados:', dbError);
          sonnerToast.warning('Erro ao acessar o banco de dados.');
        }
      } else {
        console.log('Imagem não tem ID válido no banco de dados ou é temporária:', image.id);
      }

      // Agora, remover o arquivo do storage
      let removedFromStorage = false;
      let filePath = null;
      
      // Método 1: Tentar extrair o caminho do arquivo da URL pública usando padrões conhecidos
      const urlPatterns = [
        { pattern: '/menu-images/', bucket: 'menu-images' },
        { pattern: '/meu-itens/', bucket: 'meu-itens' },  // legado
        { pattern: '/menu-itens/', bucket: 'menu-itens' }  // legado
      ];
      
      for (const { pattern, bucket } of urlPatterns) {
        if (image.image_url.includes(pattern)) {
          const urlParts = image.image_url.split(pattern);
          if (urlParts.length > 1) {
            filePath = urlParts[1];
            console.log(`Caminho do arquivo (${bucket}):`, filePath);
            
            // Remover do bucket atual
            try {
              console.log(`Tentando remover ${filePath} do bucket ${BUCKET_NAME}`);
              const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
              
              if (storageError) {
                console.error('Erro ao remover do storage:', storageError);
              } else {
                console.log('Arquivo removido do storage com sucesso');
                removedFromStorage = true;
              }
            } catch (storageError) {
              console.error('Exceção ao remover do storage:', storageError);
            }
            
            // Se estamos lidando com um bucket legado, tentar remover do bucket atual também
            if (bucket !== BUCKET_NAME) {
              try {
                console.log(`Tentando remover também do bucket legado ${bucket}`);
                await supabase.storage.from(bucket).remove([filePath]);
              } catch (legacyError) {
                console.log('Erro ao tentar remover do bucket legado (esperado):', legacyError);
              }
            }
            
            break;
          }
        }
      }
      
      // Método 2: Se não conseguiu pelo método 1, tentar extrair o nome do arquivo da URL
      if (!filePath) {
        try {
          const url = new URL(image.image_url);
          const pathname = url.pathname;
          const parts = pathname.split('/');
          const filename = parts[parts.length - 1];
          
          if (filename && filename.includes('.')) {
            filePath = filename;
            console.log('Extraindo nome do arquivo da URL:', filePath);
            
            // Tentar remover usando apenas o nome do arquivo
            try {
              console.log(`Tentando remover ${filePath} do bucket ${BUCKET_NAME}`);
              const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
              
              if (storageError) {
                console.error('Erro ao remover do storage usando nome do arquivo:', storageError);
              } else {
                console.log('Arquivo removido do storage com sucesso usando nome do arquivo');
                removedFromStorage = true;
              }
            } catch (storageError) {
              console.error('Exceção ao remover do storage usando nome do arquivo:', storageError);
            }
          }
        } catch (e) {
          console.error('Erro ao analisar URL:', e);
        }
      }
      
      // Método 3: Última tentativa - listar arquivos do bucket e procurar por correspondência
      if (!removedFromStorage) {
        try {
          console.log('Tentando encontrar o arquivo listando o bucket...');
          const { data: files, error: listError } = await supabase.storage.from(BUCKET_NAME).list();
          
          if (listError) {
            console.error('Erro ao listar arquivos do bucket:', listError);
          } else if (files && files.length > 0) {
            // Extrair o nome do arquivo da URL da imagem
            const urlFilename = image.image_url.split('/').pop() || '';
            console.log('Procurando por arquivo com nome:', urlFilename);
            
            // Procurar por um arquivo que corresponda ao nome do arquivo na URL
            const matchingFile = files.find(file => 
              file.name === urlFilename || 
              (urlFilename && file.name.includes(urlFilename))
            );
            
            if (matchingFile) {
              console.log('Arquivo correspondente encontrado:', matchingFile.name);
              
              try {
                const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([matchingFile.name]);
                
                if (removeError) {
                  console.error('Erro ao remover arquivo correspondente:', removeError);
                } else {
                  console.log('Arquivo correspondente removido com sucesso');
                  removedFromStorage = true;
                }
              } catch (removeError) {
                console.error('Exceção ao remover arquivo correspondente:', removeError);
              }
            } else {
              console.log('Nenhum arquivo correspondente encontrado no bucket');
            }
          }
        } catch (listError) {
          console.error('Exceção ao listar arquivos do bucket:', listError);
        }
      }

      // Atualizar a lista de imagens independentemente do resultado
      console.log('Atualizando lista de imagens...');
      await fetchImages();
      
      // Atualizar o estado local removendo a imagem excluída
      setImages(prevImages => prevImages.filter(img => img.image_url !== image.image_url));
      
      // Mostrar mensagem apropriada com base no resultado
      if (removedFromDB && removedFromStorage) {
        sonnerToast.success('Imagem removida com sucesso do banco e do storage!');
      } else if (removedFromDB) {
        sonnerToast.success('Imagem removida do banco de dados, mas não foi possível remover do storage.');
      } else if (removedFromStorage) {
        sonnerToast.success('Imagem removida do storage, mas não foi possível remover do banco de dados.');
      } else {
        sonnerToast.warning('Não foi possível remover completamente a imagem. Tente novamente.');
      }
      
      return { removedFromDB, removedFromStorage };
    } catch (error) {
      console.error('Erro ao apagar imagem:', error);
      sonnerToast.error('Não foi possível apagar a imagem completamente.');
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
