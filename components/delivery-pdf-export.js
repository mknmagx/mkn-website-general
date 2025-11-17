'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

// Modern HTML2PDF API tabanlı delivery PDF export sistemi
const DeliveryPDFExport = ({ delivery, companyData, children, fileName, onLoadingStart, onLoadingEnd }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Parent component'e loading başladığını bildir
      if (onLoadingStart) onLoadingStart();

      const response = await fetch('/api/generate-delivery-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delivery,
          companyData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('PDF API Error:', response.status, errorData);
        throw new Error(`PDF oluşturulamadı: ${errorData.details || response.statusText}`);
      }

      // PDF blob'unu al
      const blob = await response.blob();
      
      // Download linkini oluştur
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `irsaliye-${delivery.deliveryNumber || 'draft'}.pdf`;
      
      // Linki tıkla ve temizle
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Delivery PDF oluşturma hatası:', err);
      setError(`PDF oluşturulurken bir hata oluştu: ${err.message}`);
      
      // Error toast veya notification göster
      if (window.toast) {
        window.toast.error(`PDF Hatası: ${err.message}`);
      }
    } finally {
      setIsGenerating(false);
      // Parent component'e loading bittiğini bildir
      if (onLoadingEnd) onLoadingEnd();
    }
  };

  // Error state göster
  if (error && !isGenerating) {
    return (
      <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200">
        {error}
        <button 
          onClick={() => setError(null)} 
          className="ml-2 text-red-800 underline"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (children) {
    return (
      <div onClick={handleGeneratePDF} style={{ cursor: 'pointer' }}>
        {children}
      </div>
    );
  }

  return (
    <button 
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className={`
        inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        disabled:pointer-events-none 
        border shadow-sm h-10 px-4 py-2 gap-2 min-w-[140px]
        ${isGenerating 
          ? 'bg-blue-50 border-blue-300 text-blue-700 opacity-90 cursor-wait' 
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow-md active:scale-95'
        }
      `}
      title={isGenerating ? 'PDF oluşturuluyor, lütfen bekleyin...' : 'Teslimat notunu PDF olarak indir'}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Oluşturuluyor...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>PDF İndir</span>
        </>
      )}
    </button>
  );
};

export default DeliveryPDFExport;
export { DeliveryPDFExport as DeliveryPDF };