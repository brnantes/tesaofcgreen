import { useState, useEffect } from 'react';
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
import { useSystemStats } from '@/hooks/useSystemStats';
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
  Shield,
} from 'lucide-react';

const Admin = () => {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const { stats, loading: statsLoading } = useSystemStats();
  
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



  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return statsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-poker-gold"></div>
              <p className="text-gray-400">Carregando dados do sistema...</p>
            </div>
          </div>
        ) : (
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
                    <h3 className="text-lg font-bold text-white">{stats.todayTournament?.name || 'Sem torneio hoje'}</h3>
                    <p className="text-gray-400">Nome do Evento</p>
                  </div>
                  <div className="text-center p-4 bg-poker-black/50 rounded-lg">
                    <Clock className="w-6 h-6 text-poker-gold mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">{stats.todayTournament?.time || '--'}</h3>
                    <p className="text-gray-400">Horário de Início</p>
                  </div>
                  <div className="text-center p-4 bg-poker-black/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-poker-gold mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">{stats.todayTournament?.prize || '--'}</h3>
                    <p className="text-gray-400">Premiação</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-poker-gray-medium/70 border-poker-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Produtos</p>
                      {statsLoading ? (
                        <h3 className="text-2xl font-bold text-white">Carregando...</h3>
                      ) : (
                        <h3 className="text-2xl font-bold text-white">{stats.menuItemsCount}</h3>
                      )}
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
                      {statsLoading ? (
                        <h3 className="text-2xl font-bold text-white">Carregando...</h3>
                      ) : (
                        <h3 className="text-2xl font-bold text-white">{stats.tournamentsCount}</h3>
                      )}
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
                      {statsLoading ? (
                        <h3 className="text-2xl font-bold text-white">Carregando...</h3>
                      ) : (
                        <h3 className="text-2xl font-bold text-white">{stats.championsCount}</h3>
                      )}
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
                      {statsLoading ? (
                        <h3 className="text-2xl font-bold text-white">Carregando...</h3>
                      ) : (
                        <h3 className="text-2xl font-bold text-white">{stats.contactsCount}</h3>
                      )}
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
              <CardTitle className="text-xl text-white">Contatos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="text-white">Carregando contatos...</div>
              ) : stats.recentContacts && stats.recentContacts.length > 0 ? (
                stats.recentContacts.map((contact) => (
                  <div key={contact.id} className="bg-poker-black p-4 rounded border border-poker-gold/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-poker-gold font-semibold">{contact.name}</h4>
                      <span className="text-gray-400 text-sm">
                        {new Date(contact.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {contact.email} | {contact.phone || 'Sem telefone'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{contact.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Nenhum contato recente encontrado.</div>
              )}
            </CardContent>
          </Card>
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
      default:
        return <div className="p-8 text-center text-gray-400">Seção não encontrada</div>;
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
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-gray-300">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">{currentUser?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
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
