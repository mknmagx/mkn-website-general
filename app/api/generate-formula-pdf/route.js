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
            top: "15mm",
            right: "15mm",
            bottom: "15mm",
            left: "15mm",
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

  // Calculate costs and statistics
  let totalCost = 0;
  let costPerGram = 0;
  let ingredientStats = {
    total: formula.ingredients?.length || 0,
    withPrice: 0,
    withFunction: 0,
  };

  if (formula.ingredients) {
    formula.ingredients.forEach((ing) => {
      if (ing.price) ingredientStats.withPrice++;
      if (ing.function || ing.functionTr) ingredientStats.withFunction++;

      if (includePricing) {
        const amount = parseFloat(ing.amount) || 0;
        const price = parseFloat(ing.price) || 0;
        let cost = 0;

        if (ing.unit === "g" || ing.unit === "gram") {
          cost = (amount / 1000) * price;
        } else if (ing.unit === "ml") {
          cost = (amount / 1000) * price;
        } else if (ing.unit === "kg") {
          cost = amount * price;
        } else {
          cost = amount * price;
        }

        totalCost += cost;
      }
    });

    const volume = parseFloat(formula.productVolume) || 0;
    if (volume > 0) {
      costPerGram = totalCost / volume;
    }
  }

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formül Raporu - ${formula.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
    }
    
    .page { 
      max-width: 210mm; 
      min-height: 297mm; 
      padding: 20mm;
    }
    
    /* Typography */
    h1 { 
      font-size: 28pt; 
      font-weight: 800; 
      letter-spacing: -0.02em;
      color: #0f172a;
      margin-bottom: 12pt;
    }
    
    h2 { 
      font-size: 13pt; 
      font-weight: 700; 
      color: #1e293b;
      margin-bottom: 10pt;
      padding-bottom: 6pt;
      border-bottom: 2px solid #e2e8f0;
    }
    
    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8pt;
    }
    
    /* Color System */
    .text-primary { color: #0f172a; }
    .text-secondary { color: #475569; }
    .text-muted { color: #94a3b8; }
    .text-accent { color: #3b82f6; }
    .bg-primary { background-color: #0f172a; }
    .bg-accent { background-color: #3b82f6; }
    .bg-light { background-color: #f8fafc; }
    .bg-gradient { 
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
    }
    
    /* Layout Components */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16pt;
      margin-bottom: 12pt;
    }
    
    .card-compact {
      padding: 12pt;
      margin-bottom: 10pt;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14pt;
      text-align: center;
    }
    
    .stat-label {
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 4pt;
    }
    
    .stat-value {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    
    .stat-suffix {
      font-size: 11pt;
      font-weight: 500;
      color: #64748b;
      margin-left: 2pt;
    }
    
    /* Table Styling */
    table { 
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: auto;
      font-size: 9pt;
    }
    
    thead tr {
      background: #0f172a;
      color: #ffffff;
    }
    
    thead th {
      padding: 10pt 12pt;
      text-align: left;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-right: 1px solid rgba(255,255,255,0.1);
    }
    
    thead th:last-child {
      border-right: none;
    }
    
    tbody tr {
      page-break-inside: avoid; 
      page-break-after: auto;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }
    
    tbody tr:hover {
      background-color: #f1f5f9;
    }
    
    tbody td {
      padding: 10pt 12pt;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }
    
    tbody td:last-child {
      border-right: none;
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .ingredient-name {
      font-weight: 600;
      color: #0f172a;
    }
    
    .ingredient-display-name {
      font-size: 8pt;
      color: #64748b;
      font-weight: 400;
      display: block;
      margin-top: 2pt;
    }
    
    .percentage-badge {
      display: inline-block;
      padding: 3pt 8pt;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-weight: 600;
      font-size: 8pt;
    }
    
    /* Info Boxes */
    .info-box {
      border-radius: 6px;
      padding: 12pt;
      margin-bottom: 12pt;
      border-left: 3px solid;
    }
    
    .info-box.blue {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }
    
    .info-box.green {
      background: #f0fdf4;
      border-color: #10b981;
      color: #065f46;
    }
    
    .info-box.amber {
      background: #fffbeb;
      border-color: #f59e0b;
      color: #92400e;
    }
    
    .info-box.red {
      background: #fef2f2;
      border-color: #ef4444;
      color: #991b1b;
    }
    
    .info-box-title {
      font-weight: 700;
      font-size: 10pt;
      margin-bottom: 6pt;
    }
    
    .info-box-content {
      font-size: 9pt;
      line-height: 1.6;
      white-space: pre-line;
    }
    
    /* Header & Footer */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20pt;
      margin-bottom: 20pt;
      border-bottom: 3px solid #0f172a;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12pt;
    }
    
    .company-name {
      font-size: 22pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    
    .company-tagline {
      font-size: 8pt;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .footer {
      margin-top: 30pt;
      padding-top: 16pt;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 8pt;
      color: #64748b;
    }
    
    .footer-company {
      font-weight: 600;
      color: #1e293b;
    }
    
    .footer-confidential {
      margin-top: 8pt;
      color: #94a3b8;
      font-size: 7pt;
    }
    
    /* Grid System */
    .grid {
      display: grid;
      gap: 12pt;
      margin-bottom: 16pt;
    }
    
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    
    /* Utilities */
    .mb-1 { margin-bottom: 4pt; }
    .mb-2 { margin-bottom: 8pt; }
    .mb-3 { margin-bottom: 12pt; }
    .mb-4 { margin-bottom: 16pt; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .uppercase { text-transform: uppercase; }
    
  </style>
</head>
<body>
  <div class="page">
    
    <!-- Modern Header -->
    <div class="header">
      <div class="logo-section">
        ${
          logoBase64
            ? `<img src="${logoBase64}" alt="MKN GROUP" style="height: 48px; width: auto;" />`
            : `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 18pt;">M</div>`
        }
        <div>
          <div class="company-name">MKN GROUP</div>
          <div class="company-tagline">Professional Formula Laboratory</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4pt;">Formül Raporu</div>
        <div style="font-size: 10pt; color: #1e293b; font-weight: 600;">${currentDate}</div>
        <div style="font-size: 8pt; color: #64748b; margin-top: 6pt;">Ref: ${
          formula.id || "N/A"
        }</div>
      </div>
    </div>

    <!-- Client Information -->
    ${
      companyData
        ? `
    <div class="info-box blue mb-4">
      <div class="info-box-title">Müşteri Bilgileri</div>
      <div style="font-size: 12pt; font-weight: 700; color: #0f172a; margin-bottom: 6pt;">${
        companyData.name || ""
      }</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8pt; font-size: 8pt;">
        ${
          companyData.contactPerson
            ? `<div><span style="color: #64748b;">Yetkili:</span> <span style="font-weight: 600; color: #1e293b;">${companyData.contactPerson}</span></div>`
            : ""
        }
        ${
          companyData.email
            ? `<div><span style="color: #64748b;">E-posta:</span> <span style="font-weight: 600; color: #1e293b;">${companyData.email}</span></div>`
            : ""
        }
        ${
          companyData.phone
            ? `<div><span style="color: #64748b;">Telefon:</span> <span style="font-weight: 600; color: #1e293b;">${companyData.phone}</span></div>`
            : ""
        }
        ${
          companyData.address
            ? `<div><span style="color: #64748b;">Adres:</span> <span style="font-weight: 600; color: #1e293b;">${companyData.address}</span></div>`
            : ""
        }
      </div>
    </div>
    `
        : ""
    }

    <!-- Product Title -->
    <div class="mb-4">
      <h1>${formula.name || "Ürün Formülü"}</h1>
      <div style="display: flex; gap: 16pt; font-size: 10pt; color: #475569;">
        <div>
          <span style="color: #94a3b8;">Kategori:</span>
          <span style="font-weight: 600; color: #1e293b; margin-left: 4pt;">${
            formula.productType || "Belirtilmemiş"
          }</span>
        </div>
        ${
          formula.productVolume
            ? `
        <div>
          <span style="color: #94a3b8;">Hedef Hacim:</span>
          <span style="font-weight: 600; color: #1e293b; margin-left: 4pt;">${formula.productVolume} ml</span>
        </div>
        `
            : ""
        }
        <div>
          <span style="color: #94a3b8;">Bileşen:</span>
          <span style="font-weight: 600; color: #1e293b; margin-left: 4pt;">${
            ingredientStats.total
          } hammadde</span>
        </div>
      </div>
    </div>

    <!-- Statistics Grid -->
    <div class="grid ${includePricing ? "grid-4" : "grid-3"} mb-4">
      ${
        includePricing
          ? `
      <div class="stat-card">
        <div class="stat-label">Toplam Maliyet</div>
        <div class="stat-value">₺${totalCost.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Birim Maliyet</div>
        <div class="stat-value">₺${costPerGram.toFixed(
          4
        )}<span class="stat-suffix">/gr</span></div>
      </div>
      `
          : ""
      }
      <div class="stat-card">
        <div class="stat-label">Üretim Hacmi</div>
        <div class="stat-value">${
          formula.productVolume || 0
        }<span class="stat-suffix">gr</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bileşen Sayısı</div>
        <div class="stat-value">${ingredientStats.total}</div>
      </div>
      ${
        !includePricing
          ? `
      <div class="stat-card">
        <div class="stat-label">Fonksiyonlu</div>
        <div class="stat-value">${ingredientStats.withFunction}</div>
      </div>
      `
          : ""
      }
    </div>

    <!-- Product Description -->
    ${
      formula.productDescription
        ? `
    <div class="card mb-3">
      <h2>Ürün Açıklaması</h2>
      <div style="font-size: 10pt; color: #334155; line-height: 1.7; white-space: pre-line;">${formula.productDescription}</div>
    </div>
    `
        : ""
    }

    <!-- Ingredients Table -->
    ${
      formula.ingredients && formula.ingredients.length > 0
        ? `
    <div class="mb-4">
      <h2>Formül Bileşimi ve İçerik Detayı</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th style="width: ${
              includePricing ? "25%" : "35%"
            };">Hammadde (INCI Name)</th>
            <th style="width: ${includePricing ? "18%" : "25%"};">Fonksiyon</th>
            <th style="width: 12%; text-align: right;">Miktar</th>
            <th style="width: 10%; text-align: center;">Oran</th>
            ${
              includePricing
                ? `
            <th style="width: 15%; text-align: right;">Birim Fiyat</th>
            <th style="width: 12%; text-align: right;">Maliyet</th>
            `
                : ""
            }
          </tr>
        </thead>
        <tbody>
          ${formula.ingredients
            .map((ing, idx) => {
              let cost = 0;
              if (includePricing) {
                const amount = parseFloat(ing.amount) || 0;
                const price = parseFloat(ing.price) || 0;

                if (ing.unit === "g" || ing.unit === "gram") {
                  cost = (amount / 1000) * price;
                } else if (ing.unit === "ml") {
                  cost = (amount / 1000) * price;
                } else if (ing.unit === "kg") {
                  cost = amount * price;
                } else {
                  cost = amount * price;
                }
              }

              return `
          <tr>
            <td style="color: #64748b; font-weight: 600;">${idx + 1}</td>
            <td>
              <div class="ingredient-name">${ing.name || ""}</div>
              ${
                ing.displayName
                  ? `<div class="ingredient-display-name">${ing.displayName}</div>`
                  : ""
              }
            </td>
            <td style="color: #475569; font-size: 9pt;">${
              ing.functionTr || ing.function || "—"
            }</td>
            <td style="text-align: right; font-weight: 600; color: #1e293b;">${
              ing.amount || 0
            } ${ing.unit || ""}</td>
            <td style="text-align: center;">
              <span class="percentage-badge">${ing.percentage || 0}%</span>
            </td>
            ${
              includePricing
                ? `
            <td style="text-align: right; color: #475569;">${
              ing.price ? `₺${parseFloat(ing.price).toFixed(2)}/kg` : "—"
            }</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">₺${cost.toFixed(
              2
            )}</td>
            `
                : ""
            }
          </tr>
          `;
            })
            .join("")}
        </tbody>
        ${
          includePricing
            ? `
        <tfoot>
          <tr style="background: #0f172a; color: #ffffff; font-weight: 700;">
            <td colspan="${
              includePricing ? "6" : "4"
            }" style="text-align: right; padding: 12pt; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.05em;">Toplam Formül Maliyeti</td>
            <td style="text-align: right; padding: 12pt; font-size: 12pt;">₺${totalCost.toFixed(
              2
            )}</td>
          </tr>
        </tfoot>
        `
            : ""
        }
      </table>
      
      <!-- Ingredient Notes -->
      <div style="margin-top: 10pt; padding: 10pt; background: #f8fafc; border-radius: 6px; font-size: 8pt; color: #64748b;">
        <div style="font-weight: 600; color: #475569; margin-bottom: 4pt;">Not:</div>
        <div>• Tüm hammadde miktarları formül standardına göre hesaplanmıştır.</div>
        <div>• INCI isimleri uluslararası kozmetik hammadde standartlarına uygundur.</div>
        ${
          includePricing
            ? `<div>• Fiyatlandırma güncel piyasa verilerine göre hesaplanmıştır ve değişkenlik gösterebilir.</div>`
            : ""
        }
      </div>
    </div>
    `
        : ""
    }

    <!-- Usage Instructions -->
    ${
      formula.usageInstructions
        ? `
    <div class="card mb-3">
      <h2>Kullanım Talimatı</h2>
      <div style="font-size: 10pt; color: #334155; line-height: 1.7; white-space: pre-line;">${formula.usageInstructions}</div>
    </div>
    `
        : ""
    }

    <!-- Benefits -->
    ${
      formula.benefits
        ? `
    <div class="info-box green mb-3">
      <div class="info-box-title">Ürün Faydaları ve Özellikleri</div>
      <div class="info-box-content">${formula.benefits}</div>
    </div>
    `
        : ""
    }

    <!-- Recommendations -->
    ${
      formula.recommendations
        ? `
    <div class="info-box amber mb-3">
      <div class="info-box-title">Öneriler ve Kullanım İpuçları</div>
      <div class="info-box-content">${formula.recommendations}</div>
    </div>
    `
        : ""
    }

    <!-- Warnings -->
    ${
      formula.warnings
        ? `
    <div class="info-box red mb-3">
      <div class="info-box-title">⚠️ Uyarılar ve Güvenlik Önlemleri</div>
      <div class="info-box-content">${formula.warnings}</div>
    </div>
    `
        : ""
    }

    <!-- Production Notes -->
    ${
      formula.notes
        ? `
    <div class="card mb-3">
      <h2>Üretim Notları ve Teknik Detaylar</h2>
      <div style="font-size: 10pt; color: #334155; line-height: 1.7; white-space: pre-line; padding: 10pt; background: #f8fafc; border-radius: 4px;">${formula.notes}</div>
    </div>
    `
        : ""
    }

    <!-- AI Generation Info -->
    ${
      formula.aiConfig
        ? `
    <div style="margin-top: 20pt; padding: 12pt; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6pt;">Formül Oluşturma Bilgisi</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8pt; font-size: 9pt;">
        ${
          formula.aiConfig.modelName
            ? `
        <div>
          <span style="color: #94a3b8;">AI Model:</span>
          <span style="font-weight: 600; color: #1e293b; margin-left: 4pt;">${formula.aiConfig.modelName}</span>
        </div>
        `
            : ""
        }
        ${
          formula.aiConfig.formulaLevel
            ? `
        <div>
          <span style="color: #94a3b8;">Formül Seviyesi:</span>
          <span style="font-weight: 600; color: #1e293b; margin-left: 4pt;">${
            formula.aiConfig.formulaLevel === "basic"
              ? "Temel"
              : formula.aiConfig.formulaLevel === "professional"
              ? "Profesyonel"
              : "İleri Seviye"
          }</span>
        </div>
        `
            : ""
        }
        ${
          formula.aiConfig.generatedAt
            ? `
        <div>
          <span style="color: #94a3b8;">Oluşturma Tarihi:</span>
          <span style="font-weight: 600; color: #1e293b; margin-left: 4pt;">${new Date(
            formula.aiConfig.generatedAt
          ).toLocaleDateString("tr-TR")}</span>
        </div>
        `
            : ""
        }
      </div>
    </div>
    `
        : ""
    }

    <!-- Professional Footer -->
    <div class="footer">
      <div style="margin-bottom: 10pt;">
        <div class="footer-company">MKN GROUP KİMYA KOZMET. SAN. TİC. LTD. ŞTİ.</div>
        <div style="margin-top: 4pt;">Akçaburgaz Mah, 3026 Sk, No:5, 34522 Esenyurt/İstanbul</div>
      </div>
      <div style="display: flex; justify-content: center; gap: 20pt; margin-bottom: 10pt;">
        <div>📞 +90 531 494 25 94</div>
        <div>📧 info@mkngroup.com.tr</div>
        <div>🌐 www.mkngroup.com.tr</div>
      </div>
      <div class="footer-confidential">
        Bu belge gizli ve özeldir. MKN GROUP'un yazılı izni olmadan çoğaltılamaz, paylaşılamaz veya ticari amaçla kullanılamaz.
        <br>© ${new Date().getFullYear()} MKN GROUP - Tüm hakları saklıdır.
      </div>
    </div>

  </div>
</body>
</html>
  `;
}
