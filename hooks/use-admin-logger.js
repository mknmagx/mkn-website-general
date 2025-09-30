import { useAdminAuth } from './use-admin-auth';
import {
  logCrudOperation,
  logUserManagement,
  logCompanyManagement,
  logContactManagement,
  logQuoteManagement,
  logError,
  CRUD_OPERATIONS,
} from '../lib/services/admin-log-service';

/**
 * Admin CRUD işlemleri için logging hook'u
 */
export const useAdminLogger = () => {
  const { user } = useAdminAuth();

  const logCrud = async (operation, resource, resourceId = null, details = null, metadata = {}) => {
    if (!user) return;
    
    try {
      await logCrudOperation(
        user.uid,
        user.email,
        user.role,
        operation,
        resource,
        resourceId,
        details,
        metadata
      );
    } catch (error) {
      console.error('CRUD logging failed:', error);
    }
  };

  const logUserAction = async (action, targetUserId, details, metadata = {}) => {
    if (!user) return;
    
    try {
      await logUserManagement(
        user.uid,
        user.email,
        user.role,
        action,
        targetUserId,
        details,
        metadata
      );
    } catch (error) {
      console.error('User action logging failed:', error);
    }
  };

  const logCompanyAction = async (action, companyId, details, metadata = {}) => {
    if (!user) return;
    
    try {
      await logCompanyManagement(
        user.uid,
        user.email,
        user.role,
        action,
        companyId,
        details,
        metadata
      );
    } catch (error) {
      console.error('Company action logging failed:', error);
    }
  };

  const logContactAction = async (action, contactId, details, metadata = {}) => {
    if (!user) return;
    
    try {
      await logContactManagement(
        user.uid,
        user.email,
        user.role,
        action,
        contactId,
        details,
        metadata
      );
    } catch (error) {
      console.error('Contact action logging failed:', error);
    }
  };

  const logQuoteAction = async (action, quoteId, details, metadata = {}) => {
    if (!user) return;
    
    try {
      await logQuoteManagement(
        user.uid,
        user.email,
        user.role,
        action,
        quoteId,
        details,
        metadata
      );
    } catch (error) {
      console.error('Quote action logging failed:', error);
    }
  };

  const logErrorAction = async (action, error, metadata = {}) => {
    if (!user) return;
    
    try {
      await logError(
        user.uid,
        user.email,
        user.role,
        action,
        error,
        metadata
      );
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  };

  // Hızlı kullanım fonksiyonları
  const logCreate = (resource, resourceId, details, metadata) => 
    logCrud(CRUD_OPERATIONS.CREATE, resource, resourceId, details, metadata);

  const logRead = (resource, resourceId, details, metadata) => 
    logCrud(CRUD_OPERATIONS.READ, resource, resourceId, details, metadata);

  const logUpdate = (resource, resourceId, details, metadata) => 
    logCrud(CRUD_OPERATIONS.UPDATE, resource, resourceId, details, metadata);

  const logDelete = (resource, resourceId, details, metadata) => 
    logCrud(CRUD_OPERATIONS.DELETE, resource, resourceId, details, metadata);

  const logBulkUpdate = (resource, count, details, metadata) => 
    logCrud(CRUD_OPERATIONS.BULK_UPDATE, resource, null, `${count} kayıt güncellendi: ${details}`, metadata);

  const logBulkDelete = (resource, count, details, metadata) => 
    logCrud(CRUD_OPERATIONS.BULK_DELETE, resource, null, `${count} kayıt silindi: ${details}`, metadata);

  const logExport = (resource, format, count, metadata) => 
    logCrud(CRUD_OPERATIONS.EXPORT, resource, null, `${count} kayıt ${format} formatında dışa aktarıldı`, metadata);

  const logImport = (resource, count, details, metadata) => 
    logCrud(CRUD_OPERATIONS.IMPORT, resource, null, `${count} kayıt içe aktarıldı: ${details}`, metadata);

  return {
    // Genel CRUD
    logCrud,
    logCreate,
    logRead,
    logUpdate,
    logDelete,
    logBulkUpdate,
    logBulkDelete,
    logExport,
    logImport,

    // Özel eylemler
    logUserAction,
    logCompanyAction,
    logContactAction,
    logQuoteAction,
    logErrorAction,

    // Kullanıcı bilgisi
    currentUser: user,
  };
};