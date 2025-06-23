import { MapPin, Phone, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-green-black border-t border-green-primary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/6b476369-5762-4229-8768-0788aa39dbcc.png" 
                alt="Green Table Icon" 
                className="w-8 h-8 mr-3"
              />
              <h3 className="text-2xl font-bold gradient-text">
                Green Table
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Mais que um clube, uma família unida pela paixão pelo pôquer e boa convivência.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-primary hover:text-green-light transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-green-primary hover:text-green-light transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-green-primary hover:text-green-light transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-green-primary font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#tournaments" className="text-gray-400 hover:text-green-primary transition-colors">Torneios</a></li>
              <li><a href="#hall-of-fame" className="text-gray-400 hover:text-green-primary transition-colors">Hall da Fama</a></li>
              <li><a href="/menu" className="text-gray-400 hover:text-green-primary transition-colors">Cardápio</a></li>
              <li><Link to="/login" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">Painel Admin</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-green-primary font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <MapPin size={16} className="mr-2 text-green-primary" />
                <span>Rua do Pôquer, 123 - Centro</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone size={16} className="mr-2 text-green-primary" />
                <span>(11) 9999-8888</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-green-primary font-semibold mb-4">WhatsApp</h4>
            <p className="text-gray-400 mb-4">
              Fale conosco diretamente pelo WhatsApp
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Chamar no WhatsApp
            </Button>
          </div>
        </div>
        
        <div className="border-t border-green-primary/20 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Green Table. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
