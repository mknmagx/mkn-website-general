import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { formula, options = {} } = await request.json();

    if (!formula) {
      return NextResponse.json(
        { error: "Formül verisi gerekli" },
        { status: 400 }
      );
    }

    // Load logo as base64
    let logoBase64 = "";
    try {
      const logoPath = path.join(process.cwd(), "public", "MKN-GROUP-LOGO.png");
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (error) {
      console.warn("Logo yüklenemedi, placeholder kullanılacak:", error);
    }

    // HTML içeriğini oluştur
    const htmlContent = generateFormulaHTML(formula, options, logoBase64);

    // PDF API'ye gönder
    const pdfResponse = await fetch("https://api.html2pdf.app/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        apiKey: process.env.HTML2PDF_API_KEY || "demo",
        options: {
          format: "A4",
          margin: {
            top: "10mm",
            right: "10mm",
            bottom: "10mm",
            left: "10mm",
          },
          printBackground: true,
          preferCSSPageSize: false,
        },
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error("PDF API error:", errorText);
      throw new Error(`PDF API hatası: ${pdfResponse.status}`);
    }

    const pdfBlob = await pdfResponse.blob();

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="formul-${
          formula.name?.replace(/[^a-z0-9]/gi, "_") || "urun"
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("Formula PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF oluşturulurken bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}

function generateFormulaHTML(formula, options = {}, logoBase64 = "") {
  const { includePricing = false, companyData = null } = options;

  const currentDate = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format number helper
  const formatNumber = (num, decimals = 2) => {
    const value = parseFloat(num) || 0;
    return value.toLocaleString("tr-TR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Adet ile seçilen bileşenleri yüzde hesaplamasından çıkar
  // Sadece gram, ml, kg gibi ağırlık/hacim birimlerini yüzde hesaplamasına dahil et
  const weightUnits = ["g", "gram", "gr", "ml", "kg", "l", "lt", "litre"];
  
  // Yüzde hesaplaması için toplam - sadece ağırlık/hacim birimlerini dahil et
  const totalForPercentage = (formula.ingredients || []).reduce((sum, ing) => {
    const unit = (ing.unit || "").toLowerCase().trim();
    const isWeightUnit = weightUnits.some(wu => unit === wu || unit.includes(wu));
    
    if (!isWeightUnit) return sum; // Adet birimleri dahil etme
    
    const amount = parseFloat(ing.amount) || 0;
    if (unit === "kg") return sum + (amount * 1000);
    return sum + amount;
  }, 0);

  // Calculate costs and statistics
  let totalCost = 0;
  let costPerGram = 0;
  let ingredientStats = {
    total: formula.ingredients?.length || 0,
    weightBased: 0,
    quantityBased: 0,
  };

  const processedIngredients = (formula.ingredients || []).map((ing) => {
    const unit = (ing.unit || "").toLowerCase().trim();
    const isWeightUnit = weightUnits.some(wu => unit === wu || unit.includes(wu));
    const amount = parseFloat(ing.amount) || 0;
    
    // Ağırlık birimi mi, adet birimi mi belirle
    if (isWeightUnit) {
      ingredientStats.weightBased++;
    } else {
      ingredientStats.quantityBased++;
    }
    
    // Yüzde hesaplama - sadece ağırlık/hacim birimleri için
    let percentage = 0;
    if (isWeightUnit && totalForPercentage > 0) {
      const amountInGram = unit === "kg" ? amount * 1000 : amount;
      percentage = ((amountInGram / totalForPercentage) * 100).toFixed(2);
    }
    
    // Maliyet hesaplama (eğer fiyat gösterilecekse)
    let cost = 0;
    if (includePricing) {
      const price = parseFloat(ing.price) || 0;
      
      if (isWeightUnit) {
        // Ağırlık bazlı - kg fiyatı üzerinden
        if (unit === "kg") {
          cost = amount * price;
        } else {
          cost = (amount / 1000) * price;
        }
      } else {
        // Adet bazlı - direkt çarp
        cost = amount * price;
      }
      
      totalCost += cost;
    }
    
    return {
      ...ing,
      percentage: isWeightUnit ? percentage : null, // Adet için yüzde yok
      cost,
      isWeightUnit,
    };
  });

  const volume = parseFloat(formula.productVolume) || 0;
  if (volume > 0 && includePricing) {
    costPerGram = totalCost / volume;
  }

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formül - ${formula.name || "Ürün"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 9pt;
      line-height: 1.5;
      color: #1f2937;
      background: #fff;
    }
    
    .page { 
      padding: 24px;
      max-width: 100%;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-area img {
      height: 40px;
      width: auto;
    }
    
    .logo-placeholder {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 16pt;
    }
    
    .brand-text h1 {
      font-size: 14pt;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.5px;
    }
    
    .brand-text p {
      font-size: 8pt;
      color: #6b7280;
    }
    
    .doc-info {
      text-align: right;
    }
    
    .doc-info .label {
      font-size: 7pt;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .doc-info .date {
      font-size: 9pt;
      color: #374151;
      font-weight: 500;
      margin-top: 2px;
    }
    
    .doc-info .ref {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 4px;
    }
    
    /* Company Card */
    .company-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    
    .company-card h3 {
      font-size: 10pt;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .company-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 16px;
      font-size: 8pt;
    }
    
    .company-grid span {
      color: #6b7280;
    }
    
    .company-grid strong {
      color: #374151;
      font-weight: 500;
    }
    
    /* Product Title */
    .product-title {
      margin-bottom: 16px;
    }
    
    .product-title h2 {
      font-size: 16pt;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    
    .product-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 9pt;
    }
    
    .product-meta span {
      color: #6b7280;
    }
    
    .product-meta strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(${includePricing ? 4 : 3}, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .stat-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    
    .stat-box .label {
      font-size: 7pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    
    .stat-box .value {
      font-size: 16pt;
      font-weight: 700;
      color: #111827;
    }
    
    .stat-box .unit {
      font-size: 9pt;
      font-weight: 400;
      color: #6b7280;
    }
    
    /* Section */
    .section {
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 10pt;
      font-weight: 600;
      color: #111827;
      padding-bottom: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    /* Description Box */
    .description-box {
      background: #f9fafb;
      border-radius: 6px;
      padding: 12px;
      font-size: 9pt;
      color: #374151;
      line-height: 1.6;
      white-space: pre-line;
    }
    
    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 12px;
    }
    
    thead tr {
      background: #1f2937;
    }
    
    thead th {
      color: #fff;
      font-weight: 500;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 8px 10px;
      text-align: left;
    }
    
    thead th:last-child {
      text-align: right;
    }
    
    tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    tbody tr:nth-child(even) {
      background: #f9fafb;
    }
    
    tbody td {
      padding: 8px 10px;
      color: #374151;
      vertical-align: middle;
    }
    
    tbody td:last-child {
      text-align: right;
    }
    
    .ing-name {
      font-weight: 600;
      color: #111827;
    }
    
    .ing-display {
      font-size: 7pt;
      color: #6b7280;
      display: block;
      margin-top: 1px;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 500;
    }
    
    .badge-blue {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .badge-gray {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .badge-green {
      background: #dcfce7;
      color: #166534;
    }
    
    tfoot tr {
      background: #1f2937;
    }
    
    tfoot td {
      color: #fff;
      font-weight: 600;
      padding: 10px;
      font-size: 9pt;
    }
    
    /* Info Box */
    .info-box {
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      border-left: 3px solid;
    }
    
    .info-box.green {
      background: #f0fdf4;
      border-color: #22c55e;
    }
    
    .info-box.amber {
      background: #fffbeb;
      border-color: #f59e0b;
    }
    
    .info-box.red {
      background: #fef2f2;
      border-color: #ef4444;
    }
    
    .info-box h4 {
      font-size: 9pt;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .info-box.green h4 { color: #166534; }
    .info-box.amber h4 { color: #92400e; }
    .info-box.red h4 { color: #991b1b; }
    
    .info-box p {
      font-size: 8pt;
      line-height: 1.6;
      white-space: pre-line;
    }
    
    .info-box.green p { color: #15803d; }
    .info-box.amber p { color: #a16207; }
    .info-box.red p { color: #b91c1c; }
    
    /* Note Box */
    .note-box {
      background: #f1f5f9;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 7pt;
      color: #64748b;
      margin-top: 8px;
    }
    
    .note-box strong {
      color: #475569;
      display: block;
      margin-bottom: 4px;
    }
    
    /* Footer */
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-company {
      font-size: 9pt;
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }
    
    .footer-address {
      font-size: 8pt;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .footer-contact {
      display: flex;
      justify-content: center;
      gap: 16px;
      font-size: 8pt;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .footer-legal {
      font-size: 7pt;
      color: #9ca3af;
      max-width: 500px;
      margin: 0 auto;
    }
    
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    
    <!-- Header -->
    <div class="header">
      <div class="logo-area">
        ${logoBase64 
          ? `<img src="${logoBase64}" alt="MKN GROUP" />`
          : `<div class="logo-placeholder">M</div>`
        }
        <div class="brand-text">
          <h1>MKN GROUP</h1>
          <p>Formül Laboratuvarı</p>
        </div>
      </div>
      <div class="doc-info">
        <div class="label">Formül Raporu</div>
        <div class="date">${currentDate}</div>
        <div class="ref">Ref: ${formula.id || "N/A"}</div>
      </div>
    </div>
    
    <!-- Company Info -->
    ${companyData ? `
    <div class="company-card">
      <h3>${companyData.name || ""}</h3>
      <div class="company-grid">
        ${companyData.contactPerson ? `<div><span>Yetkili:</span> <strong>${companyData.contactPerson}</strong></div>` : ""}
        ${companyData.email ? `<div><span>E-posta:</span> <strong>${companyData.email}</strong></div>` : ""}
        ${companyData.phone ? `<div><span>Telefon:</span> <strong>${companyData.phone}</strong></div>` : ""}
        ${companyData.address ? `<div><span>Adres:</span> <strong>${companyData.address}</strong></div>` : ""}
      </div>
    </div>
    ` : ""}
    
    <!-- Product Title -->
    <div class="product-title">
      <h2>${formula.name || "Ürün Formülü"}</h2>
      <div class="product-meta">
        <div><span>Kategori:</span> <strong>${formula.productType || "Belirtilmemiş"}</strong></div>
        ${formula.productVolume ? `<div><span>Hacim:</span> <strong>${formula.productVolume} gr</strong></div>` : ""}
        <div><span>Bileşen:</span> <strong>${ingredientStats.total} hammadde</strong></div>
        ${ingredientStats.quantityBased > 0 ? `<div><span>Adet Bazlı:</span> <strong>${ingredientStats.quantityBased} kalem</strong></div>` : ""}
      </div>
    </div>
    
    <!-- Stats Grid -->
    <div class="stats-grid">
      ${includePricing ? `
      <div class="stat-box">
        <div class="label">Formül Maliyeti</div>
        <div class="value">₺${formatNumber(totalCost)}</div>
      </div>
      <div class="stat-box">
        <div class="label">Gram Maliyeti</div>
        <div class="value">₺${formatNumber(costPerGram, 4)}<span class="unit">/gr</span></div>
      </div>
      ` : ""}
      <div class="stat-box">
        <div class="label">Üretim Hacmi</div>
        <div class="value">${formula.productVolume || 0}<span class="unit"> gr</span></div>
      </div>
      <div class="stat-box">
        <div class="label">Toplam Bileşen</div>
        <div class="value">${ingredientStats.total}</div>
      </div>
      ${!includePricing ? `
      <div class="stat-box">
        <div class="label">Ağırlık Bazlı</div>
        <div class="value">${ingredientStats.weightBased}</div>
      </div>
      ` : ""}
    </div>
    
    <!-- Product Description -->
    ${formula.productDescription ? `
    <div class="section">
      <div class="section-title">Ürün Açıklaması</div>
      <div class="description-box">${formula.productDescription}</div>
    </div>
    ` : ""}
    
    <!-- Ingredients Table -->
    ${processedIngredients.length > 0 ? `
    <div class="section">
      <div class="section-title">Formül Bileşimi</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25px;">#</th>
            <th style="width: ${includePricing ? "28%" : "38%"};">Hammadde (INCI)</th>
            <th style="width: ${includePricing ? "18%" : "24%"};">Fonksiyon</th>
            <th style="width: 12%;">Miktar</th>
            <th style="width: 10%;">Oran</th>
            ${includePricing ? `
            <th style="width: 12%;">B. Fiyat</th>
            <th style="width: 10%;">Maliyet</th>
            ` : ""}
          </tr>
        </thead>
        <tbody>
          ${processedIngredients.map((ing, idx) => `
          <tr>
            <td style="color: #9ca3af; font-weight: 500;">${idx + 1}</td>
            <td>
              <span class="ing-name">${ing.name || ""}</span>
              ${ing.displayName ? `<span class="ing-display">${ing.displayName}</span>` : ""}
            </td>
            <td style="font-size: 8pt; color: #6b7280;">${ing.functionTr || ing.function || "—"}</td>
            <td style="font-weight: 600;">${ing.amount || 0} ${ing.unit || ""}</td>
            <td>
              ${ing.isWeightUnit && ing.percentage !== null 
                ? `<span class="badge badge-blue">${ing.percentage}%</span>` 
                : `<span class="badge badge-gray">—</span>`
              }
            </td>
            ${includePricing ? `
            <td style="color: #6b7280;">${ing.price ? `₺${formatNumber(ing.price)}/kg` : "—"}</td>
            <td style="font-weight: 600;">₺${formatNumber(ing.cost)}</td>
            ` : ""}
          </tr>
          `).join("")}
        </tbody>
        ${includePricing ? `
        <tfoot>
          <tr>
            <td colspan="6" style="text-align: right;">Toplam Formül Maliyeti</td>
            <td>₺${formatNumber(totalCost)}</td>
          </tr>
        </tfoot>
        ` : ""}
      </table>
      
      <div class="note-box">
        <strong>Not:</strong>
        • Tüm hammadde miktarları formül standardına göre hesaplanmıştır.
        • Yüzde oranları yalnızca ağırlık/hacim bazlı bileşenler için hesaplanır.
        ${ingredientStats.quantityBased > 0 ? `• Adet bazlı bileşenler (${ingredientStats.quantityBased} kalem) yüzde hesaplamasına dahil edilmez.` : ""}
        ${includePricing ? `• Fiyatlar güncel piyasa verilerine göre hesaplanmıştır.` : ""}
      </div>
    </div>
    ` : ""}
    
    <!-- Usage Instructions -->
    ${formula.usageInstructions ? `
    <div class="section">
      <div class="section-title">Kullanım Talimatı</div>
      <div class="description-box">${formula.usageInstructions}</div>
    </div>
    ` : ""}
    
    <!-- Benefits -->
    ${formula.benefits ? `
    <div class="info-box green">
      <h4>Ürün Faydaları</h4>
      <p>${formula.benefits}</p>
    </div>
    ` : ""}
    
    <!-- Recommendations -->
    ${formula.recommendations ? `
    <div class="info-box amber">
      <h4>Öneriler</h4>
      <p>${formula.recommendations}</p>
    </div>
    ` : ""}
    
    <!-- Warnings -->
    ${formula.warnings ? `
    <div class="info-box red">
      <h4>⚠️ Uyarılar</h4>
      <p>${formula.warnings}</p>
    </div>
    ` : ""}
    
    <!-- Production Notes -->
    ${formula.notes ? `
    <div class="section">
      <div class="section-title">Üretim Notları</div>
      <div class="description-box">${formula.notes}</div>
    </div>
    ` : ""}
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-company">MKN GROUP KİMYA KOZMET. SAN. TİC. LTD. ŞTİ.</div>
      <div class="footer-address">Akçaburgaz Mah, 3026 Sk, No:5, 34522 Esenyurt/İstanbul</div>
      <div class="footer-contact">
        <span>📞 +90 531 494 25 94</span>
        <span>📧 info@mkngroup.com.tr</span>
        <span>🌐 www.mkngroup.com.tr</span>
      </div>
      <div class="footer-legal">
        Bu belge gizlidir. MKN GROUP'un yazılı izni olmadan çoğaltılamaz veya paylaşılamaz.
        © ${new Date().getFullYear()} MKN GROUP
      </div>
    </div>
    
  </div>
</body>
</html>
  `;
}
