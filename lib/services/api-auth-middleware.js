/**
 * API Route Authentication ve Authorization Middleware
 * Mevcut PermissionGuard sistemini API route'lar için adapt eder
 */
import { NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../firebase-admin';
import logger from '../utils/logger';

/**
 * Request'ten Firebase ID token'ını çıkarır
 */
const extractTokenFromRequest = (request) => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return token;
};

/**
 * Firebase ID token'ını doğrular ve kullanıcı bilgilerini döner
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin SDK is not configured');
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    logger.auth('Token verified for user:', decodedToken.uid);
    return decodedToken;
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Kullanıcının admin bilgilerini ve izinlerini getirir
 */
const getAdminUserData = async (uid) => {
  try {
    if (!adminFirestore) {
      throw new Error('Firebase Admin Firestore is not configured');
    }

    const userDoc = await adminFirestore.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      logger.warn('User document not found for UID:', uid);
      return null;
    }

    const userData = userDoc.data();
    logger.auth('User data found:', { email: userData.email, role: userData.role });
    
    // Admin kontrolü
    const isAdmin = ['super_admin', 'admin', 'moderator'].includes(userData.role);
    
    if (!isAdmin) {
      logger.warn('User is not admin:', userData.role);
      return null;
    }

    // Kullanıcı zaten permissions'a sahip ise, bu permissions'ı kullan
    let permissions = userData.permissions || [];
    let allowedRoutes = [];
    
    // Eğer kullanıcıda permissions varsa, role'den almaya gerek yok
    if (permissions.length === 0 && userData.role) {
      try {
        const roleDoc = await adminFirestore.collection('roles').doc(userData.role).get();
        if (roleDoc.exists) { // Admin SDK'da exists property'si kullanılır, function değil
          const roleData = roleDoc.data();
          permissions = roleData.permissions || [];
          allowedRoutes = roleData.allowedRoutes || [];
          logger.auth('Role permissions loaded:', { permissions: permissions.length, routes: allowedRoutes.length });
        } else {
          logger.warn('Role document not found:', userData.role);
        }
      } catch (roleError) {
        logger.error('Role permissions fetch error:', roleError.message);
      }
    } else {
      logger.auth('Using user permissions:', { count: permissions.length });
    }

    const adminUser = {
      uid,
      email: userData.email,
      role: userData.role,
      isAdmin,
      permissions,
      allowedRoutes,
      userData
    };
    
    logger.success('Admin user authenticated successfully');
    return adminUser;
  } catch (error) {
    logger.error('Admin user data fetch failed:', error.message);
    return null;
  }
};

/**
 * Ana authentication middleware
 */
export const withAuth = (handler) => {
  return async (request, context) => {
    try {
      // Token'ı çıkar
      const idToken = extractTokenFromRequest(request);
      
      if (!idToken) {
        return NextResponse.json(
          { 
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }, 
          { status: 401 }
        );
      }

      // Token'ı doğrula
      const decodedToken = await verifyFirebaseToken(idToken);
      
      if (!decodedToken) {
        return NextResponse.json(
          { 
            error: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
          }, 
          { status: 401 }
        );
      }

      // Admin kullanıcı bilgilerini getir
      const adminUser = await getAdminUserData(decodedToken.uid);
      
      if (!adminUser) {
        return NextResponse.json(
          { 
            error: 'Admin access required',
            code: 'ADMIN_REQUIRED'
          }, 
          { status: 403 }
        );
      }

      // Request'e kullanıcı bilgilerini ekle
      request.user = adminUser;
      
      // Handler'ı çağır
      return await handler(request, context);
      
    } catch (error) {
      logger.error('Authentication middleware error:', error.message);
      return NextResponse.json(
        { 
          error: 'Authentication service error',
          code: 'AUTH_SERVICE_ERROR'
        }, 
        { status: 500 }
      );
    }
  };
};

/**
 * Permission kontrolü middleware
 */
export const withPermission = (requiredPermission) => {
  return (handler) => {
    return withAuth(async (request, context) => {
      const user = request.user;
      
      // Super admin kontrolü - her şeye erişebilir
      if (user.role === 'super_admin') {
        return await handler(request, context);
      }
      
      // Permission kontrolü
      const hasPermission = user.permissions.includes(requiredPermission);
      
      if (!hasPermission) {
        return NextResponse.json(
          { 
            error: 'Permission denied',
            code: 'PERMISSION_DENIED',
            required: requiredPermission,
            userPermissions: user.permissions
          }, 
          { status: 403 }
        );
      }
      
      return await handler(request, context);
    });
  };
};

/**
 * Birden fazla permission'dan birini kontrol eder
 */
export const withAnyPermission = (requiredPermissions = []) => {
  return (handler) => {
    return withAuth(async (request, context) => {
      const user = request.user;
      
      // Super admin kontrolü
      if (user.role === 'super_admin') {
        return await handler(request, context);
      }
      
      // Herhangi bir permission kontrolü
      const hasAnyPermission = requiredPermissions.some(permission => 
        user.permissions.includes(permission)
      );
      
      if (!hasAnyPermission) {
        return NextResponse.json(
          { 
            error: 'Permission denied',
            code: 'PERMISSION_DENIED',
            requiredAny: requiredPermissions,
            userPermissions: user.permissions
          }, 
          { status: 403 }
        );
      }
      
      return await handler(request, context);
    });
  };
};

/**
 * Role kontrolü middleware
 */
export const withRole = (allowedRoles = []) => {
  return (handler) => {
    return withAuth(async (request, context) => {
      const user = request.user;
      
      // Role kontrolü
      const hasAllowedRole = allowedRoles.includes(user.role);
      
      if (!hasAllowedRole) {
        return NextResponse.json(
          { 
            error: 'Role access denied',
            code: 'ROLE_DENIED',
            required: allowedRoles,
            userRole: user.role
          }, 
          { status: 403 }
        );
      }
      
      return await handler(request, context);
    });
  };
};

/**
 * Route access kontrolü middleware
 */
export const withRouteAccess = (routePath) => {
  return (handler) => {
    return withAuth(async (request, context) => {
      const user = request.user;
      
      // Super admin kontrolü
      if (user.role === 'super_admin' || user.allowedRoutes.includes('*')) {
        return await handler(request, context);
      }
      
      // Route access kontrolü
      const hasRouteAccess = user.allowedRoutes.some(route => 
        routePath.startsWith(route)
      );
      
      if (!hasRouteAccess) {
        return NextResponse.json(
          { 
            error: 'Route access denied',
            code: 'ROUTE_DENIED',
            route: routePath,
            allowedRoutes: user.allowedRoutes
          }, 
          { status: 403 }
        );
      }
      
      return await handler(request, context);
    });
  };
};

/**
 * Kombine middleware - hem permission hem de route kontrolü
 */
export const withAdminAccess = (options = {}) => {
  const { 
    permission, 
    permissions, 
    roles, 
    route 
  } = options;
  
  return (handler) => {
    return withAuth(async (request, context) => {
      const user = request.user;
      
      // Super admin kontrolü
      if (user.role === 'super_admin') {
        return await handler(request, context);
      }
      
      // Role kontrolü
      if (roles && roles.length > 0) {
        const hasRole = roles.includes(user.role);
        if (!hasRole) {
          return NextResponse.json(
            { 
              error: 'Role access denied',
              code: 'ROLE_DENIED',
              required: roles,
              userRole: user.role
            }, 
            { status: 403 }
          );
        }
      }
      
      // Permission kontrolü
      if (permission) {
        const hasPermission = user.permissions.includes(permission);
        if (!hasPermission) {
          return NextResponse.json(
            { 
              error: 'Permission denied',
              code: 'PERMISSION_DENIED',
              required: permission,
              userPermissions: user.permissions
            }, 
            { status: 403 }
          );
        }
      }
      
      // Multiple permissions kontrolü
      if (permissions && permissions.length > 0) {
        const hasAnyPermission = permissions.some(perm => 
          user.permissions.includes(perm)
        );
        if (!hasAnyPermission) {
          return NextResponse.json(
            { 
              error: 'Permission denied',
              code: 'PERMISSION_DENIED',
              requiredAny: permissions,
              userPermissions: user.permissions
            }, 
            { status: 403 }
          );
        }
      }
      
      // Route kontrolü
      if (route) {
        const hasRouteAccess = user.allowedRoutes.includes('*') || 
          user.allowedRoutes.some(allowedRoute => 
            route.startsWith(allowedRoute)
          );
        if (!hasRouteAccess) {
          return NextResponse.json(
            { 
              error: 'Route access denied',
              code: 'ROUTE_DENIED',
              route,
              allowedRoutes: user.allowedRoutes
            }, 
            { status: 403 }
          );
        }
      }
      
      return await handler(request, context);
    });
  };
};

// Hızlı kullanım için hazır middleware'lar
export const withIntegrationAccess = withAdminAccess({
  permissions: ['integrations.edit', 'integrations.view'],
  route: '/api/admin/integrations'
});

export const withShopifyAccess = withAdminAccess({
  permissions: ['integrations.edit', 'integrations.view'],
  route: '/api/admin/integrations/shopify'
});

export const withCompanyAccess = withAdminAccess({
  permissions: ['companies.manage', 'companies.view']
});

export const withUserManagement = withAdminAccess({
  permissions: ['users.manage'],
  roles: ['super_admin', 'admin']
});