'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
            <FileQuestion className="w-24 h-24 text-blue-600 relative" strokeWidth={1.5} />
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-3">
          <h1 className="text-7xl font-bold text-gray-900">404</h1>
          <p className="text-xl font-medium text-gray-700">Sayfa Bulunamadı</p>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Aradığınız admin sayfası mevcut değil veya kaldırılmış olabilir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
          
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
