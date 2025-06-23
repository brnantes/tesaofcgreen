
import { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedTabs } from './ui/animated-tabs';
import { useSiteImages } from '@/hooks/useSiteImages';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getImageUrl } = useSiteImages();

  const navItems = [
    { name: 'Início', href: '/', active: true },
    { name: 'Torneios', href: '#tournaments', active: false },
    { name: 'Hall da Fama', href: '#hall-of-fame', active: false },
    { name: 'Cardápio', href: '/menu', active: false },
    { name: 'Contato', href: '#contact', active: false },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-green-black/90 backdrop-blur-md border-b border-green-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img 
              src={getImageUrl('menu_background', '/lovable-uploads/196cfcf0-bff1-44e2-befb-600b276767fd.png')} 
              alt="Green Table Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <div className="hidden md:block">
            <AnimatedTabs
              tabs={navItems.map(item => ({
                label: item.name,
                href: item.href
              }))}
              className="bg-transparent border-none"
            />
          </div>

          {/* Botões de login e cadastro removidos conforme solicitado */}

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-green-gray-dark border-t border-green-primary/20">
            <nav className="flex flex-col space-y-4 p-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-green-primary transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {/* Botões de login e cadastro removidos conforme solicitado */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
