import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminUser, AdminUser } from '@/services/adminAuthService';
import { supabase } from '@/integrations/supabase/client';

// Chave para armazenar a sessão no localStorage
const ADMIN_SESSION_KEY = 'admin_session';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializar estado com valores do localStorage para evitar flash de conteúdo não autenticado
  const initSession = () => {
    try {
      const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (new Date(sessionData.expires_at) > new Date()) {
          return {
            isLoggedIn: true,
            currentUser: sessionData.user
          };
        }
      }
    } catch (e) {
      console.error('Erro ao inicializar sessão:', e);
    }
    return {
      isLoggedIn: false,
      currentUser: null
    };
  };
  
  const initialState = initSession();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialState.isLoggedIn);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(initialState.currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialState.isLoggedIn);
  const [error, setError] = useState<string | null>(null);

  // Efeito para verificar e renovar a sessão
  useEffect(() => {
    const checkSession = async () => {
      // Se já temos um usuário do estado inicial, não precisamos verificar novamente
      if (isLoggedIn && currentUser) {
        console.log('AuthContext: Sessão já inicializada com:', currentUser);
        // Renovar a sessão para garantir que não expire
        renewSession(currentUser);
        setIsLoading(false);
        return;
      }
      
      try {
        // Verificar sessão salva no localStorage
        const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
        
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          const { user, expires_at } = sessionData;

          if (new Date(expires_at) > new Date()) {
            console.log('AuthContext: Sessão restaurada para:', user);
            setIsLoggedIn(true);
            setCurrentUser(user);
            // Renovar a sessão para garantir que não expire
            renewSession(user);
            setIsLoading(false);
            return;
          } else {
            console.log('AuthContext: Sessão expirada, removendo...');
            localStorage.removeItem(ADMIN_SESSION_KEY);
          }
        }

        console.log('AuthContext: Nenhuma sessão válida encontrada');
        setIsLoggedIn(false);
        setCurrentUser(null);
      } catch (error) {
        console.error('AuthContext: Erro ao verificar sessão:', error);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Função para renovar a sessão
    const renewSession = (user: AdminUser) => {
      const session = {
        user,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    };

    checkSession();
  }, []);

  // Função para renovar a sessão quando houver atividade
  const setupActivityListeners = () => {
    const handleActivity = () => {
      if (isLoggedIn && currentUser) {
        const session = {
          user: currentUser,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      }
    };
    
    // Renovar sessão em eventos de atividade do usuário
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('focus', handleActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('focus', handleActivity);
    };
  };
  
  // Configurar listeners de atividade
  useEffect(() => {
    return setupActivityListeners();
  }, [isLoggedIn, currentUser]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const user = await loginAdminUser({ username, password });

      if (!user) {
        console.log('❌ Login falhou: Credenciais inválidas');
        setError('Usuário ou senha inválidos.');
        return { success: false, error: 'Usuário ou senha inválidos.' };
      }

      // Criar uma sessão com validade de 24 horas
      const session = {
        user,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Salvar no localStorage para persistência
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

      setCurrentUser(user);
      setError(null);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Ocorreu um erro durante o login.');
      return { success: false, error: 'Ocorreu um erro durante o login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
    }
  };
  
  // createUser removido para login local

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
