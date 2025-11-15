/**
 * Client-side sync utilities
 * Calls API routes for sync operations instead of direct Firestore access
 */

import { auth } from '@/lib/firebase';

/**
 * Get the current user's ID token
 */
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw error;
  }
};

/**
 * Syncs users with a specific role via API
 */
export const syncUsersWithRole = async (roleId, newPermissions) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch('/api/admin/sync/users-with-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        roleId,
        newPermissions,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sync request failed');
    }

    return data;
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      updatedUsers: 0,
      error: error.message,
    };
  }
};

/**
 * Other sync operations can be added here as needed
 */