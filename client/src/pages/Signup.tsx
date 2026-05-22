import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsSubmitting(true);
    try {
      await signup(data.name, data.email, data.password, data.role);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-2xl shadow-indigo-500/25">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  errors.name ? 'border-rose-500/50' : 'border-slate-700/50'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  errors.email ? 'border-rose-500/50' : 'border-slate-700/50'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-4 py-3 pr-12 bg-slate-900/50 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                    errors.password ? 'border-rose-500/50' : 'border-slate-700/50'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
              <select
                {...register('role')}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
