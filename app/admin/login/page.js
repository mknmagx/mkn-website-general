'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminSignIn, adminPasswordReset } from '../../../lib/services/admin-auth-service';
import { useAdminAuth, useAdminLogin } from '../../../hooks/use-admin-auth';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();
  const { login, isLoading, error, clearError } = useAdminLogin();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);

  // Admin zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (!loading && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setLoginStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData.email, formData.password, adminSignIn);
    
    if (result.success) {
      toast({
        title: "Giriş Başarılı",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });
      router.push('/admin/dashboard');
    } else if (result.requiresApproval) {
      // Admin yetkisi olmayan kullanıcı için toast
      toast({
        title: "Admin Onayı Bekleniyor",
        description: "Hesabınız başarıyla doğrulandı ancak admin yetkileriniz henüz onaylanmamış. Talebiniz sistem yöneticisine iletildi.",
        variant: "default",
      });
      setLoginStatus({
        type: 'pending',
        title: 'Admin Onayı Bekleniyor',
        message: 'Hesabınız başarıyla doğrulandı ancak admin yetkileriniz henüz onaylanmamış. Talebiniz sistem yöneticisine iletildi.'
      });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Hata",
        description: "Lütfen email adresinizi girin.",
        variant: "destructive",
      });
      return;
    }

    const result = await adminPasswordReset(resetEmail);
    
    if (result.success) {
      toast({
        title: "Email Gönderildi",
        description: "Şifre sıfırlama bağlantısı email adresinize gönderildi.",
      });
    } else {
      toast({
        title: "Hata",
        description: result.message,
        variant: "destructive",
      });
    }

    setResetStatus({
      type: result.success ? 'success' : 'error',
      message: result.message
    });

    if (result.success) {
      setTimeout(() => {
        setShowResetForm(false);
        setResetEmail('');
        setResetStatus(null);
        setLoginStatus(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Paneli</h1>
          <p className="text-blue-200">MKN Group Yönetici Girişi</p>
        </div>

        {/* Login Form */}
        {!showResetForm ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="admin@mkngroup.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {loginStatus && (
                <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  loginStatus.type === 'pending' 
                    ? 'text-yellow-200 bg-yellow-500/20 border-yellow-500/30' 
                    : 'text-red-300 bg-red-500/20 border-red-500/30'
                }`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">{loginStatus.title}</h4>
                    <p className="text-xs opacity-90">{loginStatus.message}</p>
                  </div>
                </div>
              )}

              {/* Error Message (for other errors) */}
              {error && !loginStatus && (
                <div className="flex items-center space-x-2 text-red-300 bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(true);
                    setLoginStatus(null);
                  }}
                  className="text-blue-300 hover:text-white text-sm transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Password Reset Form */
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Şifre Sıfırla</h2>
              <p className="text-blue-200 text-sm">
                Email adresinizi girin, şifre sıfırlama bağlantısını gönderelim.
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-white mb-2">
                  Email Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="admin@mkngroup.com"
                  />
                </div>
              </div>

              {/* Reset Status */}
              {resetStatus && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  resetStatus.type === 'success' 
                    ? 'text-green-300 bg-green-500/20 border-green-500/30' 
                    : 'text-red-300 bg-red-500/20 border-red-500/30'
                }`}>
                  {resetStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{resetStatus.message}</span>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetEmail('');
                    setResetStatus(null);
                    setLoginStatus(null);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  disabled={!resetEmail}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            © 2025 MKN Group. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}