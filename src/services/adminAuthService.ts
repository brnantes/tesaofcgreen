// adminAuthService.ts
// Serviço para autenticação de usuários admin via Supabase

import { supabase } from '@/integrations/supabase/client';

export type AdminUser = {
  id: string;
  username: string;
  email: string | null;
  created_at: string;
};

export type AdminCredentials = {
  username: string;
  password: string;
};

export type AdminUserInput = {
  username: string;
  password: string;
  email?: string;
};

// Função para garantir que o email sempre tenha um valor padrão
const ensureEmail = (username: string, email?: string): string => {
  return email && email.trim() !== '' ? email : `${username}@admin.local`;
};

/**
 * Realiza login de usuário admin via Supabase
 */
export const loginAdminUser = async (credentials: AdminCredentials): Promise<AdminUser | null> => {
  try {
    console.log(`Tentando login admin com: ${credentials.username}`);
    
    // Usar a função RPC criada no Supabase para verificar login
    const { data, error } = await supabase
      .rpc('check_admin_login', {
        p_username: credentials.username,
        p_password: credentials.password
      });
    
    if (error) {
      console.error('Erro ao fazer login admin:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Credenciais inválidas');
      return null;
    }
    
    const user = data[0];
    console.log('✅ Login admin bem-sucedido:', user);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email || null,
      created_at: new Date(user.created_at).toLocaleDateString('pt-BR')
    };
  } catch (error) {
    console.error('Erro durante login admin:', error);
    return null;
  }
};

/**
 * Lista todos os usuários admin
 */
export const listAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, email, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao listar usuários admin:', error);
      return [];
    }
    
    return data.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email || null,
      created_at: new Date(user.created_at).toLocaleDateString('pt-BR')
    }));
  } catch (error) {
    console.error('Erro ao listar usuários admin:', error);
    return [];
  }
};

/**
 * Cria um novo usuário admin
 */
export const createAdminUser = async (user: AdminUserInput): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username: user.username,
          password: user.password,
          email: user.email || `${user.username}@admin.local` // Valor padrão para contornar restrição NOT NULL
        }
      ])
      .select('id, username, email, created_at')
      .single();
    
    if (error) {
      console.error('Erro ao criar usuário admin:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      email: data.email || null,
      created_at: new Date(data.created_at).toLocaleDateString('pt-BR')
    };
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
    return null;
  }
};

/**
 * Exclui um usuário admin
 */
export const deleteAdminUser = async (id: string): Promise<boolean> => {
  try {
    // Não permitir excluir o usuário master
    const { data: userData } = await supabase
      .from('admin_users')
      .select('username')
      .eq('id', id)
      .single();
    
    if (userData?.username === 'master') {
      console.error('Não é permitido excluir o usuário master');
      return false;
    }
    
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir usuário admin:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir usuário admin:', error);
    return false;
  }
};
