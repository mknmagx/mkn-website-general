"use client";

import React, { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const InventoryPDFExport = ({ 
  items, 
  filters = {}, 
  warehouseName = null,
  children, 
  fileName,
  variant = "outline",
  size = "sm"
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async () => {
    if (!items || items.length === 0) {
      setError("Dışa aktarılacak ürün bulunamadı");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/generate-inventory-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          filters,
          warehouseName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `PDF oluşturulamadı: ${response.status}`);
      }

      // PDF blob'unu al
      const blob = await response.blob();

      // Download linkini oluştur
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.download = fileName || `envanter-raporu-${date}.pdf`;

      // Linki tıkla ve temizle
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (children) {
    return (
      <div onClick={handleGeneratePDF} style={{ cursor: isGenerating ? 'wait' : 'pointer' }}>
        {children}
      </div>
    );
  }

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating || !items || items.length === 0}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Oluşturuluyor...</span>
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          <span>PDF</span>
        </>
      )}
    </Button>
  );
};

export default InventoryPDFExport;
