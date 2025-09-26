'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Contact Card Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Bir Hata Oluştu
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            İletişim kartı yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Tekrar Dene</span>
            </button>
            
            <a
              href="/"
              className="w-full flex items-center justify-center space-x-2 p-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </a>
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <strong>İletişim:</strong><br />
              Telefon: +90 531 494 25 94<br />
              E-posta: info@mkngroup.com.tr
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2025 MKN GROUP - Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  );
}