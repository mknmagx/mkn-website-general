/**
 * WhatsApp Business API - Template Service
 * Mesaj şablonları yönetimi servisi (Firebase Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import {
  COLLECTIONS,
  TEMPLATE_SCHEMA,
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUS,
} from './schema';
import {
  getMessageTemplates as fetchTemplates,
  createMessageTemplate,
  deleteMessageTemplate,
} from './api-client';

/**
 * Clean template components for Firestore storage
 * Removes 'example' fields and handles nested arrays that Firestore doesn't support
 */
function cleanComponentsForFirestore(components) {
  if (!Array.isArray(components)) return [];
  
  return components.map(component => {
    // Create a clean copy without the 'example' field
    // 'example' contains nested arrays like body_text: [["a", "b"]] which Firestore doesn't support
    const { example, ...cleanComponent } = component;
    return cleanComponent;
  });
}

/**
 * Sync templates from Meta API to Firestore
 */
export async function syncTemplates() {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // Fetch from Meta API
    const response = await fetchTemplates();
    
    if (!response.data) {
      return { success: false, error: 'Şablonlar alınamadı' };
    }

    console.log('=== META API RESPONSE ===');
    console.log('Total templates:', response.data.length);

    let synced = 0;
    let updated = 0;

    for (const template of response.data) {
      try {
        const templateId = template.id;
        const docRef = adminDb.collection(COLLECTIONS.TEMPLATES).doc(templateId);
        const existing = await docRef.get();

        // Clean components array for Firestore - remove 'example' fields with nested arrays
        const cleanedComponents = cleanComponentsForFirestore(template.components);

        // Build template data, filtering out undefined values for Firestore
        const templateData = {
          metaId: template.id,
          name: template.name || '',
          language: template.language || 'tr',
          category: template.category || 'UTILITY',
          status: template.status || 'PENDING',
          components: cleanedComponents,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        // Only add optional fields if they have values - flatten quality_score to just the score string
        if (template.quality_score?.score) {
          templateData.qualityScore = template.quality_score.score;
        }
        if (template.rejected_reason !== undefined && template.rejected_reason !== null) {
          templateData.rejectedReason = template.rejected_reason;
        }

        if (existing.exists) {
          await docRef.update(templateData);
          updated++;
        } else {
          await docRef.set({
            ...templateData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          synced++;
        }
      } catch (templateError) {
        console.error(`Error processing template ${template.name}:`, templateError.message);
      }
    }

    return {
      success: true,
      synced,
      updated,
      count: synced + updated,
      message: `${synced} yeni şablon eklendi, ${updated} şablon güncellendi`,
    };
  } catch (error) {
    console.error('Error syncing templates:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all templates from Firestore
 * If no templates exist, automatically syncs from Meta API
 */
export async function getTemplates(options = {}) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      // Fallback: Try to fetch directly from Meta API
      try {
        const response = await fetchTemplates();
        if (response.data) {
          let templates = response.data;
          const { category, status, search } = options;
          
          if (category && category !== 'all') {
            templates = templates.filter(t => t.category === category);
          }
          if (status && status !== 'all') {
            templates = templates.filter(t => t.status === status);
          }
          if (search) {
            const searchLower = search.toLowerCase();
            templates = templates.filter(t => t.name?.toLowerCase().includes(searchLower));
          }
          
          return { data: templates };
        }
      } catch (e) {
        console.error('Error fetching templates from Meta API:', e);
      }
      return { data: [] };
    }

    const { category, status, search, pageSize = 100, autoSync = true } = options;

    let queryRef = adminDb.collection(COLLECTIONS.TEMPLATES);

    if (category && category !== 'all') {
      queryRef = queryRef.where('category', '==', category);
    }

    if (status && status !== 'all') {
      queryRef = queryRef.where('status', '==', status);
    }

    queryRef = queryRef.orderBy('name').limit(pageSize);

    const snapshot = await queryRef.get();
    let templates = [];

    snapshot.docs.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    // Always sync from Meta API to check for new/updated templates
    if (autoSync) {
      try {
        const syncResult = await syncTemplates();
        if (syncResult.success && syncResult.count > 0) {
          // Refetch after sync to get any new templates
          const newSnapshot = await queryRef.get();
          templates = [];
          newSnapshot.docs.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() });
          });
        }
      } catch (syncError) {
        console.error('Error syncing templates:', syncError.message);
        // If no templates in DB and sync failed, try direct fetch from Meta
        if (templates.length === 0) {
          try {
            const response = await fetchTemplates();
            if (response.data) {
              templates = response.data;
              if (status && status !== 'all') {
                templates = templates.filter(t => t.status === status);
              }
              if (category && category !== 'all') {
                templates = templates.filter(t => t.category === category);
              }
            }
          } catch (e) {
            console.error('Fallback Meta fetch also failed:', e.message);
          }
        }
      }
    }

    // Client-side search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter((t) =>
        t.name?.toLowerCase().includes(searchLower)
      );
    }

    return { data: templates };
  } catch (error) {
    console.error('Error getting templates:', error);
    return { data: [] };
  }
}

/**
 * Get single template by ID
 */
export async function getTemplate(templateId) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const docRef = adminDb.collection(COLLECTIONS.TEMPLATES).doc(templateId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting template:', error);
    throw error;
  }
}

/**
 * Get template by name
 */
export async function getTemplateByName(name, language = 'tr') {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.TEMPLATES)
      .where('name', '==', name)
      .where('language', '==', language)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting template by name:', error);
    throw error;
  }
}

/**
 * Create new template via Meta API
 */
export async function createTemplate(templateData) {
  try {
    // Create via Meta API
    const response = await createMessageTemplate(templateData);

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    // Sync to Firestore
    await syncTemplates();

    return { success: true, templateId: response.id };
  } catch (error) {
    console.error('Error creating template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId, templateName) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // Delete from Meta API
    const response = await deleteMessageTemplate(templateName);

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    // Delete from Firestore
    const docRef = adminDb.collection(COLLECTIONS.TEMPLATES).doc(templateId);
    await docRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update template status from webhook
 */
export async function updateTemplateStatus(templateId, status, rejectedReason = null) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // Find template by meta ID
    const snapshot = await adminDb
      .collection(COLLECTIONS.TEMPLATES)
      .where('metaId', '==', templateId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log('Template not found for status update:', templateId);
      return { success: false, error: 'Template not found' };
    }

    const docRef = snapshot.docs[0].ref;
    
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (rejectedReason) {
      updateData.rejectedReason = rejectedReason;
    }

    await docRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating template status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get template categories
 */
export function getTemplateCategories() {
  return Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => ({
    key,
    value,
    label: getCategoryLabel(value),
  }));
}

/**
 * Get category label in Turkish
 */
function getCategoryLabel(category) {
  const labels = {
    [TEMPLATE_CATEGORIES.MARKETING]: 'Pazarlama',
    [TEMPLATE_CATEGORIES.UTILITY]: 'Yardımcı',
    [TEMPLATE_CATEGORIES.AUTHENTICATION]: 'Doğrulama',
  };
  return labels[category] || category;
}

/**
 * Get template status info
 */
export function getStatusInfo(status) {
  const statusInfo = {
    [TEMPLATE_STATUS.APPROVED]: {
      label: 'Onaylı',
      color: 'green',
      canSend: true,
    },
    [TEMPLATE_STATUS.PENDING]: {
      label: 'Beklemede',
      color: 'yellow',
      canSend: false,
    },
    [TEMPLATE_STATUS.REJECTED]: {
      label: 'Reddedildi',
      color: 'red',
      canSend: false,
    },
    [TEMPLATE_STATUS.PAUSED]: {
      label: 'Duraklatıldı',
      color: 'gray',
      canSend: false,
    },
    [TEMPLATE_STATUS.DISABLED]: {
      label: 'Devre Dışı',
      color: 'gray',
      canSend: false,
    },
  };

  return statusInfo[status] || { label: status, color: 'gray', canSend: false };
}

/**
 * Build template components for sending
 */
export function buildTemplateComponents(template, variables = {}) {
  const components = [];

  for (const component of template.components || []) {
    if (component.type === 'HEADER') {
      if (component.format === 'TEXT' && variables.header) {
        components.push({
          type: 'header',
          parameters: [{ type: 'text', text: variables.header }],
        });
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format) && variables.headerMedia) {
        const mediaType = component.format.toLowerCase();
        components.push({
          type: 'header',
          parameters: [{ 
            type: mediaType, 
            [mediaType]: { link: variables.headerMedia } 
          }],
        });
      }
    }

    if (component.type === 'BODY' && variables.body?.length > 0) {
      components.push({
        type: 'body',
        parameters: variables.body.map((v) => ({ type: 'text', text: v })),
      });
    }

    if (component.type === 'BUTTONS' && variables.buttons?.length > 0) {
      variables.buttons.forEach((button, index) => {
        if (button.type === 'url' && button.value) {
          components.push({
            type: 'button',
            sub_type: 'url',
            index,
            parameters: [{ type: 'text', text: button.value }],
          });
        }
      });
    }
  }

  return components;
}

/**
 * Get approved templates for quick sending
 */
export async function getApprovedTemplates() {
  try {
    const result = await getTemplates({ status: TEMPLATE_STATUS.APPROVED });
    return result.data;
  } catch (error) {
    console.error('Error getting approved templates:', error);
    return [];
  }
}

/**
 * Count templates by status
 */
export async function getTemplateStats() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return { approved: 0, pending: 0, rejected: 0, total: 0 };
    }

    const [approvedSnap, pendingSnap, rejectedSnap] = await Promise.all([
      adminDb.collection(COLLECTIONS.TEMPLATES).where('status', '==', TEMPLATE_STATUS.APPROVED).get(),
      adminDb.collection(COLLECTIONS.TEMPLATES).where('status', '==', TEMPLATE_STATUS.PENDING).get(),
      adminDb.collection(COLLECTIONS.TEMPLATES).where('status', '==', TEMPLATE_STATUS.REJECTED).get(),
    ]);

    return {
      approved: approvedSnap.size,
      pending: pendingSnap.size,
      rejected: rejectedSnap.size,
      total: approvedSnap.size + pendingSnap.size + rejectedSnap.size,
    };
  } catch (error) {
    console.error('Error getting template stats:', error);
    return { approved: 0, pending: 0, rejected: 0, total: 0 };
  }
}

/**
 * Get template preview text
 */
export function getTemplatePreview(template) {
  if (!template || !template.components) {
    return '';
  }

  const parts = [];

  for (const component of template.components) {
    if (component.type === 'HEADER') {
      if (component.format === 'TEXT' && component.text) {
        parts.push(`[Başlık] ${component.text}`);
      } else if (component.format === 'IMAGE') {
        parts.push('[📷 Görsel]');
      } else if (component.format === 'VIDEO') {
        parts.push('[🎥 Video]');
      } else if (component.format === 'DOCUMENT') {
        parts.push('[📄 Doküman]');
      }
    }

    if (component.type === 'BODY' && component.text) {
      parts.push(component.text);
    }

    if (component.type === 'FOOTER' && component.text) {
      parts.push(`[Alt bilgi] ${component.text}`);
    }

    if (component.type === 'BUTTONS') {
      const buttonTexts = (component.buttons || [])
        .map((btn, i) => `[${i + 1}] ${btn.text}`)
        .join(' ');
      if (buttonTexts) {
        parts.push(`[Butonlar] ${buttonTexts}`);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Extract template variables (placeholders like {{1}}, {{2}})
 */
export function extractTemplateVariables(template) {
  if (!template || !template.components) {
    return { header: [], body: [], buttons: [] };
  }

  const variables = {
    header: [],
    body: [],
    buttons: [],
  };

  const variableRegex = /\{\{(\d+)\}\}/g;

  for (const component of template.components) {
    if (component.type === 'HEADER' && component.format === 'TEXT' && component.text) {
      const matches = [...component.text.matchAll(variableRegex)];
      variables.header = matches.map((m) => ({
        index: parseInt(m[1]),
        placeholder: m[0],
      }));
    }

    if (component.type === 'BODY' && component.text) {
      const matches = [...component.text.matchAll(variableRegex)];
      variables.body = matches.map((m) => ({
        index: parseInt(m[1]),
        placeholder: m[0],
      }));
    }

    if (component.type === 'BUTTONS') {
      (component.buttons || []).forEach((btn, index) => {
        if (btn.type === 'URL' && btn.url) {
          const matches = [...btn.url.matchAll(variableRegex)];
          if (matches.length > 0) {
            variables.buttons.push({
              buttonIndex: index,
              buttonText: btn.text,
              type: 'url',
              variables: matches.map((m) => ({
                index: parseInt(m[1]),
                placeholder: m[0],
              })),
            });
          }
        }
      });
    }
  }

  return variables;
}
