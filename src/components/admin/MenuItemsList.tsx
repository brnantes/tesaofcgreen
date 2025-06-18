import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Pencil, Trash2, Plus, RefreshCw, ChefHat, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { MenuItemForm } from './MenuItemForm';
import { MenuItem } from '@/types/database';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export const MenuItemsList = () => {
  const { menuItems, loading, deleteMenuItem, refetch } = useMenuItems();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('MenuItemsList renderizando com:', { menuItems, loading });

  const handleEdit = (item: MenuItem) => {
    console.log('Editando item:', item);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await deleteMenuItem(id);
      toast({
        title: "Item excluído",
        description: "O item foi removido do cardápio com sucesso!",
      });
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    console.log('Fechando formulário');
    setShowForm(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    console.log('Adicionando novo item');
    setEditingItem(null);
    setShowForm(true);
  };

  const handleRefresh = () => {
    console.log('Atualizando lista de itens');
    refetch();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Lanches': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Bebidas': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Pratos Principais': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Sobremesas': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Aperitivos': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-poker-gold mb-4">Carregando cardápio...</div>
        <div className="text-sm text-gray-400">Buscando itens do menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-poker-gray-medium border-poker-gold/20 hover:border-poker-gold/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-poker-gold flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Cardápio Digital ({menuItems.length} itens)
            </CardTitle>
            <div className="mt-2 text-sm text-gray-400">
              Gerencie os itens do seu cardápio com facilidade
            </div>
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10 hover:border-poker-gold hover:shadow-lg hover:shadow-poker-gold/20 transition-all duration-300 group"
              >
                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Atualizar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddNew}
                className="bg-poker-gold text-poker-black hover:bg-poker-gold-light hover:shadow-lg hover:shadow-poker-gold/40 font-semibold transition-all duration-300 group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Adicionar Item
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <ChefHat className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">Cardápio vazio</h3>
              <p className="text-gray-400 mb-6">Comece adicionando o primeiro item ao seu cardápio</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleAddNew}
                  className="bg-poker-gold text-poker-black hover:bg-poker-gold-light font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-poker-gold/20 hover:bg-poker-gold/5">
                    <TableHead className="text-poker-gold font-semibold">Imagem</TableHead>
                    <TableHead className="text-poker-gold font-semibold">Nome</TableHead>
                    <TableHead className="text-poker-gold font-semibold">Descrição</TableHead>
                    <TableHead className="text-poker-gold font-semibold">Categoria</TableHead>
                    <TableHead className="text-poker-gold font-semibold">Preço</TableHead>
                    <TableHead className="text-poker-gold font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-poker-gold/10 hover:bg-poker-gold/5 transition-all duration-300"
                    >
                      <TableCell>
                        <div className="relative group">
                          <motion.img 
                            whileHover={{ scale: 1.1 }}
                            src={item.image_url} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-poker-gold/20 shadow-sm"
                            onError={(e) => {
                              console.log('Erro ao carregar imagem:', item.image_url);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-300 max-w-xs">
                        <div className="truncate" title={item.description}>
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${getCategoryColor(item.category)} border font-medium`}
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-poker-gold font-bold text-lg">{item.price}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/20 hover:border-poker-gold hover:shadow-md hover:shadow-poker-gold/30 transition-all duration-300 group"
                            >
                              <Pencil className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className={`transition-all duration-300 group ${
                                deleteConfirm === item.id
                                  ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                                  : 'border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-500 hover:shadow-md hover:shadow-red-500/30'
                              }`}
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                          </motion.div>
                        </div>
                        {deleteConfirm === item.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-medium flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Clique novamente para confirmar
                          </motion.div>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MenuItemForm
        item={editingItem}
        open={showForm}
        onClose={handleCloseForm}
      />
    </div>
  );
};
