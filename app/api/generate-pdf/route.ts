import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import axios from "axios";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proforma, companyData } = body;

    if (!proforma) {
      throw new Error("Proforma data is required");
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

    // Güvenli metin formatı
    const formatText = (text: string | null | undefined): string => {
      if (!text) return "Belirtilmemiş";
      return String(text).trim() || "Belirtilmemiş";
    };

    // Para birimi formatı - Sadece metin kodları
    const formatCurrency = (amount: number, currency = "TRY"): string => {
      const numAmount = Number(amount) || 0;
      const isNegative = numAmount < 0;
      const absAmount = Math.abs(numAmount);

      const formattedNumber = absAmount.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // Para birimi kodları - sadece metin
      const currencyTexts: Record<string, string> = {
        TRY: "TL",
        USD: "USD",
        EUR: "EUR",
      };

      const currencyText = currencyTexts[currency] || currency;
      const prefix = isNegative ? "-" : "";

      // Hep aynı format: miktar + boşluk + para birimi kodu
      return `${prefix}${formattedNumber} ${currencyText}`;
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
                  sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif']
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
                    900: '#475569'
                  }
                }
              }
            }
          }
        </script>
        <style>
          /* Fallback styles for PDF generation with Turkish character support */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
            font-size: 14px; 
            line-height: 1.6; 
            color: #334155;
          }
          .table-stripe:nth-child(even) { background-color: #f8fafc !important; }
          .print-page { max-width: 210mm; min-height: 297mm; }
          
          /* Color fallbacks - lighter colors */
          .bg-primary-50 { background-color: #f8fafc !important; }
          .bg-primary-900 { background-color: #475569 !important; }
          .bg-white { background-color: #ffffff !important; }
          .text-primary-900 { color: #334155 !important; }
          .text-primary-500 { color: #64748b !important; }
          .text-white { color: #ffffff !important; }
          .border-primary-200 { border-color: #e2e8f0 !important; }
          .border-primary-900 { border-color: #64748b !important; }
          
          /* Layout fallbacks */
          .flex { display: flex !important; }
          .justify-between { justify-content: space-between !important; }
          .items-center { align-items: center !important; }
          .items-start { align-items: flex-start !important; }
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .font-bold { font-weight: 700 !important; }
          .font-extrabold { font-weight: 800 !important; }
          .font-semibold { font-weight: 600 !important; }
          .uppercase { text-transform: uppercase !important; }
          
          /* Turkish character support */
          .turkish-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }
        </style>
    </head>
    <body class="font-sans text-sm text-primary-900 bg-white leading-relaxed turkish-text">
        <div class="print-page mx-auto bg-white">
            <!-- Header -->
            <div class="flex justify-between items-start p-6 border-b border-primary-200">
                <div class="flex items-center gap-3 flex-1">
                    ${
                      logoBase64
                        ? `<img src="${logoBase64}" alt="MKN GROUP" style="height: 32px; width: auto;" />`
                        : `<!-- Logo placeholder --><div style="width: 32px; height: 32px; background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">MKN</div>`
                    }
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
                            <td class="px-3 py-2 text-xs border-b border-primary-200 font-semibold text-primary-900 text-right bg-white">${formatCurrency(
                              -Math.abs(
                                (proforma.totalAmount || 0) *
                                  (proforma.discountRate / 100)
                              ),
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

    // HTML2PDF API ile PDF oluştur
    try {
      const apiKey = process.env.HTML2PDF_API_KEY;

      if (!apiKey) {
        throw new Error("HTML2PDF API key not found in environment variables");
      }

      const response = await axios.post(
        "https://api.html2pdf.app/v1/generate",
        {
          html: htmlTemplate,
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
          "Content-Disposition": `attachment; filename="proforma-${
            proforma.proformaNumber || "document"
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
