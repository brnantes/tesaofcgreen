import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, UserPlus, RefreshCw, UserX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LOCAL_USERS_KEY, MASTER_USER, loadLocalUsers, saveLocalUsers } from '@/context/InternalAuth';




const UsersSection = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { currentUsername } = useAuth();

  const fetchUsers = () => {
    setLoading(true);
    setTimeout(() => {
      const loaded = loadLocalUsers();
      setUsers(loaded);
      setLoading(false);
    }, 300);
  };
  
  const resetToMasterOnly = () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os usuários? Apenas o usuário master será mantido.')) return;

    try {
      console.log('Resetando para apenas o usuário master');
      const saveSuccess = saveLocalUsers([MASTER_USER]);
      console.log('Resultado do salvamento:', saveSuccess);
      
      if (saveSuccess) {
        // Verificar se os usuários foram realmente resetados
        const savedUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        console.log('Usuários após resetar:', savedUsers);
        
        // Recarregar para garantir dados consistentes
        const reloadedUsers = loadLocalUsers();
        setUsers(reloadedUsers);
        console.log('Usuários recarregados:', reloadedUsers);
        
        // Limpar seleção
        setSelectedUsers([]);
        console.log('Seleção limpa');
        
        toast({ title: 'Usuários resetados', description: 'Todos os usuários foram removidos, exceto o usuário master.' });
      } else {
        toast({ variant: 'destructive', title: 'Erro ao resetar usuários', description: 'Ocorreu um erro ao salvar as alterações.' });
      }
    } catch (error) {
      console.error('Erro ao resetar usuários:', error);
      toast({ variant: 'destructive', title: 'Erro ao resetar usuários', description: 'Ocorreu um erro inesperado.' });
    }
  };

  const createUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando criação de usuário:', { newUsername, newEmail });
    
    if (!newUsername || !newPassword || !newEmail) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha todos os campos para criar um usuário.' });
      return;
    }

    try {
      // Carregar usuários atuais
      const currentUsers = loadLocalUsers();
      console.log('Usuários atuais:', currentUsers);
      
      // Verificar se o nome de usuário já existe
      const usernameExists = currentUsers.some((user: any) => 
        user.username.toLowerCase() === newUsername.toLowerCase()
      );
      
      if (usernameExists) {
        toast({ variant: 'destructive', title: 'Nome de usuário já existe', description: 'Escolha outro nome de usuário.' });
        console.log('Nome de usuário já existe:', newUsername);
        return;
      }
      
      // Criar novo usuário
      const newUser = {
        id: crypto.randomUUID(),
        username: newUsername,
        password: newPassword, // Em produção, isso deveria ser criptografado
        email: newEmail,
        createdAt: new Date().toISOString(),
      };
      console.log('Novo usuário criado:', { ...newUser, password: '***' });
      
      // Adicionar o novo usuário à lista
      const updatedUsers = [...currentUsers, newUser];
      console.log('Lista atualizada de usuários:', updatedUsers.map(u => ({ id: u.id, username: u.username })));
      
      // Salvar a lista atualizada
      const saveSuccess = saveLocalUsers(updatedUsers);
      console.log('Resultado do salvamento:', saveSuccess);
      
      if (saveSuccess) {
        // Verificar se o usuário foi realmente adicionado
        const savedUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        console.log('Usuários após salvar:', savedUsers.map((u: any) => ({ id: u.id, username: u.username })));
        
        // Recarregar para garantir dados consistentes
        const reloadedUsers = loadLocalUsers();
        setUsers(reloadedUsers);
        console.log('Usuários recarregados:', reloadedUsers.map(u => ({ id: u.id, username: u.username })));
        
        // Limpar o formulário
        setNewUsername('');
        setNewPassword('');
        setNewEmail('');
        console.log('Formulário limpo');
        
        toast({ title: 'Usuário criado', description: `O usuário ${newUsername} foi criado com sucesso.` });
        console.log(`✅ Usuário ${newUsername} criado com sucesso`);
      } else {
        toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: 'Ocorreu um erro ao salvar as alterações.' });
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: 'Ocorreu um erro inesperado.' });
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    console.log(`Iniciando exclusão do usuário ${username} (ID: ${userId})`);
    
    // Verificar se é o usuário master ou o usuário logado
    if (username === 'master') {
      toast({ variant: 'destructive', title: 'Operação não permitida', description: 'O usuário master não pode ser excluído.' });
      return;
    }
    
    if (username === currentUsername) {
      toast({ variant: 'destructive', title: 'Operação não permitida', description: 'Você não pode excluir seu próprio usuário.' });
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) return;

    try {
      console.log(`Excluindo usuário ${username} (ID: ${userId})`);
      
      // Carregar usuários atuais
      const currentUsers = loadLocalUsers();
      console.log('Usuários antes da exclusão:', currentUsers);
      console.log('IDs antes da exclusão:', currentUsers.map((u: any) => u.id));
      
      // Filtrar para remover o usuário
      const updated = currentUsers.filter((user: any) => {
        const shouldKeep = user.id !== userId;
        console.log(`Usuário ${user.id} (${user.username}) - Manter: ${shouldKeep}`);
        return shouldKeep;
      });
      
      console.log('Usuários após filtro:', updated);
      console.log('IDs após filtro:', updated.map((u: any) => u.id));
      
      // Salvar usuários atualizados
      const saveSuccess = saveLocalUsers(updated);
      console.log('Resultado do salvamento:', saveSuccess);
      
      if (saveSuccess) {
        // Verificar se o usuário foi realmente removido
        const savedUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        console.log('Usuários após salvar:', savedUsers);
        console.log('IDs após salvar:', savedUsers.map((u: any) => u.id));
        
        // Recarregar para garantir dados consistentes
        const reloadedUsers = loadLocalUsers();
        setUsers(reloadedUsers);
        console.log('Usuários recarregados:', reloadedUsers);
        
        toast({ title: 'Usuário removido', description: `O usuário ${username} foi removido com sucesso.` });
        console.log(`✅ Usuário ${username} removido com sucesso`);
      } else {
        toast({ variant: 'destructive', title: 'Erro ao remover usuário', description: 'Ocorreu um erro ao salvar as alterações.' });
      }
    } catch (error) {
      console.error(`❌ Erro ao excluir usuário ${username}:`, error);
      toast({ variant: 'destructive', title: 'Erro ao excluir usuário', description: 'Ocorreu um erro inesperado.' });
    }
  };

  const deleteSelectedUsers = () => {
    console.log('Iniciando deleteSelectedUsers, selecionados:', selectedUsers);
    
    if (selectedUsers.length === 0) {
      toast({ variant: 'destructive', title: 'Nenhum usuário selecionado', description: 'Selecione pelo menos um usuário para excluir.' });
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s) selecionado(s)?`)) return;
    
    setIsDeleting(true);
    try {
      // Guardar o número de usuários selecionados antes de limpar a seleção
      const numSelected = selectedUsers.length;
      const selectedIds = [...selectedUsers]; // Criar uma cópia do array
      console.log('IDs selecionados para exclusão:', selectedIds);
      
      const currentUsers = loadLocalUsers();
      console.log('Usuários antes da exclusão:', currentUsers);
      console.log('IDs dos usuários atuais:', currentUsers.map((u: any) => u.id));
      
      // Filtrar usuários, mantendo o master e removendo os selecionados
      const updated = currentUsers.filter((user: any) => {
        // Sempre manter o master
        if (user.username === 'master') {
          console.log('Mantendo usuário master');
          return true;
        }
        
        // Verificar se o ID está na lista de selecionados
        const shouldRemove = selectedIds.includes(user.id);
        console.log(`Usuário ${user.id} (${user.username}) - Remover: ${shouldRemove}`);
        
        // Remover os selecionados (retornar false para remover)
        return !shouldRemove;
      });
      
      console.log('Usuários após filtro:', updated);
      console.log('IDs após filtro:', updated.map((u: any) => u.id));
      
      // Salvar os usuários atualizados
      const saveSuccess = saveLocalUsers(updated);
      console.log('Resultado do salvamento:', saveSuccess);
      
      if (saveSuccess) {
        // Verificar se os usuários foram realmente removidos
        const savedUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        console.log('Usuários após salvar:', savedUsers);
        console.log('IDs após salvar:', savedUsers.map((u: any) => u.id));
        
        // Recarregar para garantir dados consistentes
        const reloadedUsers = loadLocalUsers();
        setUsers(reloadedUsers);
        console.log('Usuários recarregados:', reloadedUsers);
        
        // Limpar seleção
        setSelectedUsers([]);
        console.log('Seleção limpa');
        
        toast({ 
          title: 'Usuários removidos', 
          description: `${numSelected} usuário(s) foram removidos com sucesso.` 
        });
        console.log('✅ Usuários removidos:', numSelected);
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Erro ao remover usuários', 
          description: 'Ocorreu um erro ao salvar as alterações.' 
        });
      }
    } catch (error) {
      console.error('❌ Erro ao excluir usuários selecionados:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro ao excluir usuários', 
        description: 'Ocorreu um erro inesperado.' 
      });
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
          <Button onClick={resetToMasterOnly} variant="destructive" size="sm" className="flex gap-2 items-center">
            <Trash2 className="w-4 h-4" /> Limpar Usuários
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
              <Input id="email" type="email" placeholder="usuario@exemplo.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="bg-poker-black/50 border-poker-gold/20 text-white" />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4 bg-poker-gold hover:bg-poker-gold/80 text-black">
            Criar Usuário
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
                      {user.username !== 'master' && user.username !== currentUsername && (
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
                      {user.username === currentUsername && (<span className="text-xs text-poker-gold ml-2">(Você)</span>)}
                    </td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.created_at}</td>
                    <td className="py-2 px-4 text-right">
                      {user.username !== 'master' && user.username !== currentUsername && (
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
