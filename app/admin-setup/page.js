'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSetupPage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const createAdminRole = async () => {
    if (!user) {
      setStatus('Önce giriş yapmanız gerekiyor.');
      return;
    }

    try {
      setStatus('Admin rolü oluşturuluyor...');
      
      await setDoc(doc(db, 'admins', user.uid), {
        role: 'admin',
        email: user.email,
        name: user.displayName || 'Admin User',
        createdAt: new Date(),
        permissions: {
          quotes: true,
          contacts: true,
          analytics: true
        }
      });

      setStatus('✅ Admin rolü başarıyla oluşturuldu! Artık admin paneline giriş yapabilirsiniz.');
    } catch (error) {
      console.error('Error creating admin role:', error);
      setStatus('❌ Hata: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Setup</h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Kullanıcı:</strong> {user.email}
              </p>
              <p className="text-sm text-blue-800">
                <strong>UID:</strong> {user.uid}
              </p>
            </div>
            
            <button
              onClick={createAdminRole}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Rolü Oluştur
            </button>
            
            {status && (
              <div className={`p-4 rounded-lg ${
                status.includes('✅') ? 'bg-green-50 text-green-800' : 
                status.includes('❌') ? 'bg-red-50 text-red-800' : 
                'bg-yellow-50 text-yellow-800'
              }`}>
                {status}
              </div>
            )}
            
            {status.includes('✅') && (
              <a
                href="/admin/login"
                className="block text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Admin Paneline Git
              </a>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Önce Firebase'de giriş yapın</p>
            <a
              href="/admin/login"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </a>
          </div>
        )}
      </div>
    </div>
  );
}