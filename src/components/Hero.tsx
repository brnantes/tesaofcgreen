
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with poker table image */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTExMWFhUXGBcYGBcYGBgYGBgYFx0YGBgYGBgYHSggGB0lHRgYITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAABQQGAQIDBwj/xABIEAABAwIDBQUFBQUFBwMFAAABAAIRAyEEMVEFEnGBkQYTIlFhBzJScYGhI0Kx0fAzQ1OSwRUkYnKCstLh8RZTY5Ois8LiF//EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EACgRAQACAgEDAwMFAQEAAAAAAAABAhEDIRIxQQQTIlEUMmFxI0KBof/aAAwDAQACEQMRAD8A9xQREBERAREQEREBERAREQEREBERAREQEREBERAREQEREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREH/2Q==")',
            opacity: 0.4
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-black/80 via-green-black/70 to-green-black/80"></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 space-y-8 animate-fade-in">
        <div className="space-y-6">
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Onde estratégia, gastronomia e família se encontram para criar momentos únicos
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-8 my-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-110">
            <div className="text-3xl md:text-4xl font-bold text-green-primary group-hover:text-green-light transition-colors">
              150+
            </div>
            <div className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
              Membros Ativos
            </div>
          </div>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-110">
            <div className="text-3xl md:text-4xl font-bold text-green-primary group-hover:text-green-light transition-colors">
              50+
            </div>
            <div className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
              Torneios/Mês
            </div>
          </div>
          <div className="text-center group cursor-pointer transition-all duration-300 hover:scale-110">
            <div className="text-3xl md:text-4xl font-bold text-green-primary group-hover:text-green-light transition-colors">
              5★
            </div>
            <div className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
              Avaliação
            </div>
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Button 
            className="bg-green-primary text-green-black hover:bg-green-light text-xl px-12 py-6 h-auto font-bold transform transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-green-primary/40 group"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">
              Receber Agenda de Torneios
            </span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center mt-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-2 border-green-primary text-green-primary hover:bg-green-primary hover:text-green-black text-xl px-10 py-6 h-auto font-bold transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-green-primary/30 rounded-xl"
              >
                Clube Online
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-green-gray-dark border-green-primary/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-primary mb-4">
                  Clube Online
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Participe dos nossos torneios online com a mesma qualidade e organização do clube presencial. 
                  Jogue de onde estiver com outros membros da comunidade Green Table.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Horários Flexíveis</h4>
                    <p className="text-sm text-gray-400">Torneios durante todo o dia para se adaptar à sua agenda</p>
                  </div>
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Prêmios Reais</h4>
                    <p className="text-sm text-gray-400">Premiações em dinheiro e brindes exclusivos</p>
                  </div>
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Comunidade Ativa</h4>
                    <p className="text-sm text-gray-400">Chat integrado e interação constante entre jogadores</p>
                  </div>
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Ranking Nacional</h4>
                    <p className="text-sm text-gray-400">Sistema de pontuação e classificação mensal</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-2 border-green-primary text-green-primary hover:bg-green-primary hover:text-green-black text-xl px-10 py-6 h-auto font-bold transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-green-primary/30 rounded-xl"
              >
                Clube Presencial
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-green-gray-dark border-green-primary/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-primary mb-4">
                  Clube Presencial
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Venha viver a experiência completa do Green Table em nosso espaço físico. 
                  Ambiente familiar, gastronomia premium e torneios profissionais em um local aconchegante.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Ambiente Familiar</h4>
                    <p className="text-sm text-gray-400">Espaço acolhedor onde toda família se sente bem-vinda</p>
                  </div>
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Gastronomia Premium</h4>
                    <p className="text-sm text-gray-400">Cardápio especial preparado por chefs experientes</p>
                  </div>
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Mesas Profissionais</h4>
                    <p className="text-sm text-gray-400">Equipamentos de última geração para a melhor experiência</p>
                  </div>
                  <div className="bg-green-gray-medium/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-light mb-2">Eventos Especiais</h4>
                    <p className="text-sm text-gray-400">Torneios temáticos e confraternizações exclusivas</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center space-y-2 text-green-primary/60 hover:text-green-primary transition-colors cursor-pointer group">
          <span className="text-sm group-hover:scale-110 transition-transform">Descubra mais</span>
          <ArrowDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
