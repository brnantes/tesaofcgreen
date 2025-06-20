
import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItemsList } from '@/components/admin/MenuItemsList';
import { BannersSection } from '@/components/admin/BannersSection';
import { TournamentsSection } from '@/components/admin/TournamentsSection';
import { ChampionsSection } from '@/components/admin/ChampionsSection';
import { ImagesSection } from '@/components/admin/ImagesSection';
import UsersSection from '@/components/admin/UsersSection';
import { useAuth } from '@/context/AuthContext';
import { 
  LogOut, 
  Calendar, 
  Trophy, 
  Users, 
  Menu as MenuIcon, 
  Settings,
  TrendingUp,
  Clock,
  Star,
  ChefHat,
  Image,
  MessageSquare,
  Shield
} from 'lucide-react';

const Admin = () => {
  const { isLoggedIn, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'menu', label: 'Cardápio', icon: ChefHat },
    { id: 'tournaments', label: 'Torneios', icon: Trophy },
    { id: 'champions', label: 'Campeões', icon: Star },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'contacts', label: 'Contatos', icon: MessageSquare },
    { id: 'users', label: 'Usuários', icon: Shield },
    { id: 'images', label: 'Galeria', icon: Image },
  ];

  const getTodayTournament = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const tournaments = {
      0: { name: 'Torneio Domingo', time: '15:00', prize: 'R$ 500' },
      1: { name: 'Segunda Fair Play', time: '20:00', prize: 'R$ 200' },
      2: { name: 'Terça Turbo', time: '19:30', prize: 'R$ 300' },
      3: { name: 'Quarta Champions', time: '20:00', prize: 'R$ 400' },
      4: { name: 'Quinta Power', time: '19:00', prize: 'R$ 350' },
      5: { name: 'Sexta VIP', time: '21:00', prize: 'R$ 600' },
      6: { name: 'Sábado Master', time: '16:00', prize: 'R$ 800' },
    };
    
    return tournaments[dayOfWeek] || { name: 'Sem torneio hoje', time: '--', prize: '--' };
  };

  const todayTournament = getTodayTournament();

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Torneio de Hoje - Destaque */}
            <Card className="bg-gradient-to-r from-poker-gold/20 to-poker-gold/10 border-poker-gold/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-poker-gold" />
                    <div>
                      <CardTitle className="text-2xl text-poker-gold">Torneio de Hoje</CardTitle>
                      <p className="text-gray-300">Evento principal do dia</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-poker-gold text-poker-black font-semibold">
                    HOJE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-poker-black/50 rounded-lg">
                    <Calendar className="w-6 h-6 text-poker-gold mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">{todayTournament.name}</h3>
                    <p className="text-gray-400">Nome do Evento</p>
                  </div>
                  <div className="text-center p-4 bg-poker-black/50 rounded-lg">
                    <Clock className="w-6 h-6 text-poker-gold mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">{todayTournament.time}</h3>
                    <p className="text-gray-400">Horário de Início</p>
                  </div>
                  <div className="text-center p-4 bg-poker-black/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-poker-gold mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">{todayTournament.prize}</h3>
                    <p className="text-gray-400">Premiação</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-poker-gray-medium/70 border-poker-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Produtos</p>
                      <h3 className="text-2xl font-bold text-white">28</h3>
                    </div>
                    <ChefHat className="w-8 h-8 text-poker-gold" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-poker-gray-medium/70 border-poker-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Torneios Ativos</p>
                      <h3 className="text-2xl font-bold text-white">7</h3>
                    </div>
                    <Trophy className="w-8 h-8 text-poker-gold" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-poker-gray-medium/70 border-poker-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Campeões</p>
                      <h3 className="text-2xl font-bold text-white">15</h3>
                    </div>
                    <Star className="w-8 h-8 text-poker-gold" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-poker-gray-medium/70 border-poker-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Contatos</p>
                      <h3 className="text-2xl font-bold text-white">42</h3>
                    </div>
                    <MessageSquare className="w-8 h-8 text-poker-gold" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card className="bg-poker-gray-medium/70 border-poker-gold/20">
              <CardHeader>
                <CardTitle className="text-poker-gold">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveSection('menu')}
                    className="bg-poker-gold hover:bg-poker-gold-light text-poker-black font-semibold p-6 h-auto flex flex-col gap-2"
                  >
                    <ChefHat className="w-6 h-6" />
                    <span>Adicionar Produto</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('tournaments')}
                    className="bg-poker-gold hover:bg-poker-gold-light text-poker-black font-semibold p-6 h-auto flex flex-col gap-2"
                  >
                    <Trophy className="w-6 h-6" />
                    <span>Novo Torneio</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('champions')}
                    className="bg-poker-gold hover:bg-poker-gold-light text-poker-black font-semibold p-6 h-auto flex flex-col gap-2"
                  >
                    <Star className="w-6 h-6" />
                    <span>Adicionar Campeão</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'menu':
        return <MenuItemsList />;
      case 'tournaments':
        return <TournamentsSection />;
      case 'champions':
        return <ChampionsSection />;
      case 'banners':
        return <BannersSection />;
      case 'images':
        return <ImagesSection />;
      case 'users':
        return <UsersSection />;
      case 'contacts':
        return (
          <Card className="bg-poker-gray-medium border-poker-gold/20">
            <CardHeader>
              <CardTitle className="text-poker-gold">Contatos Recebidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-poker-black p-4 rounded border border-poker-gold/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-poker-gold font-semibold">João Silva</h4>
                    <span className="text-gray-400 text-sm">06/01/2025</span>
                  </div>
                  <p className="text-gray-300 text-sm">joao@email.com | (11) 99999-9999</p>
                  <p className="text-gray-400 text-sm mt-2">Interessado em receber agenda de torneios</p>
                </div>
                <div className="bg-poker-black p-4 rounded border border-poker-gold/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-poker-gold font-semibold">Maria Santos</h4>
                    <span className="text-gray-400 text-sm">05/01/2025</span>
                  </div>
                  <p className="text-gray-300 text-sm">maria@email.com | (11) 88888-8888</p>
                  <p className="text-gray-400 text-sm mt-2">Interessada em receber agenda de torneios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <div>Seção não encontrada</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-poker-black text-white">
      <Header />
      
      <div className="flex pt-20">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-poker-gray-dark/90 backdrop-blur-sm border-r border-poker-gold/20 fixed h-full left-0 top-20 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold gradient-text mb-1">Painel Admin</h2>
              <p className="text-gray-400 text-sm">Green Table</p>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      activeSection === item.id
                        ? 'bg-poker-gold text-poker-black font-semibold'
                        : 'text-gray-300 hover:bg-poker-gold/10 hover:text-poker-gold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-poker-gold/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Logado como</p>
                  <p className="text-poker-gold font-semibold">Administrador</p>
                </div>
              </div>
              
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="w-full border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10 flex gap-2 items-center"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-400">
              {activeSection === 'dashboard' 
                ? 'Visão geral do sistema e estatísticas'
                : `Gerencie ${menuItems.find(item => item.id === activeSection)?.label.toLowerCase()}`
              }
            </p>
          </div>
          
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Admin;
