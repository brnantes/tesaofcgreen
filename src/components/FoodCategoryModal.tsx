import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MenuItem } from '@/types/database';
import { ArrowLeft } from 'lucide-react';

interface FoodCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  items: MenuItem[];
}

export const FoodCategoryModal = ({
  open,
  onOpenChange,
  title,
  description,
  items
}: FoodCategoryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-poker-gray-dark border-poker-gold/50 text-white max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onOpenChange(false)} 
              className="p-2 rounded-full hover:bg-poker-black/50"
            >
              <ArrowLeft className="w-5 h-5 text-poker-gold" />
            </button>
            <DialogTitle className="text-2xl text-poker-gold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {items.length === 0 ? (
            <div className="text-center col-span-full py-8">
              <p className="text-gray-400">Nenhum item disponível nesta categoria.</p>
            </div>
          ) : (
            items.map((item) => (
              <Card 
                key={item.id} 
                className="bg-poker-gray-medium border-poker-gold/20 card-hover overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
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
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                    <div className="text-poker-gold font-bold text-lg">{item.price}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
