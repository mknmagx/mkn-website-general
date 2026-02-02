/**
 * WhatsApp Templates API Route
 * GET: Şablonları listele / senkronize et
 * POST: Şablon oluştur
 * DELETE: Şablon sil
 */

import { NextResponse } from 'next/server';
import {
  syncTemplates,
  getTemplates,
  getTemplate,
  createTemplate,
  deleteTemplate,
  getTemplatePreview,
  extractTemplateVariables,
} from '@/lib/services/whatsapp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Sync templates from Meta API
    if (action === 'sync') {
      const result = await syncTemplates();
      return NextResponse.json({
        success: true,
        data: result,
        message: `${result.synced} yeni şablon eklendi, ${result.updated} şablon güncellendi`,
      });
    }

    // Get single template with details
    const templateId = searchParams.get('id');
    if (templateId) {
      const template = await getTemplate(templateId);
      
      if (!template) {
        return NextResponse.json({
          success: false,
          error: 'Şablon bulunamadı',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...template,
          preview: getTemplatePreview(template),
          variables: extractTemplateVariables(template),
        },
      });
    }

    // List templates with filters
    const options = {
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    };

    const result = await getTemplates(options);

    // Add preview to each template
    const templatesWithPreview = result.data.map((template) => ({
      ...template,
      preview: getTemplatePreview(template),
    }));

    return NextResponse.json({
      success: true,
      data: templatesWithPreview,
    });
  } catch (error) {
    console.error('WhatsApp templates GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, language, category, components } = body;

    if (!name || !language || !category || !components) {
      return NextResponse.json({
        success: false,
        error: 'Tüm alanlar zorunludur: name, language, category, components',
      }, { status: 400 });
    }

    const result = await createTemplate({
      name,
      language,
      category,
      components,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Şablon oluşturuldu ve onay için gönderildi',
    });
  } catch (error) {
    console.error('WhatsApp templates POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get('name');

    if (!templateName) {
      return NextResponse.json({
        success: false,
        error: 'Şablon adı gerekli',
      }, { status: 400 });
    }

    await deleteTemplate(templateName);

    return NextResponse.json({
      success: true,
      message: 'Şablon silindi',
    });
  } catch (error) {
    console.error('WhatsApp templates DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
