import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, RefreshCw, UserX, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listAdminUsers, createAdminUser, deleteAdminUser, AdminUser } from '@/services/adminAuthService';




const UsersSection = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const adminUsers = await listAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar usuários', description: 'Não foi possível carregar a lista de usuários.' });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando criação de usuário:', { newUsername, newEmail });
    
    if (!newUsername || !newPassword) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha o nome de usuário e senha para criar um usuário.' });
      return;
    }

    try {
      console.log('Dados do usuário a ser criado:', { username: newUsername, email: newEmail || 'não informado' });
      
      // Criar usuário via Supabase
      const newUser = await createAdminUser({
        username: newUsername,
        password: newPassword,
        email: newEmail || undefined // Enviar undefined para que o fallback no serviço seja usado
      });
      
      if (newUser) {
        console.log('Usuário criado com sucesso:', { ...newUser, password: '***' });
        
        // Recarregar lista de usuários
        await fetchUsers();
        
        // Limpar campos do formulário
        setNewUsername('');
        setNewPassword('');
        setNewEmail('');
        
        toast({ title: 'Usuário criado', description: `O usuário ${newUsername} foi criado com sucesso.` });
      } else {
        toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: 'Ocorreu um erro ao salvar o novo usuário.' });
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      const errorMsg = error?.message || 'Ocorreu um erro inesperado.';
      console.error('Detalhes do erro:', errorMsg);
      toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: `Erro: ${errorMsg}` });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) return;

    try {
      console.log(`Excluindo usuário: ${username} (${userId})`);
      
      // Excluir usuário via Supabase
      const success = await deleteAdminUser(userId);
      
      if (success) {
        // Recarregar lista de usuários
        await fetchUsers();
        
        // Remover da seleção se estiver selecionado
        if (selectedUsers.includes(userId)) {
          setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
        
        toast({ title: 'Usuário excluído', description: `O usuário ${username} foi excluído com sucesso.` });
      } else {
        toast({ variant: 'destructive', title: 'Erro ao excluir usuário', description: 'Ocorreu um erro ao excluir o usuário.' });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({ variant: 'destructive', title: 'Erro ao excluir usuário', description: 'Ocorreu um erro inesperado.' });
    }
  };

  const deleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      toast({ variant: 'destructive', title: 'Nenhum usuário selecionado', description: 'Selecione pelo menos um usuário para excluir.' });
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s) selecionado(s)?`)) return;

    try {
      setIsDeleting(true);
      console.log(`Excluindo ${selectedUsers.length} usuários:`, selectedUsers);
      
      // Excluir cada usuário selecionado
      const deletePromises = selectedUsers.map(userId => deleteAdminUser(userId));
      await Promise.all(deletePromises);
      
      // Recarregar lista de usuários
      await fetchUsers();
      
      // Limpar seleção
      setSelectedUsers([]);
      console.log('Seleção limpa');
      
      toast({ title: 'Usuários excluídos', description: `${selectedUsers.length} usuário(s) foram excluídos com sucesso.` });
    } catch (error) {
      console.error('Erro ao excluir usuários:', error);
      toast({ variant: 'destructive', title: 'Erro ao excluir usuários', description: 'Ocorreu um erro inesperado.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    console.log(`Seleção de usuário: ${userId}, checked: ${checked}`);
    console.log('Estado atual de selectedUsers:', selectedUsers);
    
    if (checked) {
      // Adicionar à seleção se não estiver já incluído
      setSelectedUsers(prev => {
        if (prev.includes(userId)) {
          console.log(`Usuário ${userId} já está selecionado, não adicionando novamente`);
          return prev;
        }
        const updated = [...prev, userId];
        console.log('Usuários selecionados após adicionar:', updated);
        return updated;
      });
    } else {
      // Remover da seleção
      setSelectedUsers(prev => {
        const updated = prev.filter(id => id !== userId);
        console.log('Usuários selecionados após remover:', updated);
        return updated;
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Limpar seleção quando a lista de usuários mudar
  useEffect(() => {
    setSelectedUsers([]);
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Gerenciar Usuários</h2>
        <div className="flex gap-2">
          <Button 
            onClick={deleteSelectedUsers} 
            variant="destructive" 
            size="sm" 
            className="flex gap-2 items-center"
            disabled={selectedUsers.length === 0 || isDeleting}
          >
            {isDeleting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</>
            ) : (
              <><UserX className="w-4 h-4" /> Excluir Selecionados ({selectedUsers.length})</>
            )}
          </Button>
          <Button onClick={fetchUsers} variant="outline" size="sm" className="flex gap-2 items-center border-poker-gold/20 hover:border-poker-gold/50">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </Button>
        </div>
      </div>
      <Card className="p-4 bg-poker-gray-dark/50 border border-poker-gold/20">
        <h3 className="text-lg font-semibold text-poker-gold mb-4">Adicionar Novo Usuário</h3>
        <form onSubmit={createUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input id="username" placeholder="Ex: vitor" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="bg-poker-black/50 border-poker-gold/20 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="******" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="bg-poker-black/50 border-poker-gold/20 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="usuario@exemplo.com (opcional)" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-poker-black/50 border-poker-gold/20 text-white" />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4 bg-poker-gold hover:bg-poker-gold/80 text-black flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> Criar Usuário
          </Button>
        </form>
      </Card>
      <Card className="p-4 bg-poker-gray-dark/50 border border-poker-gold/20">
        <h3 className="text-lg font-semibold text-poker-gold mb-4">Usuários Cadastrados</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-poker-gold animate-spin" /></div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhum usuário encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-poker-gold/30">
                  <th className="text-center py-2 px-2 text-poker-gold">Sel.</th>
                  <th className="text-left py-2 px-4 text-poker-gold">Usuário</th>
                  <th className="text-left py-2 px-4 text-poker-gold">Email</th>
                  <th className="text-left py-2 px-4 text-poker-gold">Criado em</th>
                  <th className="text-right py-2 px-4 text-poker-gold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-poker-gold/10 hover:bg-poker-black/30">
                    <td className="py-2 px-2 text-center">
                      {user.username !== 'master' && user.username !== currentUser?.username && (
                        <div onClick={() => console.log(`Clicou no checkbox do usuário ${user.id}`)}>
                          <Checkbox 
                            id={`checkbox-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              console.log(`Checkbox alterado para usuário ${user.id} (${user.username}): ${checked}`);
                              handleSelectUser(user.id, checked === true);
                            }}
                            className="border-poker-gold/50 cursor-pointer"
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 font-medium">
                      {user.username}
                      {user.username === currentUser?.username && (<span className="text-xs text-poker-gold ml-2">(Você)</span>)}
                    </td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.created_at}</td>
                    <td className="py-2 px-4 text-right">
                      {user.username !== 'master' && user.username !== currentUser?.username && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.username)} className="hover:bg-red-900/20 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsersSection;
