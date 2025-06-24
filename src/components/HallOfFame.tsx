
import { Card, CardContent } from '@/components/ui/card';
import { useFeaturedMenuItems } from '@/hooks/useFeaturedMenuItems';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const HallOfFame = () => {
  const { featuredItems, loading, refetch } = useFeaturedMenuItems();
  
  // Não usaremos mais dados fictícios de fallback
  // Mostraremos apenas os itens reais marcados como destaque no banco de dados
  const displayItems = featuredItems;
  
  // Log para depuração
  useEffect(() => {
    console.log('HallOfFame - Itens em destaque:', featuredItems);
  }, [featuredItems]);
  
  // Forçar uma nova busca quando o componente montar
  useEffect(() => {
    refetch();
  }, []);

  return (
    <section id="hall-of-fame" className="py-20 bg-green-gray-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Mais Pedidos
          </h2>
          <p className="text-xl text-gray-300">
            Experimente os pratos favoritos dos nossos clientes
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-primary animate-spin" />
            <span className="ml-2 text-green-primary">Carregando pratos em destaque...</span>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">Nenhum prato em destaque disponível no momento.</p>
            <p className="text-gray-400 mt-2">Visite a seção de cardápio para ver todos os nossos pratos.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="bg-green-gray-medium border-green-primary/20 card-hover animate-slide-in-left overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      console.log('Erro ao carregar imagem:', item.image_url);
                      e.currentTarget.src = 'https://placehold.co/600x400/333/CCC?text=Imagem+não+disponível';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-primary text-green-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <span className="mr-1">👍</span> Mais Pedido
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-green-primary font-semibold text-xl">
                      {item.name}
                    </h3>
                    <span className="text-green-primary font-bold text-lg">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <Button 
                    className="w-full bg-green-primary hover:bg-green-primary/80 text-green-black font-medium"
                    variant="default"
                  >
                    Pedir Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HallOfFame;
