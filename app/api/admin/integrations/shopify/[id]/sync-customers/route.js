import { NextRequest, NextResponse } from "next/server";
import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";

export const POST = withAuth(async (request, { params }) => {
  try {
    // Next.js 15 requires awaiting params
    const resolvedParams = await params;
    const { id } = resolvedParams;
    if (!id) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting customer sync for integration: ${id}`);

    // Sync customers
    const result = await shopifyService.syncCustomers(id);

    console.log(`✅ Customer sync completed for integration: ${id}`, result);

    return NextResponse.json({
      success: true,
      message: "Customer sync completed successfully",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      `❌ Customer sync error for integration ${params.id}:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Customer sync failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});
