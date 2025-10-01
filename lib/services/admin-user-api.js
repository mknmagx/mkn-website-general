// API tabanlı kullanıcı oluşturma servisi
export const createUserWithAdmin = async (userData, currentUserRole) => {
  try {
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        currentUserRole
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Kullanıcı oluşturulamadı');
    }

    return result;
  } catch (error) {
    console.error("Error creating user with admin:", error);
    return {
      success: false,
      error: error.message
    };
  }
};