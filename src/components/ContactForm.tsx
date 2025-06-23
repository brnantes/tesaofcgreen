
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    toast({
      title: "Cadastro realizado!",
      description: "Você receberá nossa agenda de torneios em breve.",
    });
    
    setFormData({ name: '', whatsapp: '', email: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-poker-gray-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-poker-gray-medium border-poker-gold/20 animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                Receba a agenda de torneios
              </CardTitle>
              <p className="text-gray-300 text-lg">
                Seja o primeiro a saber sobre nossos próximos torneios e eventos especiais
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-poker-black border-poker-gold/30 text-white placeholder-gray-400 focus:border-poker-gold"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    name="whatsapp"
                    placeholder="WhatsApp (com DDD)"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="bg-poker-black border-poker-gold/30 text-white placeholder-gray-400 focus:border-poker-gold"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-poker-black border-poker-gold/30 text-white placeholder-gray-400 focus:border-poker-gold"
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-poker-gold text-poker-black hover:bg-poker-gold-light text-lg py-3 font-semibold"
                >
                  Quero ser avisado!
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
