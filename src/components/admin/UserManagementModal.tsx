import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, UserPlus } from 'lucide-react';
import { loadLocalUsers, saveLocalUsers, MASTER_USER } from '@/context/InternalAuth';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  created_at: string;
};

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManagementModal = ({ isOpen, onClose }: UserManagementModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const { toast } = useToast();

  // Carregar usuários ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = () => {
    const loadedUsers = loadLocalUsers();
    setUsers(loadedUsers);
  };

  const handleAddUser = () => {
    if (!newUsername || !newPassword) {
      toast({
        title: "Erro",
        description: "Nome de usuário e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe um usuário com este nome
    if (users.some(user => user.username === newUsername)) {
      toast({
        title: "Erro",
        description: "Este nome de usuário já está em uso.",
        variant: "destructive",
      });
      return;
    }

    // Criar novo usuário
    const newUser = {
      id: `user_${Date.now()}`,
      username: newUsername,
      password: newPassword,
      email: newEmail || `${newUsername}@admin.local`,
      created_at: new Date().toLocaleDateString('pt-BR'),
    };

    console.log('Criando novo usuário:', newUser);

    // Adicionar à lista e salvar
    const updatedUsers = [...users, newUser];
    console.log('Lista atualizada antes de salvar:', updatedUsers);
    
    const saved = saveLocalUsers(updatedUsers);
    console.log('Resultado do salvamento:', saved);
    
    // Verificar se o usuário foi realmente salvo
    const checkUsers = loadLocalUsers();
    console.log('Usuários após salvar:', checkUsers);
    console.log('Novo usuário encontrado?', checkUsers.some(u => u.username === newUsername));

    if (saved) {
      setUsers(checkUsers); // Usar a lista atualizada do localStorage
      setNewUsername('');
      setNewPassword('');
      setNewEmail('');
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso. Você já pode fazer login com ele.",
      });
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    // Não permitir excluir o usuário master
    if (username === 'master') {
      toast({
        title: "Operação não permitida",
        description: "O usuário master não pode ser excluído.",
        variant: "destructive",
      });
      return;
    }

    // Filtrar o usuário a ser excluído
    const updatedUsers = users.filter(user => user.id !== userId);
    const saved = saveLocalUsers(updatedUsers);

    if (saved) {
      setUsers(updatedUsers);
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-poker-gray-medium border-poker-gold/30 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-poker-gold text-xl">Gerenciamento de Usuários</DialogTitle>
          <DialogDescription className="text-gray-300">
            Gerencie os usuários que podem acessar o painel administrativo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulário para adicionar usuário */}
          <div className="bg-poker-gray-dark/50 p-4 rounded-md border border-poker-gold/20">
            <h3 className="text-poker-gold text-lg mb-4">Adicionar Novo Usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-poker-gray-dark border-poker-gold/20 text-white"
                  placeholder="Ex: admin"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-poker-gray-dark border-poker-gold/20 text-white"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-poker-gray-dark border-poker-gold/20 text-white"
                  placeholder="usuario@exemplo.com"
                />
              </div>
            </div>
            <Button
              onClick={handleAddUser}
              className="mt-4 bg-poker-gold hover:bg-poker-gold-light text-poker-black flex items-center gap-2"
            >
              <UserPlus size={16} />
              Adicionar Usuário
            </Button>
          </div>

          {/* Lista de usuários */}
          <div>
            <h3 className="text-poker-gold text-lg mb-4">Usuários Cadastrados</h3>
            <div className="border border-poker-gold/20 rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-poker-gray-dark">
                  <TableRow className="border-b border-poker-gold/20">
                    <TableHead className="text-poker-gold">Usuário</TableHead>
                    <TableHead className="text-poker-gold">Email</TableHead>
                    <TableHead className="text-poker-gold">Data de Criação</TableHead>
                    <TableHead className="text-poker-gold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="border-b border-poker-gold/10 hover:bg-poker-gray-dark/50"
                    >
                      <TableCell className="font-medium text-white">
                        {user.username}
                        {user.username === 'master' && (
                          <span className="ml-2 text-xs bg-poker-gold/20 text-poker-gold px-2 py-0.5 rounded-full">
                            Master
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell className="text-gray-300">{user.created_at}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={user.username === 'master'}
                          className={user.username === 'master' 
                            ? "text-gray-500 cursor-not-allowed" 
                            : "text-red-500 hover:text-red-400 hover:bg-red-500/10"}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-400">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose} 
            variant="outline"
            className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;
