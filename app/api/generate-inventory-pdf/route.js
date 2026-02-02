import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { items, filters, warehouseName } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Ürün verisi gereklidir" },
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

    // PDF HTML template'ini oluştur
    const htmlContent = generateInventoryPDFHTML(items, filters, warehouseName, logoBase64);

    // HTML2PDF API ile PDF oluştur
    const apiKey = process.env.HTML2PDF_API_KEY;

    if (!apiKey) {
      throw new Error("HTML2PDF API key not found");
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
            top: "10mm",
            right: "10mm",
            bottom: "10mm",
            left: "10mm",
          },
          displayHeaderFooter: false,
          preferCSSPageSize: true,
        },
      },
      {
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTML2PDF API failed: ${response.status}`);
    }

    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(Buffer.from(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="envanter-raporu-${date}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Envanter PDF oluşturma hatası:", error);

    return NextResponse.json(
      {
        error: "PDF oluşturulurken bir hata oluştu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function generateInventoryPDFHTML(items, filters = {}, warehouseName, logoBase64) {
  const formatNumber = (value) => {
    return new Intl.NumberFormat("tr-TR").format(value || 0);
  };

  // TL simgesi font'ta desteklenmediği için metin kullanıyoruz
  const formatCurrency = (value, currency = "TRY") => {
    const formatted = new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
    
    // Para birimi simgesi
    const currencySymbols = {
      TRY: "TL",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    const symbol = currencySymbols[currency] || currency;
    
    // USD, EUR, GBP için simge önde, TL için sonda
    if (currency === "TRY") {
      return `${formatted} ${symbol}`;
    }
    return `${symbol}${formatted}`;
  };

  const currentDate = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Kategori label'ları
  const categoryLabels = {
    packaging: "Ambalaj",
    raw_material: "Hammadde",
    finished_product: "Mamül",
    semi_finished: "Yarı Mamül",
    customer_goods: "Müşteri Malı",
    auxiliary_material: "Yardımcı Malzeme",
    chemical: "Kimyasal",
    other: "Diğer",
  };

  // Birim label'ları
  const unitLabels = {
    piece: "Adet",
    kg: "Kg",
    gram: "Gram",
    liter: "Litre",
    ml: "mL",
    meter: "Metre",
    box: "Kutu",
    pack: "Paket",
    pallet: "Palet",
    set: "Set",
  };

  // Toplam hesapla - para birimine göre grupla
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (item.stock?.quantity || 0), 0);
  
  // Para birimine göre toplam değerler
  const totalsByCurrency = items.reduce((acc, item) => {
    const qty = item.stock?.quantity || 0;
    const price = item.pricing?.costPrice || 0;
    const currency = item.pricing?.currency || "TRY";
    const value = qty * price;
    
    if (!acc[currency]) acc[currency] = 0;
    acc[currency] += value;
    return acc;
  }, {});

  // Toplam değer gösterimi - eğer tek para birimi varsa direkt göster, yoksa hepsini listele
  const currencyKeys = Object.keys(totalsByCurrency);
  let totalValueDisplay = "";
  if (currencyKeys.length === 1) {
    totalValueDisplay = formatCurrency(totalsByCurrency[currencyKeys[0]], currencyKeys[0]);
  } else {
    totalValueDisplay = currencyKeys
      .map(curr => formatCurrency(totalsByCurrency[curr], curr))
      .join("<br>");
  }

  // Filtre açıklaması oluştur
  const filterDescriptions = [];
  if (filters.category && filters.category !== "all") {
    filterDescriptions.push(`Kategori: ${categoryLabels[filters.category] || filters.category}`);
  }
  if (filters.ownership && filters.ownership !== "all") {
    filterDescriptions.push(`Sahiplik: ${filters.ownership === "mkn" ? "MKN" : "Müşteri"}`);
  }
  if (filters.search) {
    filterDescriptions.push(`Arama: "${filters.search}"`);
  }
  if (warehouseName) {
    filterDescriptions.push(`Depo: ${warehouseName}`);
  }

  // Tablo satırlarını oluştur
  const tableRows = items.map((item, index) => {
    const quantity = item.stock?.quantity || 0;
    const unitPrice = item.pricing?.costPrice || 0;
    const totalPrice = quantity * unitPrice;
    const unit = unitLabels[item.stock?.unit] || item.stock?.unit || "Adet";
    const size = item.specifications?.size || "-";
    const currency = item.pricing?.currency || "TRY";

    return `
      <tr class="${index % 2 === 0 ? 'even-row' : 'odd-row'}">
        <td class="td-name">
          <div class="item-name">${item.name || "-"}</div>
          <div class="item-meta">${item.sku || ""} ${size !== "-" ? `• ${size}` : ""}</div>
        </td>
        <td class="td-qty">${formatNumber(quantity)}</td>
        <td class="td-unit">${unit}</td>
        <td class="td-price">${formatCurrency(unitPrice, currency)}</td>
        <td class="td-total">${formatCurrency(totalPrice, currency)}</td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Envanter Raporu</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 10mm;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .container {
          width: 100%;
          padding: 10px;
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #2563eb;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo {
          height: 35px;
          width: auto;
        }
        
        .title-section h1 {
          font-size: 16px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 2px;
        }
        
        .title-section p {
          font-size: 9px;
          color: #666;
        }
        
        .header-right {
          text-align: right;
        }
        
        .report-date {
          font-size: 9px;
          color: #666;
        }
        
        .filter-info {
          font-size: 8px;
          color: #999;
          margin-top: 3px;
        }
        
        /* Table */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
          margin-bottom: 15px;
        }
        
        thead {
          background: #1e40af;
        }
        
        th {
          color: white;
          font-weight: 600;
          padding: 8px 6px;
          text-align: left;
          font-size: 8px;
          text-transform: uppercase;
        }
        
        th.th-right {
          text-align: right;
        }
        
        td {
          padding: 6px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        
        .even-row {
          background-color: #fff;
        }
        
        .odd-row {
          background-color: #f9fafb;
        }
        
        .td-name {
          max-width: 200px;
        }
        
        .item-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 9px;
        }
        
        .item-meta {
          font-size: 7px;
          color: #9ca3af;
          margin-top: 1px;
        }
        
        .td-qty, .td-unit {
          text-align: center;
          font-size: 9px;
        }
        
        .td-qty {
          font-weight: 600;
          color: #1f2937;
        }
        
        .td-unit {
          color: #6b7280;
        }
        
        .td-price, .td-total {
          text-align: right;
          font-size: 9px;
        }
        
        .td-price {
          color: #6b7280;
        }
        
        .td-total {
          font-weight: 600;
          color: #1f2937;
        }
        
        /* Summary */
        .summary {
          padding: 12px 15px;
          background: #f3f4f6;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .summary-left {
          display: flex;
          gap: 25px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-label {
          font-size: 7px;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        
        .summary-value {
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
        }
        
        .summary-value.total {
          font-size: 16px;
          color: #059669;
        }
        
        /* Footer */
        .footer {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            ${logoBase64 ? `<img src="${logoBase64}" alt="MKN Group" class="logo" />` : ''}
            <div class="title-section">
              <h1>Envanter Stok Raporu</h1>
              <p>MKN Group - Depo Yönetim Sistemi</p>
            </div>
          </div>
          <div class="header-right">
            <div class="report-date">${currentDate}</div>
            ${filterDescriptions.length > 0 ? `<div class="filter-info">${filterDescriptions.join(' • ')}</div>` : ''}
          </div>
        </div>
        
        <!-- Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 45%">Ürün Bilgisi</th>
              <th class="th-right" style="width: 12%">Miktar</th>
              <th style="width: 10%">Birim</th>
              <th class="th-right" style="width: 15%">Birim Fiyat</th>
              <th class="th-right" style="width: 18%">Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <!-- Summary -->
        <div class="summary">
          <div class="summary-left">
            <div class="summary-item">
              <div class="summary-label">Toplam Çeşit</div>
              <div class="summary-value">${formatNumber(totalItems)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Toplam Adet</div>
              <div class="summary-value">${formatNumber(totalQuantity)}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Toplam Stok Değeri</div>
            <div class="summary-value total">${totalValueDisplay}</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <span>Rapor Tarihi: ${currentDate}</span>
          <span>MKN Group Envanter Sistemi</span>
        </div>
      </div>
    </body>
    </html>
  `;
}
