
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSiteImages } from '@/hooks/useSiteImages';

const Hero = () => {
  const { images, loading, getImageUrl } = useSiteImages();
  // Obter a imagem do hero_background ou usar uma imagem padrão como fallback
  const imageUrl = getImageUrl('hero_background', '/lovable-uploads/a51d0bdb-8cb1-4dcb-80a0-90df1afb8b1b.png');

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden">
      {/* Imagem de fundo com overlay */}
      <img 
        src={imageUrl} 
        alt="Mesa de Poker Green Table" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-poker-black/80 via-poker-gray-dark/80 to-poker-black/80"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
          Bem-vindo ao Green Table
        </h1>
        <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl">
          O melhor clube de poker e bar da cidade. Experimente a emoção do jogo em um ambiente sofisticado e descontraído.
        </p>
        <a
          href="#torneios"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg transition"
        >
          Ver torneios
        </a>
      </div>
    </section>
  );
};

export default Hero;
