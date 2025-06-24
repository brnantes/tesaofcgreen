import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminUser, AdminUser } from '@/services/adminAuthService';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSession = localStorage.getItem('admin_session');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          const { user, expires_at } = sessionData;

          if (new Date(expires_at) > new Date()) {
            console.log('AuthContext: Sessão restaurada para:', user);
            setIsLoggedIn(true);
            setCurrentUser(user);
            setIsLoading(false);
            return;
          } else {
            console.log('AuthContext: Sessão expirada, removendo...');
            localStorage.removeItem('admin_session');
          }
        }

        console.log('AuthContext: Nenhuma sessão válida encontrada');
        setIsLoggedIn(false);
        setCurrentUser(null);
      } catch (error) {
        console.error('AuthContext: Erro ao verificar sessão:', error);
        localStorage.removeItem('admin_session');
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const user = await loginAdminUser({ username, password });

      if (!user) {
        console.log('❌ Login falhou: Credenciais inválidas');
        setError('Usuário ou senha inválidos.');
        return { success: false, error: 'Usuário ou senha inválidos.' };
      }

      const session = {
        user,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      localStorage.setItem('admin_session', JSON.stringify(session));

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
      localStorage.removeItem('admin_session');
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
