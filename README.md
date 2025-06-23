# Green Table Poker - Sistema de Gerenciamento de Torneios

Sistema de gerenciamento de torneios de poker para a Green Table, permitindo o cadastro, edição e remoção de torneios, além de exibi-los em uma landing page organizada por dia da semana.

## 🚀 Tecnologias

- **Frontend**: React 18 com TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router
- **Autenticação**: Autenticação local com persistência
- **Banco de Dados**: Supabase
- **Build**: Vite
- **Hospedagem**: Lovable (ou auto-hospedado)

## 🛠️ Como Executar Localmente

1. **Pré-requisitos**
   - Node.js (versão 18 ou superior)
   - npm ou yarn
   - Conta no Supabase (para o banco de dados)

2. **Configuração**
   ```bash
   # Clonar o repositório
   git clone <URL_DO_REPOSITORIO>
   cd tesaofcgreen

   # Instalar dependências
   npm install
   ```

3. **Configurar Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. **Iniciar o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   O servidor estará disponível em: http://localhost:8080

## 🔐 Acesso ao Painel Administrativo

1. Acesse a página de login: http://localhost:8080/login
2. Utilize as seguintes credenciais:
   - **Usuário**: master
   - **Senha**: adm123

## 📋 Funcionalidades

### Página Inicial
- Visualização dos torneios organizados por dia da semana
- Design responsivo

### Painel Administrativo
- **Gerenciamento de Torneios**
  - Adicionar novos torneios
  - Editar torneios existentes
  - Excluir torneios
  - Visualizar todos os torneios cadastrados

## 🧪 Testando a Aplicação

1. **Criar um Torneio**
   - Acesse o painel administrativo
   - Clique em "Adicionar" no dia desejado
   - Preencha os dados do torneio
   - Clique em "Salvar"

2. **Editar um Torneio**
   - Localize o torneio na lista
   - Clique no ícone de editar (lápis)
   - Faça as alterações necessárias
   - Clique em "Salvar"

3. **Excluir um Torneio**
   - Localize o torneio na lista
   - Clique no ícone de lixeira
   - Confirme a exclusão

## 🔄 Persistência de Dados

- Os dados são persistidos no Supabase
- A sessão do usuário é mantida por 24 horas
- Todas as alterações são refletidas em tempo real

## 📦 Implantação

### Lovable
1. Acesse o [Painel Lovable](https://lovable.dev/projects/a45c5249-35fb-441a-ad71-6ec363f6b823)
2. Clique em "Share" > "Publish"
3. Siga as instruções na tela

### Auto-hospedado
1. Construa a aplicação para produção:
   ```bash
   npm run build
   ```
2. Sirva os arquivos da pasta `dist` usando seu servidor web preferido

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

Desenvolvido para Green Table Poker
