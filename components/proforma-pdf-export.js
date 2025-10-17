'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

// Modern HTML2PDF API tabanlı PDF export sistemi
const ProformaPDFExport = ({ proforma, companyData, children, fileName, onLoadingStart, onLoadingEnd }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Parent component'e loading başladığını bildir
      if (onLoadingStart) onLoadingStart();

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proforma,
          companyData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF oluşturulamadı: ${response.status} ${errorText}`);
      }

      // PDF blob'unu al
      const blob = await response.blob();
      
      // Download linkini oluştur
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `proforma-${proforma.proformaNumber || 'draft'}.pdf`;
      
      // Linki tıkla ve temizle
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('PDF download completed successfully');

    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
      setError(`PDF oluşturulurken bir hata oluştu: ${err.message}`);
    } finally {
      setIsGenerating(false);
      // Parent component'e loading bittiğini bildir
      if (onLoadingEnd) onLoadingEnd();
    }
  };

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
        inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
        disabled:pointer-events-none disabled:opacity-50
        border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground
        h-9 px-4 py-2 gap-2
        ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>PDF Oluşturuluyor...</span>
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

export default ProformaPDFExport;
export { ProformaPDFExport as ProformaPDF };
