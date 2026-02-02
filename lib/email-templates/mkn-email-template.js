/**
 * MKN Group E-posta Template
 * Profesyonel HTML e-posta şablonu
 */

import { site } from "../../config/site";

// MKN Group Kurumsal Renkleri
const COLORS = {
  primary: "#0891b2", // Cyan-600
  primaryDark: "#0e7490",
  secondary: "#1e293b", // Slate-800
  accent: "#f59e0b", // Amber-500
  text: "#374151", // Gray-700
  textLight: "#6b7280", // Gray-500
  background: "#f8fafc", // Slate-50
  white: "#ffffff",
  border: "#e2e8f0", // Slate-200
};

// MKN Group İletişim Bilgileri - site.js'den alınıyor
const COMPANY_INFO = {
  name: site.name,
  tagline: "Güvenilir Çözümler, Güçlü İş Ortaklıkları",
  phone: site.phone,
  email: site.email,
  website: site.domain,
  address: site.address,
  logo: `https://${site.domain}/logo.png`,
  social: {
    instagram: site.socials.instagram,
    linkedin: site.socials.linkedin,
    twitter: site.socials.twitter,
  },
};

/**
 * Markdown benzeri metni HTML'e çevir
 */
export function convertTextToHtml(text) {
  if (!text) return "";

  let html = text
    // Boş satırları paragraf ayracı yap
    .split(/\n\n+/)
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => {
      // Başlıklar
      if (para.startsWith("# ")) {
        return `<h2 style="color: ${COLORS.primary}; font-size: 20px; margin: 20px 0 10px 0;">${para.slice(2)}</h2>`;
      }
      if (para.startsWith("## ")) {
        return `<h3 style="color: ${COLORS.secondary}; font-size: 16px; margin: 15px 0 8px 0;">${para.slice(3)}</h3>`;
      }
      
      // Liste öğeleri
      if (para.includes("\n- ") || para.startsWith("- ")) {
        const items = para.split(/\n/).filter(l => l.trim().startsWith("- "));
        const listHtml = items.map(item => 
          `<li style="margin: 5px 0; color: ${COLORS.text};">${item.slice(2).trim()}</li>`
        ).join("");
        return `<ul style="margin: 15px 0; padding-left: 20px;">${listHtml}</ul>`;
      }
      
      // Normal paragraf
      // Tek satır içi yeni satırları <br> yap
      const formatted = para
        .split("\n")
        .map(line => line.trim())
        .join("<br>");
      
      return `<p style="margin: 12px 0; color: ${COLORS.text}; line-height: 1.6;">${formatted}</p>`;
    })
    .join("");

  // Bold ve italic
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: ' + COLORS.secondary + ';">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  return html;
}

/**
 * MKN Group HTML E-posta Template
 */
export function generateMknEmailHtml({
  recipientName = "",
  subject = "",
  bodyContent = "",
  senderName = "MKN GROUP Ekibi",
  includeSignature = true,
}) {
  // Body içeriğini HTML'e çevir
  const htmlBody = convertTextToHtml(bodyContent);
  
  // Selamlama
  const greeting = recipientName 
    ? `Merhaba ${recipientName},`
    : "Merhaba,";

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${COLORS.primary}; background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); padding: 25px 30px; border-radius: 12px 12px 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: ${COLORS.white}; font-size: 24px; font-weight: bold;">
                      MKN GROUP
                    </h1>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">
                      ${COMPANY_INFO.tagline}
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="https://${COMPANY_INFO.website}" style="color: ${COLORS.white}; text-decoration: none; font-size: 12px;">
                      ${COMPANY_INFO.website}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 35px 30px;">
              <!-- Selamlama -->
              <p style="margin: 0 0 20px 0; color: ${COLORS.secondary}; font-size: 16px; font-weight: 500;">
                ${greeting}
              </p>
              
              <!-- İçerik -->
              <div style="font-size: 14px;">
                ${htmlBody}
              </div>
              
              ${includeSignature ? `
              <!-- İmza -->
              <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid ${COLORS.border};">
                <p style="margin: 0 0 3px 0; color: ${COLORS.text}; font-size: 14px;">
                  Saygılarımızla,
                </p>
                <p style="margin: 0; color: ${COLORS.primary}; font-size: 15px; font-weight: 600;">
                  ${senderName}
                </p>
              </div>
              ` : ""}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.secondary}; padding: 25px 30px; border-radius: 0 0 12px 12px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">
                      İletişim
                    </p>
                    <p style="margin: 0 0 3px 0; color: rgba(255,255,255,0.7); font-size: 12px;">
                      📞 ${COMPANY_INFO.phone}
                    </p>
                    <p style="margin: 0 0 3px 0; color: rgba(255,255,255,0.7); font-size: 12px;">
                      ✉️ ${COMPANY_INFO.email}
                    </p>
                    <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 12px;">
                      🌐 ${COMPANY_INFO.website}
                    </p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <a href="${COMPANY_INFO.social.instagram}" style="display: inline-block; margin-left: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 12px;">
                      Instagram
                    </a>
                    <a href="${COMPANY_INFO.social.linkedin}" style="display: inline-block; margin-left: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 12px;">
                      LinkedIn
                    </a>
                    <a href="${COMPANY_INFO.social.twitter}" style="display: inline-block; margin-left: 10px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 12px;">
                      X
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alt bilgi -->
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 10px; text-align: center;">
                  Bu e-posta MKN GROUP tarafından gönderilmiştir. © ${new Date().getFullYear()} Tüm hakları saklıdır.
                </p>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * E-posta için düz metin versiyonu (fallback)
 */
export function generatePlainTextEmail({
  recipientName = "",
  bodyContent = "",
  senderName = "MKN GROUP Ekibi",
}) {
  const greeting = recipientName ? `Merhaba ${recipientName},` : "Merhaba,";
  
  return `
${greeting}

${bodyContent}

---
Saygılarımızla,
${senderName}

MKN GROUP
${COMPANY_INFO.tagline}
Tel: ${COMPANY_INFO.phone}
E-posta: ${COMPANY_INFO.email}
Web: ${COMPANY_INFO.website}
  `.trim();
}

export { COLORS, COMPANY_INFO };
