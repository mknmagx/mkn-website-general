import { NextResponse } from "next/server";
import { shopifyService } from "../../../../../lib/services/shopify-integration";
import { withAuth } from "../../../../../lib/services/api-auth-middleware";
import logger from "../../../../../lib/utils/logger";

// GET - Tüm Shopify entegrasyonlarını getir
export const GET = withAuth(async (request) => {
  try {
    const { adminFirestore } = await import(
      "../../../../../lib/firebase-admin"
    );

    if (!adminFirestore) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    let integrations;
    if (companyId) {
      integrations = await shopifyService.getCompanyIntegrations(companyId);
    } else {
      integrations = await shopifyService.getAllIntegrations();
    }

    return NextResponse.json({ integrations });
  } catch (error) {
    logger.error("Error fetching integrations:", error.message);

    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
});

// POST - Yeni Shopify entegrasyonu oluştur
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const {
      companyId,
      companyInfo,
      credentials,
      settings,
      fulfillmentSettings,
    } = body;

    // Validasyon
    if (!credentials?.shopDomain || !credentials?.accessToken) {
      return NextResponse.json(
        { error: "Shop domain ve access token gerekli" },
        { status: 400 }
      );
    }

    // Shop domain format kontrolü
    const shopDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]*$/;
    let cleanDomain = credentials.shopDomain.replace(".myshopify.com", "");

    if (!shopDomainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { error: "Geçersiz shop domain formatı" },
        { status: 400 }
      );
    }

    // Access token format kontrolü (Shopify private app token format)
    if (
      !credentials.accessToken.startsWith("shppa_") &&
      !credentials.accessToken.startsWith("shpat_")
    ) {
      return NextResponse.json(
        { error: "Geçersiz access token formatı" },
        { status: 400 }
      );
    }

    // Company oluşturma veya kullanma
    let finalCompanyId = companyId;
    if (!companyId && companyInfo) {
      finalCompanyId = await createCompany(companyInfo);
    }

    if (!finalCompanyId) {
      return NextResponse.json(
        { error: "Company bilgisi gerekli" },
        { status: 400 }
      );
    }

    // Entegrasyon oluştur
    const integration = await shopifyService.createIntegration(
      finalCompanyId,
      credentials,
      settings,
      "admin-user-id"
    );

    return NextResponse.json(
      {
        message: "Entegrasyon başarıyla oluşturuldu",
        integration,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Integration creation error:", error.message);

    if (error.message.includes("Shopify API hatası")) {
      return NextResponse.json(
        { error: "Shopify bağlantısı kurulamadı" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Entegrasyon oluşturulamadı" },
      { status: 500 }
    );
  }
});

// Helper function - Company oluştur
async function createCompany(companyInfo) {
  try {
    // Firebase Admin SDK kullanarak company kaydı oluştur
    const { adminFirestore } = await import(
      "../../../../../lib/firebase-admin"
    );

    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not configured");
    }

    const companyData = {
      name: companyInfo.companyName, // Mevcut companies yapısına uygun
      email: companyInfo.contactEmail, // Mevcut companies yapısına uygun
      phone: companyInfo.contactPhone || "",
      contactPerson: companyInfo.contactPerson || "",
      businessLine: companyInfo.businessLine || "",
      description: "",
      website: "",
      status: "active", // Varsayılan status
      priority: "medium", // Varsayılan priority
      totalProjects: 0,
      totalRevenue: 0,
      employees: "",
      foundedYear: "",
      lastContact: null,
      notes: [],
      reminders: [],
      documents: [],
      socialMedia: {
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
      },
      contractDetails: {
        contractStart: "",
        contractEnd: "",
        contractValue: "",
        paymentTerms: "",
        deliveryTerms: "",
      },
      projectDetails: {
        projectDescription: "",
        productType: "",
        packagingType: "",
        monthlyVolume: "",
        unitPrice: "",
        expectedMonthlyValue: "",
        specifications: "",
        deliverySchedule: "",
      },
      // Address bilgilerini string olarak birleştir
      address: companyInfo.address
        ? [
            companyInfo.address.street,
            companyInfo.address.city,
            companyInfo.address.state,
            companyInfo.address.zipCode,
            companyInfo.address.country,
          ]
            .filter(Boolean)
            .join(", ")
        : "",
      integrations: [], // Yeni alan
      fulfillmentSettings: {
        // Yeni alan
        defaultWarehouse: "",
        shippingMethods: [],
        customFields: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminFirestore
      .collection("companies")
      .add(companyData);
    return docRef.id;
  } catch (error) {
    logger.error("Company oluşturulurken hata:", error.message);
    throw error;
  }
}
