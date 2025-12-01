'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

/**
 * Sözleşme PDF Export Bileşeni
 * Modern, minimalist ve profesyonel PDF export
 */
const ContractPDFExport = ({ 
  contract, 
  companyData, 
  children, 
  fileName, 
  onLoadingStart, 
  onLoadingEnd 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      if (onLoadingStart) onLoadingStart();

      const response = await fetch('/api/generate-contract-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract,
          companyData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('PDF API Error:', response.status, errorData);
        throw new Error(`PDF oluşturulamadı: ${errorData.details || response.statusText}`);
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `sozlesme-${contract.contractNumber || 'draft'}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('PDF download completed successfully');
      
      if (onLoadingEnd) onLoadingEnd();

    } catch (err) {
      console.error('Sözleşme PDF oluşturma hatası:', err);
      setError(`PDF oluşturulurken bir hata oluştu: ${err.message}`);
      
      if (onLoadingEnd) onLoadingEnd();
    } finally {
      setIsGenerating(false);
    }
  };

  // Error state
  if (error && !isGenerating) {
    return (
      <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200">
        {error}
        <button 
          onClick={() => setError(null)} 
          className="ml-2 text-red-800 underline hover:no-underline"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (children) {
    return (
      <div 
        onClick={!isGenerating ? handleGeneratePDF : undefined}
        className={`inline-block ${isGenerating ? 'opacity-50 cursor-wait pointer-events-none' : 'cursor-pointer'}`}
      >
        <div className="relative">
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            </div>
          )}
          {children}
        </div>
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
      title={isGenerating ? 'PDF oluşturuluyor, lütfen bekleyin...' : 'Sözleşmeyi PDF olarak indir'}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>PDF Hazırlanıyor...</span>
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

export default ContractPDFExport;
export { ContractPDFExport as ContractPDF };
