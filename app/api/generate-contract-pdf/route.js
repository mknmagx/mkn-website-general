import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";
import admin from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const { contract, companyData } = await request.json();

    if (!contract) {
      return NextResponse.json(
        { error: "Sözleşme verisi gereklidir" },
        { status: 400 }
      );
    }

    // Logo'yu base64 olarak yükle
    let logoBase64 = "";
    try {
      const logoPath = path.join(process.cwd(), "public", "MKN-GROUP-LOGO.png");
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (error) {
      console.warn("Logo yüklenemedi:", error);
    }

    // Tonguç imza kaşesini yükle (aktif veya tamamlandı durumlar için)
    let tongucSignatureBase64 = "";
    if (contract.status === "active" || contract.status === "completed") {
      try {
        if (admin.apps && admin.apps.length > 0) {
          console.log("🔍 Firebase Admin SDK aktif, storage'a bağlanılıyor...");
          
          // Firebase Admin Storage kullanarak güvenli erişim
          const bucket = admin.storage().bucket("mkngroup-general.firebasestorage.app");
          console.log("🔍 Bucket bağlantısı başarılı:", bucket.name);
          
          const file = bucket.file("private/TONGZİ BERTUG KAŞE İMZA_A1.png");
          console.log("🔍 Dosya yolu belirlendi, indiriliyor...");

          // Dosyayı indir
          const [fileBuffer] = await file.download();
          
          // Resmi optimize et - Sharp kullanarak boyutu küçült
          const sharp = require('sharp');
          const optimizedBuffer = await sharp(fileBuffer)
            .resize(600, null, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .png({ 
              quality: 85,
              compressionLevel: 9 
            })
            .toBuffer();
          
          tongucSignatureBase64 = `data:image/png;base64,${optimizedBuffer.toString("base64")}`;
          
          console.log("✅ Tonguç Bertuğ imza kaşesi başarıyla yüklendi ve optimize edildi");
          console.log("   Orijinal boyut:", fileBuffer.length, "bytes");
          console.log("   Optimize boyut:", optimizedBuffer.length, "bytes");
        } else {
          console.warn("⚠️ Firebase Admin SDK başlatılmamış");
        }
      } catch (error) {
        console.error("⚠️ Tonguç Bertuğ imza kaşesi yüklenemedi:", {
          message: error.message,
          code: error.code,
          details: error.details,
          stack: error.stack
        });
      }
    }

    // Ek dosyaları base64'e çevir (varsa)
    const attachmentsData = [];
    if (contract.attachments && contract.attachments.length > 0) {
      for (const attachment of contract.attachments) {
        try {
          // URL'den dosyayı indir
          const response = await axios.get(attachment.url, {
            responseType: "arraybuffer",
          });
          const base64 = Buffer.from(response.data).toString("base64");

          attachmentsData.push({
            name: attachment.name,
            type: attachment.type,
            base64: base64,
            dataUri: attachment.type.startsWith("image/")
              ? `data:${attachment.type};base64,${base64}`
              : null,
          });
        } catch (error) {
          console.warn(
            `Attachment ${attachment.name} yüklenemedi:`,
            error.message
          );
        }
      }
    }

    // PDF HTML template'ini oluştur
    const htmlContent = generateContractPDFHTML(
      contract,
      companyData,
      logoBase64,
      attachmentsData,
      tongucSignatureBase64
    );

    // HTML2PDF API ile PDF oluştur
    try {
      const apiKey = process.env.HTML2PDF_API_KEY;

      if (!apiKey) {
        throw new Error("HTML2PDF API key not found in environment variables");
      }

      const response = await axios.post(
        "https://api.html2pdf.app/v1/generate",
        {
          html: htmlContent,
          apiKey: apiKey,
          options: {
            format: "A4",
            printBackground: true,
            margin: {
              top: "20px",
              right: "25px",
              bottom: "20px",
              left: "25px",
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true,
          },
        },
        {
          responseType: "arraybuffer",
        }
      );

      if (response.status !== 200) {
        console.error("HTML2PDF API error:", response.data);
        throw new Error(`HTML2PDF API failed: ${response.status}`);
      }

      const pdfBuffer = response.data;

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="sozlesme-${
            contract.contractNumber || "draft"
          }.pdf"`,
        },
      });
    } catch (pdfError) {
      console.error("HTML2PDF generation error:", pdfError);

      if (axios.isAxiosError(pdfError)) {
        console.error("Axios error details:", {
          status: pdfError.response?.status,
          statusText: pdfError.response?.statusText,
          data: pdfError.response?.data,
        });
      }

      throw pdfError;
    }
  } catch (error) {
    console.error("Sözleşme PDF oluşturma hatası:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        error: "PDF oluşturulurken bir hata oluştu",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function generateContractPDFHTML(
  contract,
  companyData = {},
  logoBase64 = "",
  attachmentsData = [],
  tongucSignatureBase64 = ""
) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Belirtilmedi";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentDate = new Date().toLocaleDateString("tr-TR");

  // Sözleşme içeriğini değişkenleri doldurarak hazırla
  let contractContent = contract.content || "";

  // Conditional sections işle ({{field_name}} ... {{/field_name}} formatı) - ÖNCE BU
  const conditionalRegex = /\{\{(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  contractContent = contractContent.replace(conditionalRegex, (match, fieldName, content) => {
    // Field değerini kontrol et
    const fieldValue = contract.fields?.[fieldName];
    // Eğer field true, "true", 1 veya boş olmayan bir değerse içeriği göster
    if (fieldValue === true || fieldValue === 'true' || fieldValue === 1 || (fieldValue && fieldValue !== 'false' && fieldValue !== '0')) {
      return content;
    }
    // Aksi halde içeriği kaldır
    return '';
  });

  // Müşteri bilgilerini doldur
  const replacements = {
    "{{musteri_firma}}": contract.companyInfo?.companyName || "[Firma Adı]",
    "{{musteri_adres}}": contract.companyInfo?.address || "[Adres]",
    "{{musteri_yetkili}}": contract.companyInfo?.contactPerson || "[Yetkili]",
    "{{musteri_telefon}}": contract.companyInfo?.phone || "[Telefon]",
    "{{musteri_email}}": contract.companyInfo?.email || "[E-posta]",
    "{{musteri_vergi_dairesi}}":
      contract.companyInfo?.taxOffice || "[Vergi Dairesi]",
    "{{musteri_vergi_no}}": contract.companyInfo?.taxNumber || "[Vergi No]",
  };

  // Form field verilerini doldur
  if (contract.fields) {
    Object.keys(contract.fields).forEach((key) => {
      replacements[`{{${key}}}`] = contract.fields[key] || `[${key}]`;
    });
  }

  // Tüm değişkenleri değiştir
  Object.keys(replacements).forEach((placeholder) => {
    contractContent = contractContent
      .split(placeholder)
      .join(replacements[placeholder]);
  });

  // İmza bölümünü işle
  const signatureRegex =
    /\[SIGNATURE_SECTION\]([\s\S]*?)\[\/SIGNATURE_SECTION\]/g;
  contractContent = contractContent.replace(
    signatureRegex,
    (match, content) => {
      // MKN GROUP bilgileri
      const mknCompanyName = contract.mknGroupInfo?.companyName || "MKNGROUP (TONGZİ BERTUG MULTİNATİONAL MEDİKAL ÜRÜNLER OTOMOTİV SANAYİ VE DIŞ TİCARET LİMİTED ŞİRKETİ)";
      const mknAuthorizedPerson = contract.mknGroupInfo?.contactPerson || "Mahammad Nadirov";
      const mknTitle = contract.mknGroupInfo?.contactPosition || "Firma Sahibi";

      // Müşteri bilgileri
      const customerCompanyName = contract.companyInfo?.companyName || contract.fields?.musteri_firma || "MÜŞTERİ FİRMASI";
      const customerAuthorizedPerson = contract.companyInfo?.contactPerson || contract.fields?.musteri_yetkili || "";
      const customerTitle = contract.companyInfo?.contactPosition || contract.fields?.musteri_pozisyon || "Şirket Sahibi";

      return `
<div class="signature-section">
  <div class="signature-box signature-left">
    <div class="signature-header">${mknCompanyName}</div>
    <div class="signature-space ${tongucSignatureBase64 ? 'has-signature' : ''}">
      ${tongucSignatureBase64 ? `<img src="${tongucSignatureBase64}" alt="Tonguç Bertuğ İmza Kaşe" class="signature-stamp" />` : ''}
    </div>
    <div class="signature-info">
      <div class="signature-name">${mknAuthorizedPerson}</div>
      <div class="signature-title">${mknTitle}</div>
    </div>
  </div>
  <div class="signature-box signature-right">
    <div class="signature-header">${customerCompanyName}</div>
    <div class="signature-space"></div>
    <div class="signature-info">
      <div class="signature-name">${customerAuthorizedPerson}</div>
      <div class="signature-title">${customerTitle}</div>
    </div>
  </div>
</div>
`;
    }
  );

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sözleşme - ${contract.contractNumber || "DRAFT"}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #000;
          background: white;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #0066cc;
        }
        
        .company-info {
          flex: 1;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }
        
        .company-name {
          font-size: 22pt;
          font-weight: bold;
          color: #0066cc;
          font-family: Arial, sans-serif;
        }
        
        .company-details {
          font-size: 9pt;
          color: #333;
          line-height: 1.4;
          font-family: Arial, sans-serif;
        }
        
        .contract-info {
          text-align: right;
          font-family: Arial, sans-serif;
        }
        
        .contract-number {
          font-size: 14pt;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 5px;
        }
        
        .contract-date {
          font-size: 9pt;
          color: #666;
        }
        
        .contract-title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          color: #000;
          margin: 30px 0;
          text-transform: uppercase;
          text-decoration: underline;
        }
        
        .contract-content {
          text-align: justify;
          white-space: pre-wrap;
          margin-bottom: 40px;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 80px;
          padding-top: 40px;
        }
        
        .signature-box {
          width: 45%;
        }
        
        .signature-left {
          text-align: left;
        }
        
        .signature-right {
          text-align: right;
        }
        
        .signature-header {
          font-weight: 600;
          font-size: 10pt;
          margin-bottom: 15px;
          text-transform: uppercase;
          color: #333;
          letter-spacing: 0.3px;
        }
        
        .signature-space {
          height: 120px;
          border-bottom: 1px solid #333;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          position: relative;
          padding-bottom: 5px;
        }
        
        .signature-space.has-signature {
          border-bottom: 1px solid #333;
        }
        
        .signature-stamp {
          max-width: 280px;
          max-height: 110px;
          width: auto;
          height: auto;
          object-fit: contain;
          position: absolute;
          bottom: -5px;
          left: 0;
        }
        
        .signature-info {
          margin-top: 10px;
        }
        
        .signature-name {
          font-size: 10pt;
          font-weight: 600;
          color: #000;
          margin-bottom: 3px;
        }
        
        .signature-title {
          font-size: 9pt;
          color: #666;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 8pt;
          color: #666;
          border-top: 1px solid #e0e0e0;
          padding-top: 15px;
          font-family: Arial, sans-serif;
        }
        
        @page {
          size: A4;
          margin: 20mm;
        }
        
        @media print {
          body {
            font-size: 10pt;
          }
          .container {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div class="logo-section">
              ${
                logoBase64
                  ? `<img src="${logoBase64}" alt="MKN GROUP" style="height: 40px; width: auto;" />`
                  : `<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #0066cc 0%, #0080ff 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">MKN</div>`
              }
              <div>
                <div class="company-name">${
                  companyData.companyName || "MKN GROUP"
                }</div>
              </div>
            </div>
            <div class="company-details">
              <div>Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul, Türkiye</div>
              <div>Tel: +90 531 494 25 94 • E-posta: info@mkngroup.com.tr</div>
              <div>Web: www.mkngroup.com.tr</div>
            </div>
          </div>
          <div class="contract-info">
            <div class="contract-number">Sözleşme No: ${
              contract.contractNumber || "DRAFT"
            }</div>
            <div class="contract-date">Tarih: ${
              formatDate(contract.createdAt) || currentDate
            }</div>
            <div class="contract-date">Durum: ${getStatusLabel(
              contract.status
            )}</div>
          </div>
        </div>

        <!-- Contract Title -->
        <div class="contract-title">
          ${contract.title || "HİZMET SÖZLEŞMESİ"}
        </div>

        <!-- Contract Content -->
        <div class="contract-content">
${contractContent}
        </div>

        <!-- Attachments Section -->
        ${
          attachmentsData.length > 0
            ? `
        <div style="page-break-before: always; margin-top: 40px;">
          <h2 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 30px; color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
            EKLİ BELGELER
          </h2>
          ${attachmentsData
            .map(
              (attachment, index) => `
            <div style="margin-bottom: 40px; page-break-inside: avoid;">
              <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 15px; color: #333;">
                ${index + 1}. ${attachment.name}
              </h3>
              ${
                attachment.dataUri
                  ? `
                <div style="text-align: center; border: 1px solid #ddd; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                  <img src="${attachment.dataUri}" style="max-width: 100%; height: auto; max-height: 800px; border-radius: 4px;" alt="${attachment.name}" />
                </div>
              `
                  : `
                <div style="text-align: center; border: 1px solid #ddd; padding: 40px; background: #f9f9f9; border-radius: 8px;">
                  <p style="font-size: 11pt; color: #666; margin: 0;">
                    📄 ${attachment.name}
                  </p>
                  <p style="font-size: 9pt; color: #999; margin-top: 10px;">
                    Bu dosya tipi PDF içinde gösterilemiyor. Orjinal dosyaya sözleşme kaydından erişebilirsiniz.
                  </p>
                </div>
              `
              }
            </div>
          `
            )
            .join("")}
        </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
          <div>Bu sözleşme ${currentDate} tarihinde otomatik olarak oluşturulmuştur.</div>
          <div style="margin-top: 5px;">${
            companyData.companyName || "MKN GROUP"
          } - Sözleşme Yönetim Sistemi</div>
          ${
            attachmentsData.length > 0
              ? `<div style="margin-top: 5px; font-size: 7pt;">Ek Belge Sayısı: ${attachmentsData.length}</div>`
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;
}

function getStatusLabel(status) {
  const statusMap = {
    draft: "Taslak",
    active: "Aktif",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
  };
  return statusMap[status] || status;
}
