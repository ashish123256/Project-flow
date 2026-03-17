import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { useLogin } from '@/hooks/useAuth';

export function LoginPage() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const fillDemo = () => {
    setValue('email', 'test@example.com');
    setValue('password', 'Test@123');
  };

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-600 shadow-modal mb-4">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to your ProjectFlow account
          </p>
        </div>

        {/* Demo banner */}
        <button
          type="button"
          onClick={fillDemo}
          className="w-full mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100 text-left hover:bg-brand-100 transition-colors group"
        >
          <div className="h-8 w-8 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-700">Use demo credentials</p>
            <p className="text-xs text-brand-500">test@example.com · Test@123</p>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Card */}
        <div className="card p-8 shadow-modal">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isPending}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
