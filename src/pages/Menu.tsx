import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Utensils, Wine, ChevronDown } from 'lucide-react';

const Menu = () => {
  const { menuItems, loading } = useMenuItems();
  
  // Estado para controlar a categoria de filtro atual
  // null = todas, 'food' = comidas, 'drink' = bebidas
  const [activeFilter, setActiveFilter] = useState(null);
  
  // Separar e ordenar itens por categoria - ABORDAGEM SIMPLIFICADA
  const { foodItems, drinkItems, featuredItems, displayedItems } = useMemo(() => {
    // Arrays para classificar os itens
    let foods: typeof menuItems = [];
    let drinks: typeof menuItems = [];
    let featured: typeof menuItems = [];
    
    // Primeiro separar os itens em destaque
    menuItems.forEach(item => {
      if (item.featured) {
        featured.push(item);
      }
      
      const category = (item.category || '').toLowerCase();
      
      // Verificar se é bebida
      if (
        category.includes('bebida') || 
        category.includes('drink') ||
        category.includes('cerveja') ||
        category.includes('whisky') ||
        category.includes('vinho') ||
        category.includes('suco') ||
        category.includes('água') ||
        category.includes('agua') ||
        category.includes('refrigerante')
      ) {
        drinks.push(item);
      }
      // Tudo que não for bebida será considerado comida
      else {
        foods.push(item);
      }
    });
    
    // Determinar quais itens exibir com base no filtro ativo
    let items;
    switch (activeFilter) {
      case 'food':
        items = [...foods];
        break;
      case 'drink':
        items = [...drinks];
        break;
      default:
        // Ordenar: comidas primeiro, bebidas depois
        items = [...foods, ...drinks];
    }
    
    return { 
      foodItems: foods, 
      drinkItems: drinks,
      featuredItems: featured,
      displayedItems: items
    };
  }, [menuItems, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-poker-black text-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
                Green Table
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Carregando cardápio...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-black text-white">
      <Header />
      
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-br from-poker-black via-poker-gray-dark to-poker-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
                Green Table
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Sabores que combinam com grandes jogadas. Desfrute de nossa seleção gastronômica enquanto joga.
              </p>
            </div>
            
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Cardápio em atualização...</p>
              </div>
            ) : (
              <>
                {/* Seção de categorias para filtros */}
                <div className="flex gap-4 justify-center mb-12">
                  <Button 
                    onClick={() => setActiveFilter(null)}
                    variant={activeFilter === null ? "default" : "outline"}
                    className={activeFilter === null 
                      ? "bg-poker-gold text-poker-black hover:bg-poker-gold-light" 
                      : "border-poker-gold text-poker-gold hover:bg-poker-gold hover:text-poker-black"}
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Todos os Itens
                  </Button>
                  <Button 
                    onClick={() => setActiveFilter('food')}
                    variant={activeFilter === 'food' ? "default" : "outline"}
                    className={activeFilter === 'food' 
                      ? "bg-poker-gold text-poker-black hover:bg-poker-gold-light" 
                      : "border-poker-gold text-poker-gold hover:bg-poker-gold hover:text-poker-black"}
                  >
                    <Utensils className="mr-2 h-4 w-4" />
                    Comidas
                  </Button>
                  <Button 
                    onClick={() => setActiveFilter('drink')}
                    variant={activeFilter === 'drink' ? "default" : "outline"}
                    className={activeFilter === 'drink' 
                      ? "bg-poker-gold text-poker-black hover:bg-poker-gold-light" 
                      : "border-poker-gold text-poker-gold hover:bg-poker-gold hover:text-poker-black"}
                  >
                    <Wine className="mr-2 h-4 w-4" />
                    Bebidas
                  </Button>
                </div>
                
                {/* Seção de itens em destaque */}
                {activeFilter === null && featuredItems.length > 0 && (
                  <div className="mb-16">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-poker-gold mb-4 text-center">Destaques</h2>
                      <div className="w-32 h-1 bg-poker-gold/70 mx-auto mb-8"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {featuredItems.map((item, index) => (
                        <Card 
                          key={`featured-${item.id}`} 
                          className="bg-poker-gray-medium border-poker-gold border-2 card-hover animate-pulse-slow overflow-hidden"
                        >
                          <div className="aspect-square overflow-hidden relative">
                            <div className="absolute top-0 right-0 bg-poker-gold text-poker-black font-bold px-3 py-1 z-10">
                              Destaque
                            </div>
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg';
                              }}
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                              <p className="text-gray-400 text-sm">{item.description}</p>
                              <div className="text-poker-gold font-bold text-lg">{item.price}</div>
                              <div className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Categorias em texto quando estiver mostrando tudo */}
                {activeFilter === null && foodItems.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-poker-gold mb-4 text-center">Comidas</h2>
                    <div className="w-24 h-1 bg-poker-gold/50 mx-auto mb-8"></div>
                  </div>
                )}
                
                {/* Mensagem se não houver itens para exibir */}
                {displayedItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-400">Nenhum item encontrado nesta categoria.</p>
                    <p className="mt-2 text-gray-500">Verifique se há itens cadastrados no banco de dados.</p>
                  </div>
                )}
                
                {/* Listagem dos itens filtrados do menu */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedItems.map((item, index) => (
                    <Card 
                      key={item.id} 
                      className="bg-poker-gray-medium border-poker-gold/20 card-hover animate-slide-in-left overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                          <div className="text-poker-gold font-bold text-lg">{item.price}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Categorias em texto quando estiver mostrando tudo - Bebidas */}
                {activeFilter === null && drinkItems.length > 0 && foodItems.length > 0 && (
                  <div className="mt-16 mb-8">
                    <h2 className="text-2xl font-bold text-poker-gold mb-4 text-center">Bebidas</h2>
                    <div className="w-24 h-1 bg-poker-gold/50 mx-auto mb-8"></div>
                  </div>
                )}
              </>
            )}
            
            {/* Imagem removida conforme solicitado */}
          </div>
        </section>
      </main>
      
    </div>
  );
};

export default Menu;
