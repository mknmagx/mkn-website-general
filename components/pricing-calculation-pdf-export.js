"use client";

import React, { useState, useEffect } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PricingCalculationPDFExport = ({ calculation, children, fileName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // PDF customization options
  const [showCostDetails, setShowCostDetails] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Load companies when dialog opens
  useEffect(() => {
    if (dialogOpen && companies.length === 0) {
      loadCompanies();
    }
  }, [dialogOpen]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch("/api/companies?limit=500");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error("Error loading companies:", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/generate-pricing-calculation-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calculation,
          options: {
            showCostDetails,
            companyData: selectedCompany && selectedCompany !== "none"
              ? companies.find((c) => c.id === selectedCompany)
              : null,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF oluşturulamadı: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `hesaplama-${calculation.productName?.replace(/[^a-z0-9]/gi, "_") || "urun"}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDialogOpen(false);
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      setError(`PDF oluşturulurken bir hata oluştu: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const DialogContentComponent = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-semibold">
          PDF İndirme Seçenekleri
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          {calculation.productName || "Hesaplama"} için PDF ayarlarını seçin
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Cost Details Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="costDetails" className="font-medium text-gray-900">
              Fiyat Bilgisi
            </Label>
            <p className="text-xs text-gray-500 mt-0.5">
              Maliyet ve fiyat detaylarını göster
            </p>
          </div>
          <Switch
            id="costDetails"
            checked={showCostDetails}
            onCheckedChange={setShowCostDetails}
          />
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            {showCostDetails 
              ? "✓ PDF'te tüm maliyet detayları ve fiyat hesaplamaları görünecektir."
              : "⚠ PDF'te fiyat bilgisi yer almayacak, sadece ürün ve işlem detayları görünecektir."
            }
          </p>
        </div>

        {/* Company Selection */}
        <div className="space-y-2">
          <Label htmlFor="company" className="font-medium text-gray-900">
            Müşteri Firma
          </Label>
          <Select
            value={selectedCompany || ""}
            onValueChange={setSelectedCompany}
          >
            <SelectTrigger id="company" disabled={loadingCompanies} className="w-full">
              <SelectValue
                placeholder={loadingCompanies ? "Yükleniyor..." : "Firma seçin (opsiyonel)"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Firma seçilmedi</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          onClick={() => setDialogOpen(false)}
          disabled={isGenerating}
        >
          İptal
        </Button>
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              PDF İndir
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  if (children) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogContentComponent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <FileDown className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogContentComponent />
      </DialogContent>
    </Dialog>
  );
};

export default PricingCalculationPDFExport;
export { PricingCalculationPDFExport as PricingCalculationPDF };
