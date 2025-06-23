import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

const UsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createUser, currentUsername } = useAuth();

  // Função para carregar usuários
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Buscar usuários do Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Formatar os dados
      const formattedUsers = authUsers.users
        .filter(user => user.email?.endsWith('@admin.local')) // Apenas usuários admin
        .map(user => ({
          id: user.id,
          username: user.user_metadata?.username || 'Usuário sem nome',
          email: user.email || '',
          created_at: new Date(user.created_at).toLocaleDateString('pt-BR')
        }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: "Verifique o console para mais detalhes."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      if (!newUsername || !newUserPassword) {
        throw new Error('Nome de usuário e senha são obrigatórios');
      }

      // Usar a função de criação do AuthContext
      const { success, error } = await createUser(newUsername, newUserPassword);

      if (!success) throw new Error(error);

      toast({
        title: "Usuário criado com sucesso",
        description: `${newUsername} foi adicionado como administrador.`
      });

      // Limpar formulário e recarregar lista
      setNewUsername('');
      setNewUserPassword('');
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message || "Verifique o console para mais detalhes."
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Função para remover usuário
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      toast({
        title: "Usuário removido",
        description: `${username} foi removido com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover usuário",
        description: error.message || "Verifique o console para mais detalhes."
      });
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Gerenciar Usuários</h2>
        <Button 
          onClick={fetchUsers} 
          variant="outline" 
          size="sm"
          className="flex gap-2 items-center border-poker-gold/20 hover:border-poker-gold/50"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Formulário para criar novo usuário */}
      <Card className="p-4 bg-poker-gray-dark/50 border border-poker-gold/20">
        <h3 className="text-lg font-semibold text-poker-gold mb-4">Adicionar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                placeholder="Ex: VITOR"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="bg-poker-black/50 border-poker-gold/20 text-white uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                className="bg-poker-black/50 border-poker-gold/20 text-white"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="bg-poker-gold hover:bg-poker-gold-light text-poker-black"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Usuário
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Tabela de usuários */}
      <Card className="p-4 bg-poker-gray-dark/50 border border-poker-gold/20">
        <h3 className="text-lg font-semibold text-poker-gold mb-4">Usuários Cadastrados</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 text-poker-gold animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhum usuário encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-poker-gold/30">
                  <th className="text-left py-2 px-4 text-poker-gold">Usuário</th>
                  <th className="text-left py-2 px-4 text-poker-gold">Email</th>
                  <th className="text-left py-2 px-4 text-poker-gold">Criado em</th>
                  <th className="text-right py-2 px-4 text-poker-gold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-poker-gold/10 hover:bg-poker-black/30">
                    <td className="py-2 px-4 font-medium">
                      {user.username}
                      {user.username === currentUsername && (
                        <span className="text-xs text-poker-gold ml-2">(Você)</span>
                      )}
                    </td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.created_at}</td>
                    <td className="py-2 px-4 text-right">
                      {user.username !== currentUsername && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="hover:bg-red-900/20 hover:text-red-400"
                        >
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
