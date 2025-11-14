import { NextResponse } from "next/server";
import { adminFirestore } from "../../../../../../lib/firebase-admin";
import { withAuth } from "../../../../../../lib/services/api-auth-middleware";

// GET - Entegrasyon istatistiklerini getir
export const GET = withAuth(async (request) => {
  try {
    // Firebase Admin SDK kontrolü
    if (!adminFirestore) {
      return NextResponse.json(
        { error: "Firebase Admin SDK yapılandırılmamış" },
        { status: 500 }
      );
    }

    // Toplam entegrasyon sayısı
    const integrationsSnapshot = await adminFirestore
      .collection("integrations")
      .where("platform", "==", "shopify")
      .get();
    const totalIntegrations = integrationsSnapshot.size;

    // Aktif entegrasyon sayısı
    const activeIntegrationsSnapshot = await adminFirestore
      .collection("integrations")
      .where("platform", "==", "shopify")
      .where("status", "==", "active")
      .get();
    const activeIntegrations = activeIntegrationsSnapshot.size;

    // Toplam sipariş sayısı (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersSnapshot = await adminFirestore
      .collection("shopify_orders")
      .where("createdAt", ">=", thirtyDaysAgo)
      .get();
    const totalOrders = ordersSnapshot.size;

    // Toplam company sayısı (entegrasyonu olan)
    const companiesSnapshot = await adminFirestore
      .collection("companies")
      .get();

    let totalCustomers = 0;
    companiesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.integrations && data.integrations.length > 0) {
        totalCustomers++;
      }
    });

    const stats = {
      totalIntegrations,
      activeIntegrations,
      totalOrders,
      totalCustomers,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: "İstatistikler getirilemedi", details: error.message },
      { status: 500 }
    );
  }
});
