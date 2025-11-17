/**
 * WhatsApp Mesajlaşma Servisi
 * Tüm WhatsApp mesajlarını merkezi olarak yönetir
 */

const WHATSAPP_NUMBER = "905314942594";

/**
 * Ürün detay sayfası için WhatsApp mesajı oluşturur
 */
export const createProductWhatsAppMessage = (product, productSpecifications = {}) => {
  const productSize = product.specifications?.size || product.size;
  const productMaterial = productSpecifications.material || product.material;
  const productColor = product.color || productSpecifications.color;
  const productCode = product.code;
  
  let message = `Merhaba MKN GROUP!\n\n`;
  message += `Aşağıdaki ürün hakkında bilgi almak istiyorum:\n\n`;
  message += `*Ürün:* ${product.name}${productSize ? ` - ${productSize}` : ""}\n`;
  message += `*Kategori:* ${product.category}\n`;

  if (productCode) {
    message += `*Ürün Kodu:* ${productCode}\n`;
  }
  if (productSize) {
    message += `*Boyut:* ${productSize}\n`;
  }
  if (productMaterial) {
    message += `*Malzeme:* ${productMaterial}\n`;
  }
  if (productColor) {
    message += `*Renk:* ${productColor}\n`;
  }

  message += `\n*Açıklama:* ${product.description}\n\n`;
  message += `Bu ürün için:\n`;
  message += `- Fiyat bilgisi\n`;
  message += `- Minimum sipariş miktarı\n`;
  message += `- Teslimat süresi\n`;
  message += `- Özel üretim seçenekleri\n\n`;
  message += `hakkında detaylı bilgi alabilir miyim?\n\n`;
  message += `Teşekkürler!`;

  return message;
};

/**
 * Genel iletişim için WhatsApp mesajı oluşturur
 */
export const createGeneralWhatsAppMessage = (subject = "", customMessage = "") => {
  let message = `Merhaba MKN GROUP!\n\n`;
  
  if (subject) {
    message += `*Konu:* ${subject}\n\n`;
  }
  
  if (customMessage) {
    message += `${customMessage}\n\n`;
  } else {
    message += `Size ulaşmak istiyorum. Lütfen benimle iletişime geçer misiniz?\n\n`;
  }
  
  message += `Teşekkürler!`;
  
  return message;
};

/**
 * Katalog talebi için WhatsApp mesajı oluşturur
 */
export const createCatalogRequestWhatsAppMessage = (categoryName = "") => {
  let message = `Merhaba MKN GROUP!\n\n`;
  
  if (categoryName) {
    message += `*${categoryName}* kategorisindeki ürünler hakkında bilgi almak istiyorum.\n\n`;
  } else {
    message += `Ürün kataloğunuz hakkında bilgi almak istiyorum.\n\n`;
  }
  
  message += `Aşağıdaki konularda bilgi verir misiniz:\n`;
  message += `- Ürün çeşitleri ve özellikleri\n`;
  message += `- Fiyat listesi\n`;
  message += `- Minimum sipariş miktarları\n`;
  message += `- Teslimat koşulları\n\n`;
  message += `Teşekkürler!`;
  
  return message;
};

/**
 * WhatsApp URL'si oluşturur ve açar
 */
export const openWhatsApp = (message) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  // Yeni sekmede aç
  window.open(whatsappUrl, "_blank");
};

/**
 * Ürün detay sayfası için WhatsApp iletişimi başlatır
 */
export const startProductWhatsAppChat = (product, productSpecifications = {}) => {
  const message = createProductWhatsAppMessage(product, productSpecifications);
  openWhatsApp(message);
};

/**
 * Genel iletişim için WhatsApp açar
 */
export const startGeneralWhatsAppChat = (subject = "", customMessage = "") => {
  const message = createGeneralWhatsAppMessage(subject, customMessage);
  openWhatsApp(message);
};

/**
 * Katalog talebi için WhatsApp açar
 */
export const startCatalogWhatsAppChat = (categoryName = "") => {
  const message = createCatalogRequestWhatsAppMessage(categoryName);
  openWhatsApp(message);
};

// WhatsApp numarası dışa aktar
export { WHATSAPP_NUMBER };