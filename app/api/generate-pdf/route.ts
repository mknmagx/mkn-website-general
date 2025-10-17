import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export async function POST(request: NextRequest) {
  try {
    console.log("PDF generation API called");

    const body = await request.json();
    console.log("Request body received:", {
      hasProforma: !!body.proforma,
      proformaNumber: body.proforma?.proformaNumber,
    });

    const { proforma, companyData } = body;

    if (!proforma) {
      throw new Error("Proforma data is required");
    }

    // Güvenli metin formatı
    const formatText = (text: string | null | undefined): string => {
      if (!text) return "Belirtilmemiş";
      return String(text).trim() || "Belirtilmemiş";
    };

    // Para birimi formatı
    const formatCurrency = (amount: number, currency = "TRY"): string => {
      const numAmount = Number(amount) || 0;

      if (currency === "TRY") {
        return `${numAmount.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ₺`;
      }

      const symbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
      };

      const symbol = symbols[currency] || currency;
      return `${symbol}${numAmount.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    // Tarih formatı
    const convertFirestoreDate = (dateValue: any) => {
      if (!dateValue) return null;

      if (dateValue && typeof dateValue === "object" && dateValue.seconds) {
        return new Date(dateValue.seconds * 1000);
      }

      if (dateValue instanceof Date) {
        return dateValue;
      }

      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        return null;
      }
    };

    // Ultra-Modern Minimalist HTML template with Tailwind CSS
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proforma - ${proforma.proformaNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif']
                },
                colors: {
                  primary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a'
                  }
                }
              }
            }
          }
        </script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          .table-stripe:nth-child(even) {
            background-color: #f8fafc;
          }
          .print-page {
            max-width: 210mm;
            min-height: 297mm;
          }
        </style>
    </head>
    <body class="font-sans text-sm text-primary-900 bg-white leading-relaxed">
        <div class="print-page mx-auto bg-white">
            <!-- Header -->
            <div class="flex justify-between items-start p-6 border-b border-primary-200">
                <div class="flex items-center gap-3 flex-1">
                    <img src="${
                      process.env.NEXTAUTH_URL || "http://localhost:3000"
                    }/MKN-GROUP-LOGO.png" alt="MKN GROUP" class="h-8 w-auto">
                    <div class="flex-1">
                        <div class="text-xl font-bold text-primary-900 mb-0.5 tracking-tight">MKN GROUP</div>
                        <div class="text-xs text-primary-500 mb-2 font-medium">Professional Business Solutions</div>
                        <div class="text-xs text-primary-500 leading-snug font-medium">
                            <div>Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul</div>
                            <div>+90 531 494 25 94 • info@mkngroup.com.tr • www.mkngroup.com.tr</div>
                        </div>
                    </div>
                </div>
                <div class="text-right min-w-[180px]">
                    <div class="text-xs uppercase tracking-wider text-primary-500 mb-1 font-semibold">Proforma Invoice</div>
                    <div class="text-2xl font-extrabold text-primary-900 mb-2 tracking-tight">${
                      proforma.proformaNumber
                    }</div>
                    <div class="text-xs text-primary-500 leading-snug font-medium">
                        <div>Tarih: ${format(
                          new Date(
                            proforma.createdAt?.seconds * 1000 || Date.now()
                          ),
                          "dd.MM.yyyy",
                          { locale: tr }
                        )}</div>
                        ${
                          proforma.validUntil
                            ? `<div>Geçerlilik: ${(() => {
                                const date = convertFirestoreDate(
                                  proforma.validUntil
                                );
                                return date
                                  ? format(date, "dd.MM.yyyy", { locale: tr })
                                  : "—";
                              })()}</div>`
                            : ""
                        }
                    </div>
                </div>
            </div>

            <div class="p-6">
                <!-- Fatura Bilgileri -->
                <div class="mb-5">
                    <div class="text-sm font-bold text-primary-900 mb-3 tracking-tight pb-1 border-b-2 border-primary-800">Fatura Bilgileri</div>
                    <div class="grid grid-cols-2 gap-5 mb-5">
                        <div>
                            <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-1.5 font-bold">Müşteri Bilgileri</h3>
                            <p class="text-xs text-primary-900 leading-snug mb-0.5 font-medium"><strong class="font-bold">${formatText(
                              proforma.customerInfo?.companyName
                            )}</strong></p>
                            <p class="text-xs text-primary-900 leading-snug mb-0.5 font-medium">${formatText(
                              proforma.customerInfo?.contactPerson
                            )}</p>
                            <p class="text-xs text-primary-900 leading-snug mb-0.5 font-medium">${formatText(
                              proforma.customerInfo?.phone
                            )}</p>
                            <p class="text-xs text-primary-900 leading-snug mb-0.5 font-medium">${formatText(
                              proforma.customerInfo?.email
                            )}</p>
                        </div>
                        <div>
                            <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-1.5 font-bold">Adres</h3>
                            <p class="text-xs text-primary-900 leading-snug mb-0.5 font-medium">${formatText(
                              proforma.customerInfo?.address ||
                                "Adres belirtilmemiş"
                            )}</p>
                        </div>
                    </div>
                </div>

                <!-- Hizmetler -->
                <div class="mb-5">
                    <div class="text-sm font-bold text-primary-900 mb-3 tracking-tight pb-1 border-b-2 border-primary-800">Hizmet Detayları</div>
                    <table class="w-full border-collapse my-4 bg-white border border-primary-200 rounded-lg overflow-hidden">
                        <thead>
                            <tr>
                                <th class="bg-primary-50 p-2.5 text-left text-xs font-bold text-primary-900 uppercase tracking-wider border-b border-r border-primary-200">Hizmet</th>
                                <th class="bg-primary-50 p-2.5 text-right text-xs font-bold text-primary-900 uppercase tracking-wider border-b border-r border-primary-200">Miktar</th>
                                <th class="bg-primary-50 p-2.5 text-right text-xs font-bold text-primary-900 uppercase tracking-wider border-b border-r border-primary-200">Birim Fiyat</th>
                                <th class="bg-primary-50 p-2.5 text-right text-xs font-bold text-primary-900 uppercase tracking-wider border-b">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(proforma.services || [])
                              .map(
                                (service: any) => `
                            <tr class="table-stripe">
                                <td class="p-2.5 text-xs text-primary-900 border-b border-r border-primary-200 align-top font-medium leading-tight">
                                    <div class="font-semibold">${formatText(
                                      service.name
                                    )}</div>
                                    ${
                                      service.description
                                        ? `<div class="text-xs text-primary-500 mt-0.5">${formatText(
                                            service.description
                                          )}</div>`
                                        : ""
                                    }
                                </td>
                                <td class="p-2.5 text-xs text-primary-900 border-b border-r border-primary-200 align-top font-medium text-right">${
                                  service.quantity || 0
                                } ${service.unit || "adet"}</td>
                                <td class="p-2.5 text-xs text-primary-900 border-b border-r border-primary-200 align-top font-medium text-right">${formatCurrency(
                                  service.unitPrice || 0,
                                  proforma.currency
                                )}</td>
                                <td class="p-2.5 text-xs text-primary-900 border-b border-primary-200 align-top font-semibold text-right">${formatCurrency(
                                  (service.quantity || 0) *
                                    (service.unitPrice || 0),
                                  proforma.currency
                                )}</td>
                            </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>

                <!-- Toplam -->
                <div class="mt-4 pt-3 border-t-2 border-primary-200">
                    <table class="w-full max-w-[280px] ml-auto border border-primary-200 rounded-lg overflow-hidden">
                        <tr>
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-500 text-right pr-4 bg-primary-50">Ara Toplam</td>
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-900 text-right bg-white">${formatCurrency(
                              proforma.totalAmount || 0,
                              proforma.currency
                            )}</td>
                        </tr>
                        ${
                          proforma.discountRate && proforma.discountRate > 0
                            ? `
                        <tr>
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-500 text-right pr-4 bg-primary-50">İndirim (%${
                              proforma.discountRate
                            })</td>
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-900 text-right bg-white">-${formatCurrency(
                              (proforma.totalAmount || 0) *
                                (proforma.discountRate / 100),
                              proforma.currency
                            )}</td>
                        </tr>
                        `
                            : ""
                        }
                        ${
                          proforma.taxRate && proforma.taxRate > 0
                            ? `
                        <tr>
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-500 text-right pr-4 bg-primary-50">KDV (%${
                              proforma.taxRate
                            })</td>
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-900 text-right bg-white">${formatCurrency(
                              (proforma.totalAmount || 0) *
                                (proforma.taxRate / 100),
                              proforma.currency
                            )}</td>
                        </tr>
                        `
                            : ""
                        }
                        <tr>
                            <td class="px-3 py-2 text-xs font-extrabold text-white bg-primary-900 text-right border-t-2 border-primary-900">TOPLAM</td>
                            <td class="px-3 py-2 text-xs font-extrabold text-white bg-primary-900 text-right border-t-2 border-primary-900">${formatCurrency(
                              (proforma.totalAmount || 0) -
                                (proforma.totalAmount || 0) *
                                  ((proforma.discountRate || 0) / 100) +
                                (proforma.totalAmount || 0) *
                                  ((proforma.taxRate || 0) / 100),
                              proforma.currency
                            )}</td>
                        </tr>
                    </table>
                </div>

                <!-- Şartlar ve Notlar -->
                ${
                  proforma.terms || proforma.notes || proforma.termsConfig
                    ? `
                <div class="mb-5">
                    <div class="text-sm font-bold text-primary-900 mb-3 tracking-tight pb-1 border-b-2 border-primary-800">Şartlar ve Koşullar</div>
                    ${
                      proforma.terms
                        ? `<div class="mb-4">
                            <div class="text-xs leading-relaxed whitespace-pre-line text-primary-900">${formatText(
                              proforma.terms
                            )}</div>
                           </div>`
                        : ""
                    }
                    ${
                      proforma.termsConfig &&
                      Object.keys(proforma.termsConfig).length > 0
                        ? `<div class="mt-4 pt-3 border-t border-primary-200">
                            <div class="text-xs text-primary-500 mb-2 font-medium">Şartlar Detayları:</div>
                            <div class="text-xs text-primary-500 leading-normal">
                              ${
                                proforma.termsConfig.validityPeriod
                                  ? `• Geçerlilik Süresi: ${proforma.termsConfig.validityPeriod} gün<br>`
                                  : ""
                              }
                              ${
                                proforma.termsConfig.paymentType
                                  ? `• Ödeme Türü: ${
                                      proforma.termsConfig.paymentType ===
                                      "advance"
                                        ? "%100 Peşin"
                                        : proforma.termsConfig.paymentType ===
                                          "partial"
                                        ? `Kısmi (%${proforma.termsConfig.advancePayment} avans)`
                                        : proforma.termsConfig.paymentType ===
                                          "credit"
                                        ? `${proforma.termsConfig.creditDays} gün vadeli`
                                        : proforma.termsConfig.paymentType ===
                                          "cash"
                                        ? "Nakit"
                                        : "Belirtilmemiş"
                                    }<br>`
                                  : ""
                              }
                              ${
                                proforma.termsConfig.deliveryTime
                                  ? `• Teslimat: ${
                                      proforma.termsConfig.deliveryTime.min
                                    }${
                                      proforma.termsConfig.deliveryTime.max !==
                                      proforma.termsConfig.deliveryTime.min
                                        ? `-${proforma.termsConfig.deliveryTime.max}`
                                        : ""
                                    } iş günü<br>`
                                  : ""
                              }
                              ${
                                proforma.termsConfig.vatIncluded !== undefined
                                  ? `• KDV: ${
                                      proforma.termsConfig.vatIncluded
                                        ? "Dahil"
                                        : "Hariç"
                                    }<br>`
                                  : ""
                              }
                            </div>
                           </div>`
                        : ""
                    }
                    ${
                      proforma.notes
                        ? `<div class="mt-3 pt-3 ${
                            proforma.terms || proforma.termsConfig
                              ? "border-t border-primary-200"
                              : ""
                          }">
                            <div class="text-xs text-primary-500 mb-1.5 font-medium">Ek Notlar:</div>
                            <div class="text-xs leading-relaxed text-primary-500">${formatText(
                              proforma.notes
                            )}</div>
                           </div>`
                        : ""
                    }
                </div>
                `
                    : ""
                }
            </div>

            <!-- Footer -->
            <div class="mt-6 pt-3 border-t border-primary-200 text-xs text-primary-500 text-center leading-snug font-medium">
                Bu proforma fiyat teklifi olup, kesin fatura değildir. • MKN GROUP © ${new Date().getFullYear()}
            </div>
        </div>
    </body>
    </html>
    `;

    // Puppeteer ile PDF oluştur
    console.log("Starting Puppeteer...");

    let browser = null;
    let page = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-features=VizDisplayCompositor",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
        ],
        timeout: 60000,
      });

      console.log("Browser launched successfully");

      page = await browser.newPage();
      console.log("New page created");

      // Page timeout ayarları
      await page.setDefaultTimeout(30000);
      await page.setDefaultNavigationTimeout(30000);

      // Modern cihaz emülasyonu
      await page.setViewport({ width: 1200, height: 800 });
      console.log("Viewport set");

      await page.setContent(htmlTemplate, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });
      console.log("HTML content set");

      // Sayfanın tam yüklenmesini bekle
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // PDF oluştur - improved settings
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
        preferCSSPageSize: true,
        timeout: 30000,
      });

      console.log("PDF generated, size:", pdf.length);

      // Ensure browser cleanup
      if (page && !page.isClosed()) {
        await page.close();
      }
      if (browser && browser.isConnected()) {
        await browser.close();
      }
      console.log("Browser closed");

      // PDF'i başarılı şekilde döndür
      return new NextResponse(Buffer.from(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="proforma-${
            proforma.proformaNumber || "document"
          }.pdf"`,
        },
      });
    } catch (pdfError) {
      console.error("PDF generation specific error:", pdfError);

      // Cleanup on error
      try {
        if (page && !page.isClosed()) {
          await page.close();
        }
        if (browser && browser.isConnected()) {
          await browser.close();
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      throw pdfError;
    }
  } catch (error) {
    const err = error as Error;
    console.error("PDF oluşturma hatası - Detaylı:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    return NextResponse.json(
      {
        error: "PDF oluşturulurken bir hata oluştu",
        details: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
