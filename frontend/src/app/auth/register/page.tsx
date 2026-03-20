'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/authSlice';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthZustand } from '@/store/authZustand';
import { User, Phone, Mail, MapPin, Lock, Eye, EyeOff, AlertCircle, Leaf, ShoppingBag, CheckCircle } from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams?.get('role') as 'farmer' | 'buyer' | null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'farmer' | 'buyer'>(defaultRole || 'buyer');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const router = useRouter();
  const zustandLogin = useAuthZustand((s) => s.login);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data } = await authApi.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
        role,
      });

      const user = data.user;
      const token = data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      zustandLogin({ token, user });
      dispatch(loginSuccess({ user, token }));
      toast.success('Account created successfully!');

      if (role === 'farmer') {
        router.push('/dashboard/farmer');
      } else {
        router.push('/dashboard/buyer');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = role === 'farmer'
    ? [
        'List and sell your produce directly to businesses',
        'Get AI-powered pricing suggestions',
        'Track orders and manage inventory',
        'Build your reputation with verified reviews',
      ]
    : [
        'Access thousands of verified farmers',
        'AI-powered supplier recommendations',
        'Real-time price trends and analytics',
        'Direct negotiation and chat with farmers',
      ];

  const renderField = (
    label: string,
    name: string,
    icon: React.ReactNode,
    type: string,
    placeholder: string,
    value: string,
    onChange: (val: string) => void,
    error?: string,
    extra?: React.ReactNode,
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input pl-12"
          placeholder={placeholder}
        />
        {extra}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <p className="text-red-500 text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-200 dark:bg-teal-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        className="relative w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-3xl blur opacity-[0.07] -z-10" />

        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-5 group">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white font-bold text-xl">O</span>
            </motion.div>
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
              ODOP<span className="text-emerald-600">Connect</span>
            </span>
          </Link>

          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white text-center mb-1.5">
            Create Your Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-7">
            Join thousands of {role === 'farmer' ? 'farmers' : 'businesses'} trading on ODOP Connect
          </p>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6">
            <motion.button
              type="button"
              onClick={() => setRole('buyer')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                role === 'buyer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <ShoppingBag className="w-4 h-4" />
              I&apos;m a Buyer
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setRole('farmer')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                role === 'farmer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Leaf className="w-4 h-4" />
              I&apos;m a Farmer
            </motion.button>
          </div>

          {/* Benefits */}
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2.5">As a {role}, you&apos;ll get:</h3>
            <ul className="space-y-1.5">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderField(
                'Full Name', 'name', <User className="w-5 h-5" />, 'text',
                'John Doe', formData.name,
                (val) => setFormData({ ...formData, name: val }),
                errors.name,
              )}
              {renderField(
                'Phone Number', 'phone', <Phone className="w-5 h-5" />, 'tel',
                '+91 9000000000', formData.phone,
                (val) => setFormData({ ...formData, phone: val }),
              )}
            </div>

            {renderField(
              'Email Address', 'email', <Mail className="w-5 h-5" />, 'email',
              'you@example.com', formData.email,
              (val) => setFormData({ ...formData, email: val }),
              errors.email,
            )}

            {renderField(
              'Location', 'location', <MapPin className="w-5 h-5" />, 'text',
              'City, State, Country', formData.location,
              (val) => setFormData({ ...formData, location: val }),
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {renderField(
                'Password', 'password', <Lock className="w-5 h-5" />,
                showPassword ? 'text' : 'password',
                'Min 8 characters', formData.password,
                (val) => setFormData({ ...formData, password: val }),
                errors.password,
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>,
              )}
              {renderField(
                'Confirm Password', 'confirmPassword', <Lock className="w-5 h-5" />, 'password',
                'Confirm password', formData.confirmPassword,
                (val) => setFormData({ ...formData, confirmPassword: val }),
                errors.confirmPassword,
              )}
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-800"
                required
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-emerald-600 hover:underline font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</Link>
              </span>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </motion.div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}