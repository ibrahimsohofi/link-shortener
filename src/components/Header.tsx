'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import AuthForm from '@/components/AuthForm';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const isActive = (path: string) => {
    return pathname === path
      ? 'text-primary border-b-2 border-primary font-medium'
      : 'text-muted-foreground hover:text-foreground';
  };

  return (
    <header className="w-full bg-background border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              LinkShort
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 md:space-x-6 mx-6">
          <Link
            href="/"
            className={`text-sm ${isActive('/')} transition-colors py-2`}
          >
            Home
          </Link>
          <Link
            href="/analytics"
            className={`text-sm ${isActive('/analytics')} transition-colors py-2`}
          >
            Analytics
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm ${isActive('/dashboard')} transition-colors py-2`}
          >
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm hidden md:inline-block">
                Hi, {user.name}
              </span>
              <Button variant="ghost" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setAuthMode('login')}
                  >
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {authMode === 'login' ? 'Login' : 'Register'}
                    </DialogTitle>
                    <DialogDescription>
                      {authMode === 'login'
                        ? 'Enter your credentials to login to your account.'
                        : 'Fill in the details to create a new account.'}
                    </DialogDescription>
                  </DialogHeader>
                  <AuthForm
                    mode={authMode}
                    onModeChange={(mode) => setAuthMode(mode)}
                    onSuccess={() => setIsLoginDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setAuthMode('register');
                    setIsLoginDialogOpen(true);
                  }}>
                    Register
                  </Button>
                </DialogTrigger>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
