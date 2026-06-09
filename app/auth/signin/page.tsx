'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package2, Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Auto-redirect to dashboard in development mode
  useEffect(() => {
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (isDevMode) {
      // Automatically sign in with demo credentials in development
      const autoSignIn = async () => {
        const result = await signIn('credentials', {
          redirect: false,
          email: 'demo@hyperbox.com',
          password: 'demo',
        });

        if (!result?.error) {
          router.push('/dashboard');
          router.refresh();
        }
      };
      autoSignIn();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('خطأ في البريد الإلكتروني أو كلمة المرور');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-brand/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

      <div className="w-full max-w-md relative z-10 page-enter">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl shadow-2xl shadow-primary/20 mb-4 animate-bounce-slow">
            <Package2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            <span style={{ color: 'oklch(0.55 0.22 264)' }}>HYPER</span>
            <span style={{ color: 'oklch(0.70 0.19 55)' }}>BOX</span>
          </h1>
          <p className="text-muted-foreground font-medium">إدارة تأجير الحاويات</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 card-shadow">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">تسجيل الدخول</h2>
            <p className="text-sm text-muted-foreground">مرحباً بك مجدداً، يرجى إدخال بياناتك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold pr-1">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-background border border-border rounded-2xl pr-12 pl-4 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-sm font-bold">كلمة المرور</label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline transition-all">نسيت كلمة المرور؟</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-2xl pr-12 pl-12 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer group pr-1">
              <input type="checkbox" className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">تذكرني على هذا الجهاز</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 gradient-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>دخول للنظام</span>
                  <ArrowLeft size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-12 text-sm text-muted-foreground font-medium">
          ليس لديك حساب؟{' '}
          <button className="text-primary font-bold hover:underline transition-all underline-offset-4">تواصل مع الإدارة</button>
        </p>
      </div>
    </div>
  );
}
