'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthFormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onSuccess?: () => void;
}

type LoginFormValues = {
  email: string;
  password: string;
};

type RegisterFormValues = LoginFormValues & {
  name: string;
  confirmPassword: string;
};

export default function AuthForm({ mode, onModeChange, onSuccess }: AuthFormProps) {
  const { login, register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      loginForm.reset();
      onSuccess?.();
    } catch (err) {
      // Error is already handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      await registerUser(data.name, data.email, data.password);
      registerForm.reset();
      onSuccess?.();
    } catch (err) {
      // Error is already handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...loginForm.register('email', { required: true })}
            />
            {loginForm.formState.errors.email && (
              <span className="text-sm text-destructive">Email is required</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...loginForm.register('password', { required: true })}
            />
            {loginForm.formState.errors.password && (
              <span className="text-sm text-destructive">Password is required</span>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full font-normal"
            onClick={() => onModeChange('register')}
          >
            Don't have an account? Register
          </Button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              {...registerForm.register('name', { required: true })}
            />
            {registerForm.formState.errors.name && (
              <span className="text-sm text-destructive">Name is required</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...registerForm.register('email', { required: true })}
            />
            {registerForm.formState.errors.email && (
              <span className="text-sm text-destructive">Email is required</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...registerForm.register('password', { required: true, minLength: 6 })}
            />
            {registerForm.formState.errors.password?.type === 'required' && (
              <span className="text-sm text-destructive">Password is required</span>
            )}
            {registerForm.formState.errors.password?.type === 'minLength' && (
              <span className="text-sm text-destructive">
                Password must be at least 6 characters
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...registerForm.register('confirmPassword', { required: true })}
            />
            {registerForm.formState.errors.confirmPassword && (
              <span className="text-sm text-destructive">Confirm password is required</span>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full font-normal"
            onClick={() => onModeChange('login')}
          >
            Already have an account? Login
          </Button>
        </form>
      )}
    </div>
  );
}
