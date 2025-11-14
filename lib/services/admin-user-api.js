import { authenticatedFetch } from '../api/auth-fetch';

// API tabanlı kullanıcı oluşturma servisi
export const createUserWithAdmin = async (userData, currentUserRole) => {
  try {
    console.log('🔍 Creating user with admin auth...');
    const response = await authenticatedFetch('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify({
        userData,
        currentUserRole
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Kullanıcı oluşturulamadı');
    }

    console.log('✅ User created successfully:', result.userId);
    return result;
  } catch (error) {
    console.error("❌ Error creating user with admin:", error);
    return {
      success: false,
      error: error.message
    };
  }
};