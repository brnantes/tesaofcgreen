import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { internalLogin, getMasterUsername } from './InternalAuth';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUsername: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>; // agora login local
  logout: () => Promise<void>;
  // createUser removido para login local
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Verificar sessão atual ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar se há sessão salva no localStorage
        const savedSession = localStorage.getItem('admin_session');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          const { username, timestamp } = sessionData;
          
          // Verificar se a sessão não está expirada (24 horas)
          const sessionAge = Date.now() - timestamp;
          const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 horas em ms
          
          if (sessionAge < MAX_SESSION_AGE) {
            console.log(' AuthContext: Sessão restaurada para:', username);
            setIsLoggedIn(true);
            setCurrentUsername(username);
            setLoading(false);
            return;
          } else {
            console.log(' AuthContext: Sessão expirada, removendo...');
            localStorage.removeItem('admin_session');
          }
        }
        
        // Se não há sessão válida, manter deslogado
        console.log(' AuthContext: Nenhuma sessão válida encontrada');
        setIsLoggedIn(false);
        setCurrentUsername(null);
      } catch (error) {
        console.error(' AuthContext: Erro ao verificar sessão:', error);
        localStorage.removeItem('admin_session');
        setIsLoggedIn(false);
        setCurrentUsername(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const userResult = internalLogin(username, password);
      
      if (userResult) {
        setIsLoggedIn(true);
        setCurrentUsername(username);
        localStorage.setItem('admin_session', JSON.stringify({ username, timestamp: Date.now() }));
        console.log('✅ Login bem-sucedido para:', username);
        return { success: true };
      } else {
        setIsLoggedIn(false);
        setCurrentUsername('');
        console.log('❌ Login falhou: Credenciais inválidas');
        return { success: false, error: 'Usuário ou senha inválidos.' };
      }
    } catch (error) {
      console.error('❌ Erro durante login:', error);
      setIsLoggedIn(false);
      setCurrentUsername('');
      return { success: false, error: 'Ocorreu um erro durante o login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Remover sessão do localStorage
    localStorage.removeItem('admin_session');
    
    console.log(' AuthContext: Logout realizado e sessão removida');
    setIsLoggedIn(false);
    setCurrentUsername(null);
    navigate('/');
  };
  
  // createUser removido para login local

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUsername,
        loading,
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
