import { NextResponse } from "next/server";
import { uploadCaseFile } from "../../../../lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const caseId = formData.get("caseId");

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    if (!caseId) {
      return NextResponse.json(
        { error: "Case ID bulunamadı" },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (500MB - client-side'da CRM ayarlarındaki limit kontrol edilir)
    // Bu sadece güvenlik için bir üst sınırdır
    const MAX_SERVER_LIMIT_MB = 500;
    if (file.size > MAX_SERVER_LIMIT_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Dosya boyutu ${MAX_SERVER_LIMIT_MB}MB'dan büyük olamaz` },
        { status: 400 }
      );
    }

    // Cloudinary'ye yükle
    const result = await uploadCaseFile(file, caseId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Case file upload error:", error);
    return NextResponse.json(
      { error: error.message || "Dosya yüklenemedi" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
