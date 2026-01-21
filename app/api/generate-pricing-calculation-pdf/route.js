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

    // Calculate ingredient details
    const getIngredientDetails = (ingredients) => {
      if (!ingredients?.length) return [];
      
      const totalVolume = ingredients.reduce((sum, ing) => {
        const amount = parseFloat(ing.amount) || 0;
        const unit = ing.unit || "gram";
        return sum + (unit === "kg" ? amount * 1000 : unit === "ml" ? amount : amount);
      }, 0);

      return ingredients.filter(i => i.name).map((ing) => {
        const amount = parseFloat(ing.amount) || 0;
        const price = parseFloat(ing.price) || 0;
        const unit = ing.unit || "gram";
        const amountInGram = unit === "kg" ? amount * 1000 : unit === "ml" ? amount : amount;
        const kg = amountInGram / 1000;
        const cost = kg * price;
        const percentage = totalVolume > 0 ? ((amountInGram / totalVolume) * 100).toFixed(1) : 0;
        
        return {
          name: ing.name,
          function: ing.function,
          amount,
          unit,
          price,
          cost,
          percentage
        };
      });
    };

    const ingredientDetails = getIngredientDetails(calculation.formData?.ingredients);
    const batchIngredientCost = ingredientDetails.reduce((sum, ing) => sum + ing.cost, 0);
    
    // Formül toplam hacmini hesapla (gram cinsinden)
    const batchVolumeGram = (calculation.formData?.ingredients || []).reduce((sum, ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const unit = ing.unit || "gram";
      return sum + (unit === "kg" ? amount * 1000 : unit === "ml" ? amount : amount);
    }, 0);
    
    // Ürün hacmi (ml varsayılan, gram olarak kabul ediyoruz yoğunluk ~1)
    const productVolumeGram = parseFloat(calculation.productVolume) || 0;
    
    // Bir batch'ten kaç ürün çıkar
    const unitsPerBatch = productVolumeGram > 0 && batchVolumeGram > 0 
      ? batchVolumeGram / productVolumeGram 
      : 1;
    
    // Birim hammadde maliyeti = batch maliyeti / batch'ten çıkan ürün sayısı
    const ingredientsCostPerUnit = batchIngredientCost / unitsPerBatch;
    
    // Toplam hammadde maliyeti = birim maliyet * toplam üretim miktarı
    const totalIngredientCost = ingredientsCostPerUnit * (parseFloat(calculation.quantity) || 1);

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

    // ===== DOĞRU HESAPLAMALAR =====
    const quantity = parseFloat(calculation.quantity) || 1;
    
    // Ambalaj maliyeti hesaplama (birim başına)
    const packagingCostPerUnit = (calculation.formData?.packaging?.filter(p => p.type) || [])
      .reduce((sum, pkg) => sum + ((parseFloat(pkg.quantity) || 0) * (parseFloat(pkg.price) || 0)), 0);
    
    // Kutu maliyeti (birim başına)
    const boxCostPerUnit = (parseFloat(calculation.formData?.boxQuantity) || 0) * (parseFloat(calculation.formData?.boxPrice) || 0);
    
    // Etiket maliyeti (birim başına)
    const labelCostPerUnit = (parseFloat(calculation.formData?.labelQuantity) || 0) * (parseFloat(calculation.formData?.labelPrice) || 0);
    
    // İşçilik maliyeti (birim başına)
    const laborCostPerUnit = parseFloat(calculation.formData?.laborCostPerUnit) || 0;
    
    // Diğer masraflar toplamı
    const otherCostsTotal = (calculation.formData?.otherCosts?.filter(c => c.description) || [])
      .reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    
    // Diğer masraflar birim başına
    const otherCostsPerUnit = otherCostsTotal / quantity;
    
    // Toplam birim maliyet (ingredientsCostPerUnit yukarıda hesaplandı)
    const totalCostPerUnit = ingredientsCostPerUnit + packagingCostPerUnit + boxCostPerUnit + labelCostPerUnit + laborCostPerUnit + otherCostsPerUnit;
    
    // Kar hesaplama
    const profitType = calculation.formData?.profitType || "percentage";
    const profitMarginPercent = parseFloat(calculation.formData?.profitMarginPercent) || 20;
    const profitAmountPerUnit = parseFloat(calculation.formData?.profitAmountPerUnit) || 0;
    
    const profitPerUnit = profitType === "percentage" 
      ? totalCostPerUnit * (profitMarginPercent / 100)
      : profitAmountPerUnit;
    
    // Gösterilecek kar marjı - eğer kar 0 ise, marj da 0 gösterilmeli
    const displayProfitMargin = profitPerUnit > 0 ? profitMarginPercent : 0;
    
    // Birim satış fiyatı
    const unitPrice = totalCostPerUnit + profitPerUnit;
    
    // Toplam değerler
    const totalCostTotal = totalCostPerUnit * quantity;
    const profitTotal = profitPerUnit * quantity;
    const totalPrice = unitPrice * quantity;
    
    // Toplam maliyetler
    const ingredientsCostTotal = totalIngredientCost;
    const packagingCostTotal = packagingCostPerUnit * quantity;
    const boxLabelCostTotal = (boxCostPerUnit + labelCostPerUnit) * quantity;
    const laborCostTotal = laborCostPerUnit * quantity;

    // Modern, minimalist PDF HTML template matching pricing-calculator style
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maliyet Hesaplama - ${calculation.productName || "Ürün"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #374151;
      background: #ffffff;
    }
    
    .container {
      max-width: 100%;
      padding: 30px;
    }
    
    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .header-left {
      flex: 1;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    
    .brand-icon {
      width: 40px;
      height: 40px;
      background: #10b981;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .brand-icon svg {
      width: 22px;
      height: 22px;
      fill: white;
    }
    
    .brand-title {
      font-size: 20pt;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.5px;
    }
    
    .brand-subtitle {
      font-size: 9pt;
      color: #9ca3af;
      margin-top: 2px;
    }
    
    .document-info {
      margin-top: 12px;
    }
    
    .document-info p {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 2px;
    }
    
    .document-info strong {
      color: #374151;
    }
    
    /* Company Info Card */
    .company-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 15px;
      min-width: 220px;
      max-width: 280px;
    }
    
    .company-card h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .company-card p {
      font-size: 9pt;
      color: #4b5563;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .company-card .label {
      color: #6b7280;
      font-weight: 500;
      min-width: 55px;
    }
    
    /* Stats Cards Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }
    
    .stat-card {
      border-radius: 10px;
      padding: 14px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }
    
    .stat-card-label {
      font-size: 8pt;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      color: #6b7280;
    }
    
    .stat-card-value {
      font-size: 16pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #111827;
    }
    
    .stat-card-subtitle {
      font-size: 8pt;
      margin-top: 4px;
      color: #9ca3af;
    }
    
    /* Section Styles */
    .section {
      margin-bottom: 18px;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    
    .section-header {
      padding: 10px 14px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f9fafb;
    }
    
    .section-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      background: #e5e7eb;
    }
    
    .section-title {
      font-size: 10pt;
      font-weight: 600;
      color: #111827;
    }
    
    .section-subtitle {
      font-size: 9pt;
      margin-left: auto;
      color: #6b7280;
    }
    
    .section-content {
      padding: 14px;
    }
    
    /* Product Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    
    .info-grid.two-cols {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .info-item {
      background: #f9fafb;
      border-radius: 6px;
      padding: 10px;
    }
    
    .info-item.full-width {
      grid-column: 1 / -1;
    }
    
    .info-label {
      font-size: 8pt;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 3px;
    }
    
    .info-value {
      font-size: 10pt;
      color: #111827;
      font-weight: 600;
    }
    
    .info-value.description {
      font-size: 9pt;
      font-weight: 400;
      color: #4b5563;
      line-height: 1.5;
    }
    
    /* Table Styles */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    
    .data-table thead tr {
      background: #374151;
    }
    
    .data-table thead th {
      color: white;
      font-weight: 500;
      font-size: 8pt;
      text-align: left;
      padding: 8px 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .data-table thead th:last-child {
      text-align: right;
    }
    
    .data-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    .data-table tbody tr:last-child {
      border-bottom: none;
    }
    
    .data-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .data-table tbody td {
      padding: 8px 10px;
      color: #374151;
      vertical-align: middle;
    }
    
    .data-table tbody td:last-child {
      text-align: right;
      font-weight: 600;
      color: #111827;
    }
    
    .data-table tfoot tr {
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    
    .data-table tfoot td {
      padding: 10px;
      font-weight: 600;
      font-size: 9pt;
      color: #111827;
    }
    
    /* Badge Styles */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 500;
      background: #f3f4f6;
      color: #374151;
    }
    
    .badge.num {
      background: #e5e7eb;
      color: #6b7280;
    }
    
    .badge.green {
      background: #ecfdf5;
      color: #059669;
    }
    
    /* Notes Section */
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 18px;
    }
    
    .notes-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .notes-icon {
      width: 22px;
      height: 22px;
      background: #fbbf24;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
    }
    
    .notes-title {
      font-size: 9pt;
      font-weight: 600;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .notes-content {
      font-size: 9pt;
      color: #78350f;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    
    /* Summary Section - Final */
    .summary-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      margin-top: 18px;
    }
    
    .summary-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-icon {
      width: 32px;
      height: 32px;
      background: #10b981;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    }
    
    .summary-title {
      font-size: 12pt;
      font-weight: 600;
      color: #111827;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .summary-column {
      background: white;
      border-radius: 8px;
      padding: 14px;
      border: 1px solid #e5e7eb;
    }
    
    .summary-column-title {
      font-size: 8pt;
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
      align-items: center;
      padding: 5px 0;
      font-size: 9pt;
    }
    
    .summary-row.divider {
      padding-top: 8px;
      margin-top: 5px;
      border-top: 1px dashed #e5e7eb;
    }
    
    .summary-row.total {
      padding-top: 10px;
      margin-top: 6px;
      border-top: 1px solid #10b981;
    }
    
    .summary-label {
      color: #6b7280;
      font-weight: 400;
    }
    
    .summary-value {
      color: #111827;
      font-weight: 600;
    }
    
    .summary-row.profit .summary-label,
    .summary-row.profit .summary-value {
      color: #059669;
    }
    
    .summary-row.total .summary-label {
      font-size: 9pt;
      font-weight: 600;
      color: #111827;
    }
    
    .summary-row.total .summary-value {
      font-size: 12pt;
      font-weight: 700;
      color: #10b981;
    }
    
    /* Final Price Banner */
    .final-price-banner {
      background: #10b981;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .price-box {
      text-align: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
    }
    
    .price-box-label {
      font-size: 8pt;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    
    .price-box-value {
      font-size: 20pt;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }
    
    .price-box-subtitle {
      font-size: 8pt;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 2px;
    }
    
    /* Footer */
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-text {
      font-size: 8pt;
      color: #9ca3af;
      margin-bottom: 2px;
    }
    
    .footer-brand {
      font-size: 8pt;
      font-weight: 500;
      color: #6b7280;
    }
    
    /* Page Break */
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .section {
        break-inside: avoid;
      }
      
      .summary-section {
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
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
          </div>
          <div>
            <div class="brand-title">Maliyet Hesaplama</div>
            <div class="brand-subtitle">Profesyonel Fiyatlandırma Raporu</div>
          </div>
        </div>
        <div class="document-info">
          <p><strong>Ürün:</strong> ${calculation.productName || "Belirtilmemiş"}</p>
          <p><strong>Tarih:</strong> ${formatDate(calculation.createdAt?.seconds * 1000 || Date.now())}</p>
          <p><strong>Referans No:</strong> #${Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>
      
      ${companyData ? `
      <div class="company-card">
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#166534">
            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
          </svg>
          ${companyData.name || ""}
        </h3>
        ${companyData.contactPerson ? `<p><span class="label">Yetkili:</span> ${companyData.contactPerson}</p>` : ""}
        ${companyData.email ? `<p><span class="label">E-posta:</span> ${companyData.email}</p>` : ""}
        ${companyData.phone ? `<p><span class="label">Telefon:</span> ${companyData.phone}</p>` : ""}
        ${companyData.address ? `<p><span class="label">Adres:</span> ${companyData.address}</p>` : ""}
      </div>
      ` : ""}
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card blue">
        <div class="stat-card-label">Üretim Miktarı</div>
        <div class="stat-card-value">${formatNumber(quantity).split(',')[0]}</div>
        <div class="stat-card-subtitle">adet ürün</div>
      </div>
      
      <div class="stat-card purple">
        <div class="stat-card-label">Birim Maliyet</div>
        <div class="stat-card-value">₺${formatNumber(totalCostPerUnit)}</div>
        <div class="stat-card-subtitle">adet başına</div>
      </div>
      
      <div class="stat-card orange">
        <div class="stat-card-label">Kar Marjı</div>
        <div class="stat-card-value">%${displayProfitMargin}</div>
        <div class="stat-card-subtitle">+₺${formatNumber(profitPerUnit)}/adet</div>
      </div>
      
      <div class="stat-card green">
        <div class="stat-card-label">Birim Satış Fiyatı</div>
        <div class="stat-card-value">₺${formatNumber(unitPrice)}</div>
        <div class="stat-card-subtitle">nihai fiyat</div>
      </div>
    </div>

    <!-- Product Information -->
    <div class="section">
      <div class="section-header blue">
        <div class="section-icon blue">📦</div>
        <div class="section-title">Ürün Bilgileri</div>
      </div>
      <div class="section-content">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Ürün Adı</div>
            <div class="info-value">${calculation.productName || "Belirtilmemiş"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Ürün Tipi</div>
            <div class="info-value">${productTypeLabels[calculation.productType] || calculation.productType || "Belirtilmemiş"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Üretim Miktarı</div>
            <div class="info-value">${formatNumber(calculation.quantity || 0).split(',')[0]} adet</div>
          </div>
          ${calculation.productVolume ? `
          <div class="info-item">
            <div class="info-label">Ürün Hacmi</div>
            <div class="info-value">${calculation.productVolume} ml</div>
          </div>
          ` : ""}
          ${calculation.formData?.sourceFormulaName ? `
          <div class="info-item">
            <div class="info-label">Kaynak Formül</div>
            <div class="info-value">${calculation.formData.sourceFormulaName}</div>
          </div>
          ` : ""}
          ${calculation.description ? `
          <div class="info-item full-width">
            <div class="info-label">Ürün Açıklaması</div>
            <div class="info-value description">${calculation.description}</div>
          </div>
          ` : ""}
        </div>
      </div>
    </div>

    ${showCostDetails ? `
    <!-- Ingredients Section -->
    ${ingredientDetails.length > 0 ? `
    <div class="section">
      <div class="section-header purple">
        <div class="section-icon purple">🧪</div>
        <div class="section-title">Hammadde Bileşenleri</div>
        <div class="section-subtitle">${ingredientDetails.length} hammadde</div>
      </div>
      <div class="section-content" style="padding: 0;">
        <table class="data-table purple">
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Hammadde Adı</th>
              <th>Fonksiyon</th>
              <th>Miktar</th>
              <th>Oran</th>
              <th>Birim Fiyat</th>
              <th>Maliyet</th>
            </tr>
          </thead>
          <tbody>
            ${ingredientDetails.map((ing, index) => `
            <tr>
              <td><span class="badge purple">${index + 1}</span></td>
              <td style="font-weight: 600; color: #1f2937;">${ing.name}</td>
              <td>${ing.function ? `<span class="badge blue">${functionLabels[ing.function] || ing.function}</span>` : "-"}</td>
              <td>${ing.amount} ${ing.unit}</td>
              <td>${ing.percentage > 0 ? `<span class="badge purple">${ing.percentage}%</span>` : "-"}</td>
              <td>₺${formatNumber(ing.price)}/kg</td>
              <td><span class="badge green">₺${formatNumber(ing.cost)}</span></td>
            </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align: right;">TOPLAM HAMMADDE MALİYETİ:</td>
              <td>₺${formatNumber(totalIngredientCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ` : ""}

    <!-- Packaging Section -->
    ${calculation.formData?.packaging?.filter(p => p.type).length > 0 ? `
    <div class="section">
      <div class="section-header orange">
        <div class="section-icon orange">📦</div>
        <div class="section-title">Ambalaj Malzemeleri</div>
        <div class="section-subtitle">${calculation.formData.packaging.filter(p => p.type).length} kalem</div>
      </div>
      <div class="section-content" style="padding: 0;">
        <table class="data-table orange">
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Ambalaj Tipi</th>
              <th>Malzeme</th>
              <th>Tedarikçi</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${calculation.formData.packaging.filter(p => p.type).map((pkg, index) => {
              const total = (parseFloat(pkg.quantity) || 0) * (parseFloat(pkg.price) || 0);
              return `
            <tr>
              <td><span class="badge orange">${index + 1}</span></td>
              <td style="font-weight: 600; color: #1f2937;">${pkg.type}</td>
              <td>${pkg.material || "-"}</td>
              <td>${pkg.supplier || "-"}</td>
              <td>${pkg.quantity} ${pkg.unit}</td>
              <td>₺${formatNumber(pkg.price)}</td>
              <td><span class="badge green">₺${formatNumber(total)}</span></td>
            </tr>
              `;
            }).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align: right;">TOPLAM AMBALAJ MALİYETİ:</td>
              <td>₺${formatNumber(calculation.formData.packaging.filter(p => p.type).reduce((sum, pkg) => sum + ((parseFloat(pkg.quantity) || 0) * (parseFloat(pkg.price) || 0)), 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ` : ""}

    <!-- Box and Label Section -->
    ${calculation.formData?.boxType || calculation.formData?.labelType ? `
    <div class="section">
      <div class="section-header pink">
        <div class="section-icon pink">🏷️</div>
        <div class="section-title">Kutu ve Etiket</div>
      </div>
      <div class="section-content" style="padding: 0;">
        <table class="data-table pink">
          <thead>
            <tr>
              <th>Tip</th>
              <th>Açıklama</th>
              <th>Miktar (Ürün Başına)</th>
              <th>Birim Fiyat</th>
              <th>Ürün Başına Maliyet</th>
            </tr>
          </thead>
          <tbody>
            ${calculation.formData.boxType ? `
            <tr>
              <td><span class="badge pink">Kutu</span></td>
              <td style="font-weight: 600;">${calculation.formData.boxType}</td>
              <td>${calculation.formData.boxQuantity || 1} adet</td>
              <td>₺${formatNumber(calculation.formData.boxPrice || 0)}</td>
              <td><span class="badge green">₺${formatNumber((parseFloat(calculation.formData.boxQuantity) || 1) * (parseFloat(calculation.formData.boxPrice) || 0))}</span></td>
            </tr>
            ` : ""}
            ${calculation.formData.labelType ? `
            <tr>
              <td><span class="badge pink">Etiket</span></td>
              <td style="font-weight: 600;">${calculation.formData.labelType}</td>
              <td>${calculation.formData.labelQuantity || 1} adet</td>
              <td>₺${formatNumber(calculation.formData.labelPrice || 0)}</td>
              <td><span class="badge green">₺${formatNumber((parseFloat(calculation.formData.labelQuantity) || 1) * (parseFloat(calculation.formData.labelPrice) || 0))}</span></td>
            </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}

    <!-- Labor Cost Section -->
    ${calculation.formData?.laborCostPerUnit ? `
    <div class="section">
      <div class="section-header cyan">
        <div class="section-icon cyan">👷</div>
        <div class="section-title">İşçilik Maliyeti</div>
      </div>
      <div class="section-content">
        <div class="info-grid two-cols">
          <div class="info-item">
            <div class="info-label">Birim İşçilik Maliyeti</div>
            <div class="info-value">₺${formatNumber(calculation.formData.laborCostPerUnit)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Toplam İşçilik Maliyeti</div>
            <div class="info-value">₺${formatNumber((parseFloat(calculation.formData.laborCostPerUnit) || 0) * (parseFloat(calculation.quantity) || 1))}</div>
          </div>
          ${calculation.formData.laborNotes ? `
          <div class="info-item full-width">
            <div class="info-label">İşçilik Notları</div>
            <div class="info-value description">${calculation.formData.laborNotes}</div>
          </div>
          ` : ""}
        </div>
      </div>
    </div>
    ` : ""}

    <!-- Other Costs Section -->
    ${calculation.formData?.otherCosts?.filter(c => c.description).length > 0 ? `
    <div class="section">
      <div class="section-header violet">
        <div class="section-icon violet">💰</div>
        <div class="section-title">Diğer Masraflar</div>
        <div class="section-subtitle">${calculation.formData.otherCosts.filter(c => c.description).length} kalem</div>
      </div>
      <div class="section-content" style="padding: 0;">
        <table class="data-table violet">
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Açıklama</th>
              <th>Kategori</th>
              <th>Tutar</th>
            </tr>
          </thead>
          <tbody>
            ${calculation.formData.otherCosts.filter(c => c.description).map((cost, index) => `
            <tr>
              <td><span class="badge purple">${index + 1}</span></td>
              <td style="font-weight: 600;">${cost.description}</td>
              <td><span class="badge blue">${categoryLabels[cost.category] || cost.category}</span></td>
              <td><span class="badge green">₺${formatNumber(cost.amount || 0)}</span></td>
            </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right;">TOPLAM DİĞER MASRAFLAR:</td>
              <td>₺${formatNumber(calculation.formData.otherCosts.filter(c => c.description).reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ` : ""}
    ` : ""}

    <!-- Notes Section -->
    ${calculation.formData?.notes ? `
    <div class="notes-box">
      <div class="notes-header">
        <div class="notes-icon">📝</div>
        <div class="notes-title">Özel Notlar</div>
      </div>
      <div class="notes-content">${calculation.formData.notes}</div>
    </div>
    ` : ""}

    <!-- Final Summary Section -->
    <div class="summary-section">
      <div class="summary-header">
        <div class="summary-icon">📊</div>
        <div class="summary-title">Maliyet ve Fiyat Özeti</div>
      </div>
      
      <div class="summary-grid">
        <!-- Unit Costs Column -->
        <div class="summary-column">
          <div class="summary-column-title">Birim Maliyetler (1 Adet)</div>
          <div class="summary-row">
            <span class="summary-label">Hammadde:</span>
            <span class="summary-value">₺${formatNumber(ingredientsCostPerUnit)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Ambalaj:</span>
            <span class="summary-value">₺${formatNumber(packagingCostPerUnit)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Kutu:</span>
            <span class="summary-value">₺${formatNumber(boxCostPerUnit)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Etiket:</span>
            <span class="summary-value">₺${formatNumber(labelCostPerUnit)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">İşçilik:</span>
            <span class="summary-value">₺${formatNumber(laborCostPerUnit)}</span>
          </div>
          <div class="summary-row divider">
            <span class="summary-label" style="font-weight: 700; color: #111827;">Birim Maliyet:</span>
            <span class="summary-value" style="font-weight: 700; color: #111827;">₺${formatNumber(totalCostPerUnit)}</span>
          </div>
          <div class="summary-row profit">
            <span class="summary-label">Kar (+%${displayProfitMargin}):</span>
            <span class="summary-value">+₺${formatNumber(profitPerUnit)}</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">Birim Satış Fiyatı:</span>
            <span class="summary-value">₺${formatNumber(unitPrice)}</span>
          </div>
        </div>

        <!-- Total Costs Column -->
        <div class="summary-column">
          <div class="summary-column-title">Toplam Maliyetler (${formatNumber(quantity).split(',')[0]} Adet)</div>
          <div class="summary-row">
            <span class="summary-label">Hammadde:</span>
            <span class="summary-value">₺${formatNumber(totalIngredientCost)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Ambalaj:</span>
            <span class="summary-value">₺${formatNumber(packagingCostTotal)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Kutu + Etiket:</span>
            <span class="summary-value">₺${formatNumber(boxLabelCostTotal)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">İşçilik:</span>
            <span class="summary-value">₺${formatNumber(laborCostTotal)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Diğer Masraflar:</span>
            <span class="summary-value">₺${formatNumber(otherCostsTotal)}</span>
          </div>
          <div class="summary-row divider">
            <span class="summary-label" style="font-weight: 700; color: #111827;">Toplam Maliyet:</span>
            <span class="summary-value" style="font-weight: 700; color: #111827;">₺${formatNumber(totalCostTotal)}</span>
          </div>
          <div class="summary-row profit">
            <span class="summary-label">Toplam Kar:</span>
            <span class="summary-value">+₺${formatNumber(profitTotal)}</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">Toplam Satış Fiyatı:</span>
            <span class="summary-value">₺${formatNumber(totalPrice)}</span>
          </div>
        </div>

        <!-- Summary Info Column -->
        <div class="summary-column">
          <div class="summary-column-title">Genel Bilgiler</div>
          <div class="summary-row">
            <span class="summary-label">Ürün Tipi:</span>
            <span class="summary-value">${productTypeLabels[calculation.productType] || calculation.productType || "-"}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Üretim Miktarı:</span>
            <span class="summary-value">${formatNumber(quantity).split(',')[0]} adet</span>
          </div>
          ${calculation.productVolume ? `
          <div class="summary-row">
            <span class="summary-label">Ürün Hacmi:</span>
            <span class="summary-value">${calculation.productVolume} ml</span>
          </div>
          ` : ""}
          <div class="summary-row">
            <span class="summary-label">Kar Türü:</span>
            <span class="summary-value">${calculation.formData?.profitType === "fixed" ? "Sabit Tutar" : "Yüzde"}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Kar Oranı:</span>
            <span class="summary-value">%${displayProfitMargin}</span>
          </div>
          <div class="summary-row divider">
            <span class="summary-label">Hammadde Sayısı:</span>
            <span class="summary-value">${ingredientDetails.length} adet</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Ambalaj Sayısı:</span>
            <span class="summary-value">${calculation.formData?.packaging?.filter(p => p.type).length || 0} adet</span>
          </div>
          ${calculation.formData?.sourceFormulaName ? `
          <div class="summary-row">
            <span class="summary-label">Formül:</span>
            <span class="summary-value">${calculation.formData.sourceFormulaName}</span>
          </div>
          ` : ""}
        </div>
      </div>

      <!-- Final Price Banner -->
      <div class="final-price-banner">
        <div class="price-box">
          <div class="price-box-label">Birim Satış Fiyatı</div>
          <div class="price-box-value">₺${formatNumber(unitPrice)}</div>
          <div class="price-box-subtitle">adet başına fiyat</div>
        </div>
        <div class="price-box">
          <div class="price-box-label">Toplam Satış Fiyatı</div>
          <div class="price-box-value">₺${formatNumber(totalPrice)}</div>
          <div class="price-box-subtitle">${formatNumber(quantity).split(',')[0]} adet için toplam</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">Bu belge ${new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} tarihinde otomatik olarak oluşturulmuştur.</p>
      <p class="footer-brand">MKN Group - Profesyonel Fiyat Hesaplama Sistemi</p>
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
        "Content-Disposition": `attachment; filename="maliyet-hesaplama-${calculation.productName?.replace(/[^a-z0-9]/gi, "_") || "urun"}-${Date.now()}.pdf"`,
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
