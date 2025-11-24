import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { calculation, options = {} } = await request.json();
    const { showCostDetails = true, companyData = null } = options;

    if (!calculation) {
      return NextResponse.json(
        { error: "Hesaplama verisi gerekli" },
        { status: 400 }
      );
    }

    // Modern, minimalist PDF HTML template
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maliyet Hesaplama - ${calculation.productName || "Ürün"}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header-left h1 {
      font-size: 28pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .header-left p {
      font-size: 11pt;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .header-right {
      text-align: right;
    }
    
    .company-info h2 {
      font-size: 16pt;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 6px;
    }
    
    .company-info p {
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 3px;
    }
    
    /* Product Info Section */
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-icon {
      width: 20px;
      height: 20px;
      display: inline-block;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 9pt;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 12pt;
      color: #1f2937;
      font-weight: 600;
    }
    
    /* Pricing Cards */
    .pricing-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .pricing-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid #2563eb;
    }
    
    .pricing-card.highlight {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-left-color: #10b981;
    }
    
    .card-label {
      font-size: 10pt;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .card-value {
      font-size: 24pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 6px;
    }
    
    .card-value.success {
      color: #059669;
    }
    
    .card-subtitle {
      font-size: 9pt;
      color: #6b7280;
    }
    
    /* Table Styles */
    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 20px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .data-table thead {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
    }
    
    .data-table thead th {
      color: white;
      font-weight: 600;
      font-size: 10pt;
      text-align: left;
      padding: 12px 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    .data-table tbody tr:last-child {
      border-bottom: none;
    }
    
    .data-table tbody tr:hover {
      background: #f9fafb;
    }
    
    .data-table tbody td {
      padding: 12px 15px;
      font-size: 10pt;
      color: #374151;
    }
    
    .data-table tbody td:last-child {
      text-align: right;
      font-weight: 600;
      color: #1f2937;
    }
    
    /* Cost Summary */
    .cost-summary {
      background: #f9fafb;
      border-radius: 12px;
      padding: 25px;
      margin-top: 20px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-row:last-child {
      border-bottom: none;
      padding-top: 15px;
      margin-top: 10px;
      border-top: 2px solid #2563eb;
    }
    
    .summary-label {
      font-size: 11pt;
      color: #6b7280;
      font-weight: 500;
    }
    
    .summary-value {
      font-size: 11pt;
      color: #1f2937;
      font-weight: 600;
    }
    
    .summary-row:last-child .summary-label {
      font-size: 13pt;
      color: #1f2937;
      font-weight: 700;
    }
    
    .summary-row:last-child .summary-value {
      font-size: 16pt;
      color: #2563eb;
      font-weight: 700;
    }
    
    .summary-row.profit .summary-label {
      color: #059669;
    }
    
    .summary-row.profit .summary-value {
      color: #059669;
    }
    
    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 9pt;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      .pricing-card {
        break-inside: avoid;
      }
      .section {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>Maliyet Hesaplama</h1>
        <p><strong>Ürün:</strong> ${calculation.productName || "Belirtilmemiş"}</p>
        <p><strong>Tarih:</strong> ${new Date(calculation.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p>
        ${calculation.productType ? `<p><strong>Kategori:</strong> ${calculation.productType}</p>` : ""}
      </div>
      
      ${
        companyData
          ? `
      <div class="header-right company-info">
        <h2>${companyData.name || ""}</h2>
        ${companyData.contactPerson ? `<p><strong>Yetkili:</strong> ${companyData.contactPerson}</p>` : ""}
        ${companyData.email ? `<p><strong>E-posta:</strong> ${companyData.email}</p>` : ""}
        ${companyData.phone ? `<p><strong>Telefon:</strong> ${companyData.phone}</p>` : ""}
      </div>
      `
          : ""
      }
    </div>

    <!-- Product Details -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon">📦</span>
        Ürün Bilgileri
      </div>
      <div class="product-grid">
        <div class="info-item">
          <div class="info-label">Üretim Miktarı</div>
          <div class="info-value">${calculation.quantity || 0} adet</div>
        </div>
        ${
          calculation.productVolume
            ? `
        <div class="info-item">
          <div class="info-label">Ürün Hacmi</div>
          <div class="info-value">${calculation.productVolume} ml</div>
        </div>
        `
            : ""
        }
        ${
          calculation.description
            ? `
        <div class="info-item" style="grid-column: 1 / -1;">
          <div class="info-label">Açıklama</div>
          <div class="info-value" style="font-weight: 400; font-size: 10pt;">${calculation.description}</div>
        </div>
        `
            : ""
        }
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="pricing-cards">
      <div class="pricing-card">
        <div class="card-label">Birim Satış Fiyatı</div>
        <div class="card-value">₺${(calculation.calculations?.unitPrice || 0).toFixed(2)}</div>
        <div class="card-subtitle">Adet başına</div>
      </div>
      
      <div class="pricing-card highlight">
        <div class="card-label">Toplam Satış Fiyatı</div>
        <div class="card-value success">₺${(calculation.calculations?.totalPrice || 0).toFixed(2)}</div>
        <div class="card-subtitle">${calculation.quantity} adet için</div>
      </div>
    </div>

    ${
      showCostDetails
        ? `
    <!-- Cost Details -->
    ${
      calculation.formData?.ingredients?.filter((i) => i.name).length > 0
        ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon">🧪</span>
        Hammaddeler
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Hammadde</th>
            <th>Miktar</th>
            <th>Birim Fiyat</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${calculation.formData.ingredients
            .filter((i) => i.name)
            .map((ing) => {
              const amount = parseFloat(ing.amount) || 0;
              const price = parseFloat(ing.price) || 0;
              const unit = ing.unit || "gram";
              const kg =
                unit === "gram"
                  ? amount / 1000
                  : unit === "kg"
                  ? amount
                  : amount / 1000;
              const total = (kg * price).toFixed(2);
              return `
            <tr>
              <td>${ing.name}${ing.function ? ` <span style="color: #6b7280; font-size: 9pt;">(${ing.function})</span>` : ""}</td>
              <td>${amount} ${unit}</td>
              <td>₺${price.toFixed(2)}/kg</td>
              <td>₺${total}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      calculation.formData?.packaging?.filter((p) => p.type).length > 0
        ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon">📦</span>
        Ambalaj Malzemeleri
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Ambalaj Tipi</th>
            <th>Malzeme</th>
            <th>Miktar</th>
            <th>Fiyat</th>
          </tr>
        </thead>
        <tbody>
          ${calculation.formData.packaging
            .filter((p) => p.type)
            .map((pkg) => {
              const total = (
                (parseFloat(pkg.quantity) || 0) * (parseFloat(pkg.price) || 0)
              ).toFixed(2);
              return `
            <tr>
              <td>${pkg.type}</td>
              <td>${pkg.material || "-"}</td>
              <td>${pkg.quantity} ${pkg.unit}</td>
              <td>₺${total}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      calculation.formData?.boxType || calculation.formData?.labelType
        ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon">🏷️</span>
        Kutu ve Etiket
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Tip</th>
            <th>Açıklama</th>
            <th>Miktar</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${
            calculation.formData.boxType
              ? `
          <tr>
            <td>Kutu</td>
            <td>${calculation.formData.boxType}</td>
            <td>${calculation.formData.boxQuantity} adet</td>
            <td>₺${((parseFloat(calculation.formData.boxQuantity) || 0) * (parseFloat(calculation.formData.boxPrice) || 0)).toFixed(2)}</td>
          </tr>
          `
              : ""
          }
          ${
            calculation.formData.labelType
              ? `
          <tr>
            <td>Etiket</td>
            <td>${calculation.formData.labelType}</td>
            <td>${calculation.formData.labelQuantity} adet</td>
            <td>₺${((parseFloat(calculation.formData.labelQuantity) || 0) * (parseFloat(calculation.formData.labelPrice) || 0)).toFixed(2)}</td>
          </tr>
          `
              : ""
          }
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      calculation.formData?.otherCosts?.filter((c) => c.description).length > 0
        ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon">💰</span>
        Diğer Masraflar
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Açıklama</th>
            <th>Kategori</th>
            <th>Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${calculation.formData.otherCosts
            .filter((c) => c.description)
            .map(
              (cost) => `
            <tr>
              <td>${cost.description}</td>
              <td style="text-transform: capitalize;">${cost.category || "genel"}</td>
              <td>₺${parseFloat(cost.amount || 0).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    <!-- Cost Summary -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon">📊</span>
        Maliyet Özeti
      </div>
      <div class="cost-summary">
        <div class="summary-row">
          <div class="summary-label">Birim Maliyet:</div>
          <div class="summary-value">₺${(calculation.calculations?.totalCostPerUnit || 0).toFixed(2)}</div>
        </div>
        <div class="summary-row profit">
          <div class="summary-label">Birim Kar:</div>
          <div class="summary-value">+₺${(calculation.calculations?.profitPerUnit || 0).toFixed(2)}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Birim Satış Fiyatı:</div>
          <div class="summary-value">₺${(calculation.calculations?.unitPrice || 0).toFixed(2)}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Toplam Satış Fiyatı (${calculation.quantity} adet):</div>
          <div class="summary-value">₺${(calculation.calculations?.totalPrice || 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
    `
        : ""
    }

    ${
      calculation.formData?.notes
        ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon">📝</span>
        Notlar
      </div>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; white-space: pre-line; font-size: 10pt; color: #374151;">
        ${calculation.formData.notes}
      </div>
    </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      <p>Bu belge ${new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} tarihinde oluşturulmuştur.</p>
      <p>MKN Group - Profesyonel Maliyet Hesaplama Sistemi</p>
    </div>
  </div>
</body>
</html>
    `;

    // HTML2PDF API'sine istek gönder
    const html2pdfResponse = await fetch("https://api.html2pdf.app/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: html,
        apiKey: process.env.HTML2PDF_API_KEY || "demo",
        options: {
          format: "A4",
          printBackground: true,
          margin: {
            top: "10mm",
            right: "10mm",
            bottom: "10mm",
            left: "10mm",
          },
        },
      }),
    });

    if (!html2pdfResponse.ok) {
      throw new Error(`HTML2PDF API error: ${html2pdfResponse.status}`);
    }

    const pdfBuffer = await html2pdfResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="maliyet-hesaplama-${calculation.productName?.replace(/[^a-z0-9]/gi, "_") || "urun"}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "PDF oluşturulurken bir hata oluştu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
