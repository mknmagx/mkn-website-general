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

    // Format numbers helper
    const formatNumber = (num) => {
      const value = parseFloat(num) || 0;
      return value.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    // Format date helper
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Product type label mapping
    const productTypeLabels = {
      kozmetik: "Kozmetik",
      gida: "Gıda Takviyesi",
      temizlik: "Temizlik Ürünü",
      "kisisel-bakim": "Kişisel Bakım",
      diger: "Diğer",
    };

    // Function label mapping
    const functionLabels = {
      "aktif-madde": "Aktif Madde",
      nemlendirici: "Nemlendirici",
      emulgator: "Emülgatör",
      "yardimci-emulgator": "Yardımcı Emülgatör",
      koyulastirici: "Koyulaştırıcı",
      koruyucu: "Koruyucu",
      parfum: "Parfüm",
      cozucu: "Çözücü",
      yag: "Yağ",
      boya: "Boya",
      antioksidan: "Antioksidan",
      "ph-duzenleyici": "pH Düzenleyici",
      diger: "Diğer",
    };

    // Category label mapping
    const categoryLabels = {
      genel: "Genel Gider",
      nakliye: "Nakliye",
      vergi: "Vergi",
      depo: "Depolama",
      diger: "Diğer",
    };

    // ===== HESAPLAMALAR =====
    const quantity = parseFloat(calculation.quantity) || 1;
    
    // Hammadde hesaplamaları
    const ingredients = calculation.formData?.ingredients?.filter(i => i.name) || [];
    const batchVolumeGram = ingredients.reduce((sum, ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const unit = ing.unit || "gram";
      return sum + (unit === "kg" ? amount * 1000 : unit === "ml" ? amount : amount);
    }, 0);
    
    const batchIngredientCost = ingredients.reduce((sum, ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const price = parseFloat(ing.price) || 0;
      const unit = ing.unit || "gram";
      const amountInKg = unit === "kg" ? amount : amount / 1000;
      return sum + (amountInKg * price);
    }, 0);
    
    const productVolumeGram = parseFloat(calculation.productVolume) || 0;
    const unitsPerBatch = productVolumeGram > 0 && batchVolumeGram > 0 
      ? batchVolumeGram / productVolumeGram 
      : 1;
    const ingredientsCostPerUnit = batchIngredientCost / unitsPerBatch;
    const totalIngredientCost = ingredientsCostPerUnit * quantity;
    
    // Ambalaj hesaplamaları
    const packaging = calculation.formData?.packaging?.filter(p => p.type) || [];
    const packagingCostPerUnit = packaging.reduce((sum, pkg) => 
      sum + ((parseFloat(pkg.quantity) || 0) * (parseFloat(pkg.price) || 0)), 0);
    const packagingCostTotal = packagingCostPerUnit * quantity;
    
    // Kutu ve etiket
    const boxCostPerUnit = (parseFloat(calculation.formData?.boxQuantity) || 0) * 
      (parseFloat(calculation.formData?.boxPrice) || 0);
    const labelCostPerUnit = (parseFloat(calculation.formData?.labelQuantity) || 0) * 
      (parseFloat(calculation.formData?.labelPrice) || 0);
    const boxLabelCostTotal = (boxCostPerUnit + labelCostPerUnit) * quantity;
    
    // İşçilik
    const laborCostPerUnit = parseFloat(calculation.formData?.laborCostPerUnit) || 0;
    const laborCostTotal = laborCostPerUnit * quantity;
    
    // Diğer masraflar
    const otherCosts = calculation.formData?.otherCosts?.filter(c => c.description) || [];
    const otherCostsTotal = otherCosts.reduce((sum, cost) => 
      sum + (parseFloat(cost.amount) || 0), 0);
    const otherCostsPerUnit = otherCostsTotal / quantity;
    
    // Toplam maliyet
    const totalCostPerUnit = ingredientsCostPerUnit + packagingCostPerUnit + 
      boxCostPerUnit + labelCostPerUnit + laborCostPerUnit + otherCostsPerUnit;
    const totalCostTotal = totalCostPerUnit * quantity;
    
    // Kar hesaplama
    const profitType = calculation.formData?.profitType || "percentage";
    const profitMarginPercent = parseFloat(calculation.formData?.profitMarginPercent) || 0;
    const profitAmountPerUnit = parseFloat(calculation.formData?.profitAmountPerUnit) || 0;
    
    const profitPerUnit = profitType === "percentage" 
      ? totalCostPerUnit * (profitMarginPercent / 100)
      : profitAmountPerUnit;
    const displayProfitMargin = totalCostPerUnit > 0 
      ? ((profitPerUnit / totalCostPerUnit) * 100).toFixed(1) 
      : 0;
    
    // Satış fiyatları
    const unitPrice = totalCostPerUnit + profitPerUnit;
    const profitTotal = profitPerUnit * quantity;
    const totalPrice = unitPrice * quantity;

    // Seçilen işlemler listesi (sadece doldurulan alanlar)
    const selectedOperations = [];
    
    if (ingredients.length > 0) {
      selectedOperations.push({
        name: "Hammadde",
        count: ingredients.length,
        unitCost: ingredientsCostPerUnit,
        totalCost: totalIngredientCost,
        icon: "🧪"
      });
    }
    
    if (packaging.length > 0) {
      selectedOperations.push({
        name: "Ambalaj",
        count: packaging.length,
        unitCost: packagingCostPerUnit,
        totalCost: packagingCostTotal,
        icon: "📦"
      });
    }
    
    if (calculation.formData?.boxType || calculation.formData?.labelType) {
      selectedOperations.push({
        name: "Kutu & Etiket",
        count: (calculation.formData?.boxType ? 1 : 0) + (calculation.formData?.labelType ? 1 : 0),
        unitCost: boxCostPerUnit + labelCostPerUnit,
        totalCost: boxLabelCostTotal,
        icon: "🏷️"
      });
    }
    
    if (laborCostPerUnit > 0) {
      selectedOperations.push({
        name: "İşçilik",
        count: 1,
        unitCost: laborCostPerUnit,
        totalCost: laborCostTotal,
        icon: "👷"
      });
    }
    
    if (otherCosts.length > 0) {
      selectedOperations.push({
        name: "Diğer Masraflar",
        count: otherCosts.length,
        unitCost: otherCostsPerUnit,
        totalCost: otherCostsTotal,
        icon: "💰"
      });
    }

    // Modern minimal PDF HTML
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Hesaplama - ${calculation.productName || "Ürün"}</title>
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
    
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .brand-icon {
      width: 36px;
      height: 36px;
      background: #10b981;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14pt;
    }
    
    .brand h1 {
      font-size: 13pt;
      font-weight: 700;
      color: #111827;
    }
    
    .brand p {
      font-size: 8pt;
      color: #6b7280;
    }
    
    .doc-meta {
      text-align: right;
      font-size: 8pt;
    }
    
    .doc-meta .label {
      color: #9ca3af;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .doc-meta .value {
      color: #374151;
      font-weight: 500;
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
      margin-bottom: 6px;
    }
    
    .company-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px 16px;
      font-size: 8pt;
      color: #6b7280;
    }
    
    .company-info strong {
      color: #374151;
      font-weight: 500;
    }
    
    /* Product Info */
    .product-header {
      margin-bottom: 20px;
    }
    
    .product-header h2 {
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
      font-size: 8pt;
      color: #6b7280;
    }
    
    .product-meta strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    
    .stat-card .label {
      font-size: 7pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    
    .stat-card .value {
      font-size: 14pt;
      font-weight: 700;
      color: #111827;
    }
    
    .stat-card .sub {
      font-size: 7pt;
      color: #9ca3af;
      margin-top: 2px;
    }
    
    .stat-card.green { border-color: #10b981; background: #f0fdf4; }
    .stat-card.green .value { color: #059669; }
    
    /* Section */
    .section {
      margin-bottom: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .section-header {
      background: #f9fafb;
      padding: 10px 14px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-header .icon {
      font-size: 14px;
    }
    
    .section-header h3 {
      font-size: 9pt;
      font-weight: 600;
      color: #111827;
      flex: 1;
    }
    
    .section-header .badge {
      font-size: 7pt;
      background: #e5e7eb;
      color: #6b7280;
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    .section-content {
      padding: 12px 14px;
    }
    
    /* Operations List */
    .operations-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .operation-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .operation-item .icon {
      font-size: 18px;
      width: 32px;
      height: 32px;
      background: #fff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e7eb;
    }
    
    .operation-item .info {
      flex: 1;
    }
    
    .operation-item .name {
      font-size: 9pt;
      font-weight: 600;
      color: #111827;
    }
    
    .operation-item .count {
      font-size: 7pt;
      color: #6b7280;
    }
    
    .operation-item .cost {
      text-align: right;
    }
    
    .operation-item .unit-cost {
      font-size: 9pt;
      font-weight: 600;
      color: #111827;
    }
    
    .operation-item .total-cost {
      font-size: 7pt;
      color: #6b7280;
    }
    
    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    
    thead tr {
      background: #374151;
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
    }
    
    tbody td:last-child {
      text-align: right;
      font-weight: 600;
    }
    
    tfoot tr {
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    
    tfoot td {
      padding: 8px 10px;
      font-weight: 600;
      color: #111827;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 500;
    }
    
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-gray { background: #f3f4f6; color: #6b7280; }
    
    /* Summary Section */
    .summary-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    
    .summary-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-header .icon {
      width: 28px;
      height: 28px;
      background: #10b981;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
    }
    
    .summary-header h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #111827;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    
    .summary-column {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
    }
    
    .summary-column h4 {
      font-size: 7pt;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 8pt;
    }
    
    .summary-row .label {
      color: #6b7280;
    }
    
    .summary-row .value {
      color: #111827;
      font-weight: 500;
    }
    
    .summary-row.total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #10b981;
    }
    
    .summary-row.total .label {
      font-weight: 600;
      color: #111827;
    }
    
    .summary-row.total .value {
      font-size: 11pt;
      font-weight: 700;
      color: #059669;
    }
    
    .summary-row.profit .label,
    .summary-row.profit .value {
      color: #059669;
    }
    
    /* Final Price Banner */
    .price-banner {
      background: #10b981;
      border-radius: 8px;
      padding: 14px;
      margin-top: 14px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    
    .price-box {
      text-align: center;
      padding: 10px;
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
    }
    
    .price-box .label {
      font-size: 7pt;
      color: rgba(255,255,255,0.8);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    
    .price-box .value {
      font-size: 18pt;
      font-weight: 700;
      color: #fff;
    }
    
    .price-box .sub {
      font-size: 7pt;
      color: rgba(255,255,255,0.6);
      margin-top: 2px;
    }
    
    /* Footer */
    .footer {
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer p {
      font-size: 7pt;
      color: #9ca3af;
      margin-bottom: 2px;
    }
    
    .footer .brand {
      font-size: 8pt;
      font-weight: 500;
      color: #6b7280;
    }
    
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .section { break-inside: avoid; }
      .summary-section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="brand-icon">📊</div>
        <div>
          <h1>Maliyet Hesaplama</h1>
          <p>Profesyonel Fiyatlandırma Raporu</p>
        </div>
      </div>
      <div class="doc-meta">
        <div class="label">Tarih</div>
        <div class="value">${formatDate(calculation.createdAt?.seconds * 1000 || Date.now())}</div>
        <div style="margin-top: 6px;">
          <div class="label">Referans</div>
          <div class="value">#${Date.now().toString(36).toUpperCase()}</div>
        </div>
      </div>
    </div>
    
    <!-- Company Info -->
    ${companyData ? `
    <div class="company-card">
      <h3>${companyData.name || ""}</h3>
      <div class="company-info">
        ${companyData.contactPerson ? `<div><span>Yetkili:</span> <strong>${companyData.contactPerson}</strong></div>` : ""}
        ${companyData.email ? `<div><span>E-posta:</span> <strong>${companyData.email}</strong></div>` : ""}
        ${companyData.phone ? `<div><span>Telefon:</span> <strong>${companyData.phone}</strong></div>` : ""}
        ${companyData.address ? `<div><span>Adres:</span> <strong>${companyData.address}</strong></div>` : ""}
      </div>
    </div>
    ` : ""}
    
    <!-- Product Header -->
    <div class="product-header">
      <h2>${calculation.productName || "Ürün Hesaplaması"}</h2>
      <div class="product-meta">
        <div><span>Tip:</span> <strong>${productTypeLabels[calculation.productType] || calculation.productType || "—"}</strong></div>
        <div><span>Miktar:</span> <strong>${formatNumber(quantity).split(',')[0]} adet</strong></div>
        ${calculation.productVolume ? `<div><span>Hacim:</span> <strong>${calculation.productVolume} ml</strong></div>` : ""}
        ${calculation.formData?.sourceFormulaName ? `<div><span>Formül:</span> <strong>${calculation.formData.sourceFormulaName}</strong></div>` : ""}
      </div>
    </div>
    
    <!-- Stats Row - Fiyat bilgisi showCostDetails'e bağlı -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="label">Üretim Miktarı</div>
        <div class="value">${formatNumber(quantity).split(',')[0]}</div>
        <div class="sub">adet</div>
      </div>
      ${showCostDetails ? `
      <div class="stat-card">
        <div class="label">Birim Maliyet</div>
        <div class="value">₺${formatNumber(totalCostPerUnit)}</div>
        <div class="sub">adet başına</div>
      </div>
      <div class="stat-card">
        <div class="label">Kar Marjı</div>
        <div class="value">%${displayProfitMargin}</div>
        <div class="sub">+₺${formatNumber(profitPerUnit)}/adet</div>
      </div>
      <div class="stat-card green">
        <div class="label">Birim Fiyat</div>
        <div class="value">₺${formatNumber(unitPrice)}</div>
        <div class="sub">satış fiyatı</div>
      </div>
      ` : `
      <div class="stat-card">
        <div class="label">İşlem Sayısı</div>
        <div class="value">${selectedOperations.length}</div>
        <div class="sub">kategori</div>
      </div>
      <div class="stat-card">
        <div class="label">Bileşen</div>
        <div class="value">${ingredients.length}</div>
        <div class="sub">hammadde</div>
      </div>
      <div class="stat-card">
        <div class="label">Ambalaj</div>
        <div class="value">${packaging.length}</div>
        <div class="sub">kalem</div>
      </div>
      `}
    </div>
    
    <!-- Selected Operations Summary -->
    ${selectedOperations.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">📋</span>
        <h3>Seçilen İşlemler</h3>
        <span class="badge">${selectedOperations.length} kategori</span>
      </div>
      <div class="section-content">
        <div class="operations-list">
          ${selectedOperations.map(op => `
          <div class="operation-item">
            <div class="icon">${op.icon}</div>
            <div class="info">
              <div class="name">${op.name}</div>
              <div class="count">${op.count} kalem</div>
            </div>
            ${showCostDetails ? `
            <div class="cost">
              <div class="unit-cost">₺${formatNumber(op.unitCost)}</div>
              <div class="total-cost">Toplam: ₺${formatNumber(op.totalCost)}</div>
            </div>
            ` : ""}
          </div>
          `).join("")}
        </div>
      </div>
    </div>
    ` : ""}
    
    ${showCostDetails ? `
    <!-- Detailed Sections - Only when showCostDetails is true -->
    
    <!-- Ingredients -->
    ${ingredients.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">🧪</span>
        <h3>Hammaddeler</h3>
        <span class="badge">${ingredients.length} kalem</span>
      </div>
      <div class="section-content" style="padding: 0;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Hammadde</th>
              <th>Fonksiyon</th>
              <th>Miktar</th>
              <th>B. Fiyat</th>
              <th>Maliyet</th>
            </tr>
          </thead>
          <tbody>
            ${ingredients.map((ing, idx) => {
              const amount = parseFloat(ing.amount) || 0;
              const price = parseFloat(ing.price) || 0;
              const unit = ing.unit || "gram";
              const amountInKg = unit === "kg" ? amount : amount / 1000;
              const cost = amountInKg * price;
              return `
            <tr>
              <td><span class="badge badge-gray">${idx + 1}</span></td>
              <td style="font-weight: 600;">${ing.name}</td>
              <td>${ing.function ? `<span class="badge badge-blue">${functionLabels[ing.function] || ing.function}</span>` : "—"}</td>
              <td>${ing.amount} ${ing.unit || "g"}</td>
              <td>₺${formatNumber(price)}/kg</td>
              <td><span class="badge badge-green">₺${formatNumber(cost)}</span></td>
            </tr>
              `;
            }).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align: right;">Toplam Hammadde:</td>
              <td>₺${formatNumber(totalIngredientCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ` : ""}
    
    <!-- Packaging -->
    ${packaging.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">📦</span>
        <h3>Ambalaj</h3>
        <span class="badge">${packaging.length} kalem</span>
      </div>
      <div class="section-content" style="padding: 0;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tip</th>
              <th>Malzeme</th>
              <th>Miktar</th>
              <th>B. Fiyat</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${packaging.map((pkg, idx) => {
              const total = (parseFloat(pkg.quantity) || 0) * (parseFloat(pkg.price) || 0);
              return `
            <tr>
              <td><span class="badge badge-gray">${idx + 1}</span></td>
              <td style="font-weight: 600;">${pkg.type}</td>
              <td>${pkg.material || "—"}</td>
              <td>${pkg.quantity} ${pkg.unit || "adet"}</td>
              <td>₺${formatNumber(pkg.price || 0)}</td>
              <td><span class="badge badge-green">₺${formatNumber(total)}</span></td>
            </tr>
              `;
            }).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align: right;">Toplam Ambalaj:</td>
              <td>₺${formatNumber(packagingCostTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ` : ""}
    
    <!-- Box & Label -->
    ${(calculation.formData?.boxType || calculation.formData?.labelType) ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">🏷️</span>
        <h3>Kutu & Etiket</h3>
      </div>
      <div class="section-content" style="padding: 0;">
        <table>
          <thead>
            <tr>
              <th>Tip</th>
              <th>Açıklama</th>
              <th>Adet</th>
              <th>B. Fiyat</th>
              <th>Maliyet</th>
            </tr>
          </thead>
          <tbody>
            ${calculation.formData.boxType ? `
            <tr>
              <td><span class="badge badge-blue">Kutu</span></td>
              <td style="font-weight: 600;">${calculation.formData.boxType}</td>
              <td>${calculation.formData.boxQuantity || 1}</td>
              <td>₺${formatNumber(calculation.formData.boxPrice || 0)}</td>
              <td><span class="badge badge-green">₺${formatNumber(boxCostPerUnit)}</span></td>
            </tr>
            ` : ""}
            ${calculation.formData.labelType ? `
            <tr>
              <td><span class="badge badge-blue">Etiket</span></td>
              <td style="font-weight: 600;">${calculation.formData.labelType}</td>
              <td>${calculation.formData.labelQuantity || 1}</td>
              <td>₺${formatNumber(calculation.formData.labelPrice || 0)}</td>
              <td><span class="badge badge-green">₺${formatNumber(labelCostPerUnit)}</span></td>
            </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}
    
    <!-- Labor -->
    ${laborCostPerUnit > 0 ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">👷</span>
        <h3>İşçilik</h3>
      </div>
      <div class="section-content">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="background: #f9fafb; padding: 10px; border-radius: 6px;">
            <div style="font-size: 7pt; color: #6b7280; text-transform: uppercase;">Birim İşçilik</div>
            <div style="font-size: 12pt; font-weight: 700; color: #111827;">₺${formatNumber(laborCostPerUnit)}</div>
          </div>
          <div style="background: #f9fafb; padding: 10px; border-radius: 6px;">
            <div style="font-size: 7pt; color: #6b7280; text-transform: uppercase;">Toplam İşçilik</div>
            <div style="font-size: 12pt; font-weight: 700; color: #111827;">₺${formatNumber(laborCostTotal)}</div>
          </div>
        </div>
        ${calculation.formData?.laborNotes ? `
        <div style="margin-top: 10px; font-size: 8pt; color: #6b7280; background: #f9fafb; padding: 8px; border-radius: 4px;">
          <strong style="color: #374151;">Not:</strong> ${calculation.formData.laborNotes}
        </div>
        ` : ""}
      </div>
    </div>
    ` : ""}
    
    <!-- Other Costs -->
    ${otherCosts.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">💰</span>
        <h3>Diğer Masraflar</h3>
        <span class="badge">${otherCosts.length} kalem</span>
      </div>
      <div class="section-content" style="padding: 0;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Açıklama</th>
              <th>Kategori</th>
              <th>Tutar</th>
            </tr>
          </thead>
          <tbody>
            ${otherCosts.map((cost, idx) => `
            <tr>
              <td><span class="badge badge-gray">${idx + 1}</span></td>
              <td style="font-weight: 600;">${cost.description}</td>
              <td><span class="badge badge-blue">${categoryLabels[cost.category] || cost.category || "—"}</span></td>
              <td><span class="badge badge-green">₺${formatNumber(cost.amount || 0)}</span></td>
            </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right;">Toplam:</td>
              <td>₺${formatNumber(otherCostsTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ` : ""}
    
    <!-- Summary Section with Prices -->
    <div class="summary-section">
      <div class="summary-header">
        <div class="icon">📊</div>
        <h3>Maliyet ve Fiyat Özeti</h3>
      </div>
      
      <div class="summary-grid">
        <div class="summary-column">
          <h4>Birim Maliyetler (1 Adet)</h4>
          ${ingredients.length > 0 ? `
          <div class="summary-row">
            <span class="label">Hammadde:</span>
            <span class="value">₺${formatNumber(ingredientsCostPerUnit)}</span>
          </div>
          ` : ""}
          ${packaging.length > 0 ? `
          <div class="summary-row">
            <span class="label">Ambalaj:</span>
            <span class="value">₺${formatNumber(packagingCostPerUnit)}</span>
          </div>
          ` : ""}
          ${(boxCostPerUnit + labelCostPerUnit) > 0 ? `
          <div class="summary-row">
            <span class="label">Kutu & Etiket:</span>
            <span class="value">₺${formatNumber(boxCostPerUnit + labelCostPerUnit)}</span>
          </div>
          ` : ""}
          ${laborCostPerUnit > 0 ? `
          <div class="summary-row">
            <span class="label">İşçilik:</span>
            <span class="value">₺${formatNumber(laborCostPerUnit)}</span>
          </div>
          ` : ""}
          ${otherCostsPerUnit > 0 ? `
          <div class="summary-row">
            <span class="label">Diğer:</span>
            <span class="value">₺${formatNumber(otherCostsPerUnit)}</span>
          </div>
          ` : ""}
          <div class="summary-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
            <span class="label" style="font-weight: 600;">Birim Maliyet:</span>
            <span class="value" style="font-weight: 700;">₺${formatNumber(totalCostPerUnit)}</span>
          </div>
          <div class="summary-row profit">
            <span class="label">Kar (%${displayProfitMargin}):</span>
            <span class="value">+₺${formatNumber(profitPerUnit)}</span>
          </div>
          <div class="summary-row total">
            <span class="label">Birim Satış:</span>
            <span class="value">₺${formatNumber(unitPrice)}</span>
          </div>
        </div>
        
        <div class="summary-column">
          <h4>Toplam (${formatNumber(quantity).split(',')[0]} Adet)</h4>
          ${totalIngredientCost > 0 ? `
          <div class="summary-row">
            <span class="label">Hammadde:</span>
            <span class="value">₺${formatNumber(totalIngredientCost)}</span>
          </div>
          ` : ""}
          ${packagingCostTotal > 0 ? `
          <div class="summary-row">
            <span class="label">Ambalaj:</span>
            <span class="value">₺${formatNumber(packagingCostTotal)}</span>
          </div>
          ` : ""}
          ${boxLabelCostTotal > 0 ? `
          <div class="summary-row">
            <span class="label">Kutu & Etiket:</span>
            <span class="value">₺${formatNumber(boxLabelCostTotal)}</span>
          </div>
          ` : ""}
          ${laborCostTotal > 0 ? `
          <div class="summary-row">
            <span class="label">İşçilik:</span>
            <span class="value">₺${formatNumber(laborCostTotal)}</span>
          </div>
          ` : ""}
          ${otherCostsTotal > 0 ? `
          <div class="summary-row">
            <span class="label">Diğer:</span>
            <span class="value">₺${formatNumber(otherCostsTotal)}</span>
          </div>
          ` : ""}
          <div class="summary-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
            <span class="label" style="font-weight: 600;">Toplam Maliyet:</span>
            <span class="value" style="font-weight: 700;">₺${formatNumber(totalCostTotal)}</span>
          </div>
          <div class="summary-row profit">
            <span class="label">Toplam Kar:</span>
            <span class="value">+₺${formatNumber(profitTotal)}</span>
          </div>
          <div class="summary-row total">
            <span class="label">Toplam Satış:</span>
            <span class="value">₺${formatNumber(totalPrice)}</span>
          </div>
        </div>
      </div>
      
      <!-- Final Price Banner -->
      <div class="price-banner">
        <div class="price-box">
          <div class="label">Birim Satış Fiyatı</div>
          <div class="value">₺${formatNumber(unitPrice)}</div>
          <div class="sub">adet başına</div>
        </div>
        <div class="price-box">
          <div class="label">Toplam Satış Fiyatı</div>
          <div class="value">₺${formatNumber(totalPrice)}</div>
          <div class="sub">${formatNumber(quantity).split(',')[0]} adet</div>
        </div>
      </div>
    </div>
    ` : `
    <!-- Summary without prices -->
    <div class="summary-section">
      <div class="summary-header">
        <div class="icon">📋</div>
        <h3>İşlem Özeti</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
          <div style="font-size: 7pt; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Toplam İşlem</div>
          <div style="font-size: 18pt; font-weight: 700; color: #111827;">${selectedOperations.reduce((sum, op) => sum + op.count, 0)}</div>
          <div style="font-size: 7pt; color: #9ca3af;">kalem</div>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
          <div style="font-size: 7pt; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Kategori</div>
          <div style="font-size: 18pt; font-weight: 700; color: #111827;">${selectedOperations.length}</div>
          <div style="font-size: 7pt; color: #9ca3af;">farklı</div>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
          <div style="font-size: 7pt; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Üretim</div>
          <div style="font-size: 18pt; font-weight: 700; color: #111827;">${formatNumber(quantity).split(',')[0]}</div>
          <div style="font-size: 7pt; color: #9ca3af;">adet</div>
        </div>
      </div>
    </div>
    `}
    
    <!-- Notes -->
    ${calculation.formData?.notes ? `
    <div style="margin-top: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 14px;">📝</span>
        <span style="font-size: 9pt; font-weight: 600; color: #92400e;">Notlar</span>
      </div>
      <p style="font-size: 8pt; color: #78350f; line-height: 1.6; white-space: pre-wrap;">${calculation.formData.notes}</p>
    </div>
    ` : ""}
    
    <!-- Footer -->
    <div class="footer">
      <p>Bu belge ${new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} tarihinde oluşturulmuştur.</p>
      <p class="brand">MKN Group - Profesyonel Fiyat Hesaplama Sistemi</p>
    </div>
    
  </div>
</body>
</html>
    `;

    // HTML2PDF API request
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
            top: "8mm",
            right: "8mm",
            bottom: "8mm",
            left: "8mm",
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
        "Content-Disposition": `attachment; filename="hesaplama-${calculation.productName?.replace(/[^a-z0-9]/gi, "_") || "urun"}-${Date.now()}.pdf"`,
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