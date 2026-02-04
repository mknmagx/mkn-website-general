/**
 * WhatsApp Contacts API Route
 * GET: Kişileri listele / ara
 * POST: Yeni kişi oluştur
 * PATCH: Kişi güncelle
 * DELETE: Kişi sil
 */

import { NextResponse } from 'next/server';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  searchContacts,
  getContactGroupStats,
  importContacts,
  findByPhone,
  CONTACT_GROUPS,
} from '@/lib/services/whatsapp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get contact groups stats
    if (action === 'stats') {
      const stats = await getContactGroupStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Get groups list
    if (action === 'groups') {
      return NextResponse.json({
        success: true,
        data: Object.entries(CONTACT_GROUPS).map(([key, value]) => ({
          id: value,
          label: getGroupLabel(value),
        })),
      });
    }

    // Search contacts
    const searchQuery = searchParams.get('search');
    const exactMatch = searchParams.get('exactMatch') === 'true';
    
    // Exact phone match
    if (searchQuery && exactMatch) {
      const contact = await findByPhone(searchQuery);
      return NextResponse.json({
        success: true,
        data: contact ? [contact] : [],
      });
    }
    
    if (searchQuery && searchParams.get('quick') === 'true') {
      const results = await searchContacts(searchQuery, 10);
      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    // Get single contact
    const contactId = searchParams.get('id');
    if (contactId) {
      const contact = await getContact(contactId);
      if (!contact) {
        return NextResponse.json({
          success: false,
          error: 'Kişi bulunamadı',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: contact,
      });
    }

    // List contacts with filters
    const options = {
      search: searchQuery,
      group: searchParams.get('group'),
      tag: searchParams.get('tag'),
      pageSize: parseInt(searchParams.get('pageSize')) || 50,
      sortBy: searchParams.get('sortBy') || 'name',
      sortDir: searchParams.get('sortDir') || 'asc',
    };

    const result = await getContacts(options);

    // Include stats if requested
    const includeStats = searchParams.get('stats') === 'true';
    let stats = null;
    if (includeStats) {
      stats = await getContactGroupStats();
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      hasMore: result.hasMore,
      stats: stats,
    });
  } catch (error) {
    console.error('WhatsApp contacts GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Import contacts
    if (action === 'import') {
      const { contacts, userId } = body;
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Geçerli kişi listesi gerekli',
        }, { status: 400 });
      }

      const result = await importContacts(contacts, userId);
      return NextResponse.json({
        success: true,
        data: result,
        message: `${result.success} kişi eklendi, ${result.duplicates} tekrar, ${result.failed} hatalı`,
      });
    }

    // Create single contact
    const { phoneNumber, name, company, email, group, notes, tags, userId, phoneNumberId } = body;

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Telefon numarası gerekli',
      }, { status: 400 });
    }

    // Get current phoneNumberId if not provided
    let currentPhoneNumberId = phoneNumberId;
    if (!currentPhoneNumberId) {
      const { getSettings } = await import('@/lib/services/whatsapp');
      const settings = await getSettings();
      currentPhoneNumberId = settings?.phoneNumberId;
    }

    const result = await createContact({
      phoneNumber,
      name: name || phoneNumber,
      company,
      email,
      group,
      notes,
      tags: tags || [],
      phoneNumberId: currentPhoneNumberId,
    }, userId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        existingContact: result.existingContact,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.contact,
      message: 'Kişi başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('WhatsApp contacts POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Kişi ID gerekli',
      }, { status: 400 });
    }

    const result = await updateContact(id, updateData);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kişi başarıyla güncellendi',
    });
  } catch (error) {
    console.error('WhatsApp contacts PATCH error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');

    if (!contactId) {
      return NextResponse.json({
        success: false,
        error: 'Kişi ID gerekli',
      }, { status: 400 });
    }

    const result = await deleteContact(contactId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kişi başarıyla silindi',
    });
  } catch (error) {
    console.error('WhatsApp contacts DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// Helper function
function getGroupLabel(group) {
  const labels = {
    customer: 'Müşteri',
    lead: 'Potansiyel',
    supplier: 'Tedarikçi',
    partner: 'İş Ortağı',
    other: 'Diğer',
  };
  return labels[group] || group;
}
