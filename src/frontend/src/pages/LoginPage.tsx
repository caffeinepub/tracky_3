import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, loginError } = useInternetIdentity();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    }
  };

  const isLoading = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-sage/10 to-terracotta/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta/20 mb-4">
            <BookOpen className="w-8 h-8 text-terracotta" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Tracky</h1>
          <p className="text-muted-foreground">Track your syllabus progress and study time</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || loginError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || loginError?.message}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleLogin} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In with Internet Identity'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              New to Tracky? Sign in to create your account automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
