// InternalAuth.ts
// Simples autenticação local para uso interno do painel admin

export type InternalUser = {
  username: string;
  password: string;
};

// Usuário master hardcoded para acesso interno
const MASTER_USER: InternalUser = {
  username: 'master',
  password: 'adm123', // Altere esta senha se desejar
};

export function internalLogin(username: string, password: string): boolean {
  return username === MASTER_USER.username && password === MASTER_USER.password;
}

export function getMasterUsername(): string {
  return MASTER_USER.username;
}
