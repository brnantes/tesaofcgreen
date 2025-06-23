// InternalAuth.ts
// Simples autenticação local para uso interno do painel admin

// Chave para armazenamento dos usuários no localStorage
export const LOCAL_USERS_KEY = 'admin_users';

export type InternalUser = {
  username: string;
  password: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

// Usuário master hardcoded para acesso interno
export const MASTER_USER = {
  id: 'master',
  username: 'master',
  password: 'adm123', // Altere esta senha se desejar
  email: 'master@admin.local',
  created_at: '01/01/2023',
};

export const internalLogin = (username: string, password: string): User | null => {
  try {
    console.log(`Tentando login com: ${username}`);
    
    // Verificar usuário master - sem normalização
    if (username === 'master' && password === 'adm123') {
      console.log('✅ Login com usuário master bem-sucedido');
      return {
        id: 'master',
        username: 'master',
        email: 'master@admin.local',
        created_at: '01/01/2023',
      };
    }
    
    // Buscar usuários do localStorage
    const localUsersStr = localStorage.getItem(LOCAL_USERS_KEY);
    console.log('Dados brutos do localStorage:', localUsersStr);
    
    if (!localUsersStr) {
      console.log('❌ Nenhum usuário encontrado no localStorage');
      return null;
    }
    
    try {
      const localUsers = JSON.parse(localUsersStr);
      
      if (!Array.isArray(localUsers)) {
        console.error('❌ Formato inválido de usuários no localStorage');
        return null;
      }
      
      console.log(`Buscando usuário: ${username}`);
      console.log('Lista de usuários disponíveis:', localUsers);
      
      // Buscar usuário por nome e senha - sem normalização
      // Usando a mesma lógica do usuário master
      for (const user of localUsers) {
        if (user && typeof user === 'object' && 'username' in user && 'password' in user) {
          console.log(`Comparando com: ${user.username}, senha: ${user.password}`);
          if (user.username === username && user.password === password) {
            console.log(`✅ Usuário encontrado: ${user.username}`);
            return {
              id: user.id || user.username,
              username: user.username,
              email: user.email || `${user.username}@admin.local`,
              created_at: user.created_at || new Date().toLocaleDateString('pt-BR'),
            };
          }
        }
      }
      
      console.log('❌ Nenhum usuário correspondente encontrado');
    } catch (parseError) {
      console.error('❌ Erro ao analisar dados de usuários:', parseError);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro durante o login:', error);
    return null;
  }
};

export function getMasterUsername(): string {
  return MASTER_USER.username;
}

// Função para carregar usuários do localStorage
export function loadLocalUsers() {
  try {
    console.log('Carregando usuários do localStorage');
    const usersJson = localStorage.getItem(LOCAL_USERS_KEY);
    console.log('JSON carregado:', usersJson);
    
    const users = usersJson ? JSON.parse(usersJson) : [];
    console.log('Usuários após parse:', users);
    
    // Verificar se users é um array
    if (!Array.isArray(users)) {
      console.error('Dados de usuários inválidos no localStorage');
      // Resetar para array vazio
      const newUsers = [MASTER_USER];
      console.log('Resetando para apenas master:', newUsers);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(newUsers));
      return newUsers;
    }
    
    // Sempre garantir que o master está presente
    if (!users.find((u) => u && typeof u === 'object' && u.username === 'master')) {
      console.log('Master não encontrado, adicionando-o');
      users.unshift(MASTER_USER);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    
    return users;
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    // Em caso de erro, retornar apenas o usuário master
    const defaultUsers = [MASTER_USER];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
}

// Função para salvar usuários no localStorage
export function saveLocalUsers(users: any[]) {
  try {
    console.log('Salvando usuários:', users);
    
    // Verificar se users é um array válido
    if (!Array.isArray(users)) {
      console.error('Tentativa de salvar dados inválidos');
      return false;
    }
    
    // Garantir que todos os itens são objetos válidos
    const validUsers = users.filter(u => u && typeof u === 'object' && u.username && u.password);
    console.log('Usuários válidos:', validUsers);
    
    // Garantir que o master está sempre presente
    if (!validUsers.find(u => u.username === 'master')) {
      console.log('Usuário master não encontrado, adicionando-o');
      validUsers.unshift(MASTER_USER);
    }
    
    // Salvar no localStorage
    const usersJson = JSON.stringify(validUsers);
    console.log('JSON a ser salvo:', usersJson);
    localStorage.setItem(LOCAL_USERS_KEY, usersJson);
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar usuários:', error);
    return false;
  }
}
