import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { success, error } = await login(username, password);

      if (success) {
        navigate('/admin');
      } else {
        setError(error || 'Senha incorreta.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Ocorreu um erro durante o login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-poker-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Green Table Admin</h1>
          <p className="text-gray-400 mt-2">Painel Administrativo</p>
        </div>

        <Card className="bg-poker-gray-medium/70 border border-poker-gold/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-poker-gold text-xl">Acesso Restrito</CardTitle>
            <CardDescription className="text-gray-300">
              Digite a senha para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-900/30 border-red-500/50 text-red-200" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm [&_p]:leading-relaxed">
                  Usuário ou senha inválidos.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-gray-300">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu nome de usuário"
                    className="bg-poker-gray-dark/70 border-poker-gold/20 text-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-gray-300">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-poker-gray-dark/70 border-poker-gold/20 text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="bg-poker-gold hover:bg-poker-gold-light text-poker-black mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Entrar'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-poker-gold/20 pt-4">
            <p className="text-gray-400 text-sm text-center">
              Acesso exclusivo para administração do Green Table
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
