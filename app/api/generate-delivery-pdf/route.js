import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { delivery, companyData } = await request.json();

    if (!delivery) {
      return NextResponse.json(
        { error: 'Teslimat verisi gereklidir' },
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
      console.warn("Logo yüklenemedi, placeholder kullanılacak:", error);
    }

    // PDF HTML template'ini oluştur
    const htmlContent = generateDeliveryPDFHTML(delivery, companyData, logoBase64);

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
              right: "20px",
              bottom: "20px",
              left: "20px",
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

      // PDF'i başarılı şekilde döndür
      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="teslimat-notu-${
            delivery.deliveryNumber || "draft"
          }.pdf"`,
        },
      });
    } catch (pdfError) {
      console.error("HTML2PDF generation error:", pdfError);

      // Axios error handling
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
    console.error("PDF oluşturma hatası - Detaylı:", {
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

function generateDeliveryPDFHTML(delivery, companyData = {}, logoBase64 = "") {
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

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Bekliyor",
      shipped: "Kargo Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
    };
    return statusMap[status] || "Bilinmiyor";
  };

  const getDeliveryTypeLabel = (type) => {
    const typeMap = {
      inbound: "GİRİŞ İRSALİYESİ",
      outbound: "ÇIKIŞ İRSALİYESİ",
    };
    return typeMap[type] || "İRSALİYE";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      prepared: "Hazırlandı",
      in_transit: "Yolda", 
      delivered: "Teslim Edildi",
      returned: "İade",
      cancelled: "İptal",
    };
    return statusMap[status] || status;
  };

  const currentDate = new Date().toLocaleDateString("tr-TR");
  const deliveryDate = delivery.createdAt
    ? new Date(delivery.createdAt.seconds * 1000).toLocaleDateString("tr-TR")
    : currentDate;

  // Calculate totals from items
  const totalItems = delivery.items ? delivery.items.length : 0;
  const totalQuantity = delivery.items
    ? delivery.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
    : 0;

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>İrsaliye - ${delivery.deliveryNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 20px;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 5px;
        }
        
        .delivery-info {
          text-align: right;
          flex: 1;
        }
        
        .delivery-title {
          font-size: 20px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 10px;
        }
        
        .delivery-number {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .delivery-date {
          font-size: 12px;
          color: #666;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-box {
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .info-label {
          font-weight: bold;
          color: #555;
          margin-bottom: 5px;
        }
        
        .info-value {
          color: #333;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .items-table th {
          background-color: #f5f5f5;
          font-weight: bold;
          color: #555;
        }
        
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .summary-box {
          background-color: #e8f4fd;
          border: 1px solid #0066cc;
          border-radius: 5px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .summary-label {
          font-weight: bold;
          color: #0066cc;
        }
        
        .summary-value {
          font-weight: bold;
          color: #0066cc;
        }
        
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          background-color: #e8f4fd;
          color: #0066cc;
          border: 1px solid #0066cc;
        }
        
        .notes-section {
          background-color: #fff9e6;
          border: 1px solid #ffcc00;
          border-radius: 5px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #e0e0e0;
          padding-top: 15px;
        }
        
        @media print {
          body {
            font-size: 11px;
          }
          .container {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              ${
                logoBase64
                  ? `<img src="${logoBase64}" alt="MKN GROUP" style="height: 32px; width: auto;" />`
                  : `<div style="width: 32px; height: 32px; background: linear-gradient(135deg, #0066cc 0%, #0080ff 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">MKN</div>`
              }
              <div style="flex: 1;">
                <div class="company-name">${
                  companyData.companyName || "MKN GROUP"
                }</div>
                <div style="font-size: 11px; color: #666; font-weight: 500; margin-bottom: 8px;">
                  Ambalaj ve Kozmetik Çözümleri
                </div>
                <div style="font-size: 11px; color: #666; line-height: 1.4; font-weight: 500;">
                  <div>Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul</div>
                  <div>+90 531 494 25 94 • info@mkngroup.com.tr • www.mkngroup.com.tr</div>
                </div>
              </div>
            </div>
          </div>
          <div class="delivery-info">
            <div class="delivery-title">${getDeliveryTypeLabel(
              delivery.type
            )}</div>
            <div class="delivery-number">İrsaliye No: ${
              delivery.deliveryNumber || "DRAFT"
            }</div>
            <div class="delivery-date">Tarih: ${deliveryDate}</div>
            <div style="margin-top: 10px;">
              <span class="status-badge">Durum: ${getStatusLabel(
                delivery.status
              )}</span>
            </div>
          </div>
        </div>

        <!-- Company and Delivery Information -->
        <div class="info-grid">
          <div class="info-box">
            <div class="section-title">Firma Bilgileri</div>
            <div class="info-label">Firma Adı:</div>
            <div class="info-value">${
              delivery.companyInfo?.companyName || "-"
            }</div>
            <br>
            <div class="info-label">İletişim Kişisi:</div>
            <div class="info-value">${
              delivery.companyInfo?.contactPerson || "-"
            }</div>
            <br>
            <div class="info-label">Telefon:</div>
            <div class="info-value">${delivery.companyInfo?.phone || "-"}</div>
            ${
              delivery.companyInfo?.email
                ? `
              <br>
              <div class="info-label">E-posta:</div>
              <div class="info-value">${delivery.companyInfo.email}</div>
            `
                : ""
            }
          </div>

          <div class="info-box">
            <div class="section-title">Teslimat Adresi</div>
            <div class="info-value">
              ${delivery.deliveryAddress?.address || "-"}<br>
              ${delivery.deliveryAddress?.district || ""} ${
    delivery.deliveryAddress?.city || ""
  }<br>
              ${delivery.deliveryAddress?.postalCode || ""}
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="section">
          <div class="section-title">Ürün Detayları</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">Ürün Adı</th>
                <th style="width: 15%;">Ürün Kodu</th>
                <th style="width: 10%;">Miktar</th>
                <th style="width: 8%;">Birim</th>
                <th style="width: 37%;">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              ${
                delivery.items
                  ?.map(
                    (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName || "-"}</td>
                  <td>${item.productCode || "-"}</td>
                  <td style="text-align: right;">${item.quantity || 0}</td>
                  <td>${item.unit || "-"}</td>
                  <td>${item.description || "-"}</td>
                </tr>
              `
                  )
                  .join("") ||
                '<tr><td colspan="6" style="text-align: center;">Ürün bulunamadı</td></tr>'
              }
            </tbody>
          </table>

          <!-- Summary -->
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">Toplam Ürün Çeşidi:</span>
              <span class="summary-value">${totalItems}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Toplam Miktar:</span>
              <span class="summary-value">${totalQuantity}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        ${
          delivery.notes
            ? `
          <div class="notes-section">
            <div class="section-title">Notlar</div>
            <div>${delivery.notes.replace(/\n/g, "<br>")}</div>
          </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
          <div>Bu belge ${currentDate} tarihinde otomatik olarak oluşturulmuştur.</div>
          <div style="margin-top: 5px;">${
            companyData.companyName || "MKN GROUP"
          } - İrsaliye Sistemi</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
