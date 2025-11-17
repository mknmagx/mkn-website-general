/**
 * WhatsApp İletişim Hook'u
 * React bileşenlerinde WhatsApp işlevselliği için kullanılır
 */

import { useCallback } from "react";
import { 
  startProductWhatsAppChat, 
  startGeneralWhatsAppChat, 
  startCatalogWhatsAppChat,
  WHATSAPP_NUMBER 
} from "@/lib/services/whatsapp-service";

export const useWhatsApp = () => {
  /**
   * Ürün için WhatsApp iletişimi başlatır
   */
  const contactForProduct = useCallback((product, productSpecifications = {}) => {
    startProductWhatsAppChat(product, productSpecifications);
  }, []);

  /**
   * Genel iletişim için WhatsApp açar
   */
  const contactGeneral = useCallback((subject = "", message = "") => {
    startGeneralWhatsAppChat(subject, message);
  }, []);

  /**
   * Katalog talebi için WhatsApp açar
   */
  const requestCatalog = useCallback((categoryName = "") => {
    startCatalogWhatsAppChat(categoryName);
  }, []);

  /**
   * Telefon numarasına direkt arama yapar
   */
  const makePhoneCall = useCallback(() => {
    window.open(`tel:+${WHATSAPP_NUMBER}`, "_self");
  }, []);

  /**
   * WhatsApp numarasını döndürür
   */
  const getWhatsAppNumber = useCallback(() => {
    return WHATSAPP_NUMBER;
  }, []);

  /**
   * Formatlanmış telefon numarasını döndürür
   */
  const getFormattedPhoneNumber = useCallback(() => {
    const number = WHATSAPP_NUMBER;
    return `+90 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8, 10)} ${number.slice(10, 12)}`;
  }, []);

  return {
    contactForProduct,
    contactGeneral,
    requestCatalog,
    makePhoneCall,
    getWhatsAppNumber,
    getFormattedPhoneNumber,
    whatsappNumber: WHATSAPP_NUMBER
  };
};

export default useWhatsApp;