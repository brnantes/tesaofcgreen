import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { internalLogin, getMasterUsername } from './InternalAuth';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUsername: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>; // agora login local
  logout: () => Promise<void>;
  // createUser removido para login local
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar sessão atual ao carregar
  useEffect(() => {
    const checkSession = async () => {
      // Para login local, não há sessão persistida
      setIsLoggedIn(false);
      setCurrentUsername(null);
    };
    
    checkSession();
    
    // Monitorar mudanças na autenticação
    // Não há listener de autenticação para login local
  }, []);

  const login = async (username: string, password: string) => {
    if (internalLogin(username, password)) {
      setIsLoggedIn(true);
      setCurrentUsername(username);
      return { success: true };
    } else {
      return { success: false, error: 'Nome de usuário ou senha inválidos' };
    }
  };

  const logout = async () => {
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
