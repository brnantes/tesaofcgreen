
import { Card, CardContent } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'João Pedro',
      text: 'O Green Table é mais que um clube de pôquer. É um lugar onde me sinto em família, com ambiente acolhedor e comida incrível.',
      rating: 5
    },
    {
      id: 2,
      name: 'Fernanda Lima',
      text: 'Trouxe minha família aqui e todos se divertiram. O ambiente é respeitoso e as atividades são para todas as idades.',
      rating: 5
    },
    {
      id: 3,
      name: 'Ricardo Alves',
      text: 'A gastronomia é excepcional! Enquanto jogo, posso desfrutar de pratos que são verdadeiras obras de arte culinárias.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-green-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            O que dizem nossos membros
          </h2>
          <p className="text-xl text-gray-300">
            Experiências reais de nossa família Green Table
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="bg-green-gray-medium border-green-primary/20 card-hover animate-slide-in-left"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-green-primary text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="text-green-primary font-semibold">
                  — {testimonial.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
