"use client";

import React, { useState, useEffect } from "react";
import { FileDown, Loader2, Settings2 } from "lucide-react";
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

// API tabanlı PDF export sistemi (proforma ile aynı sistem)
const FormulaPDFExport = ({ formula, children, fileName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // PDF customization options
  const [includePricing, setIncludePricing] = useState(false);
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
      const response = await fetch("/api/companies?limit=100");
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

      const response = await fetch("/api/generate-formula-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formula,
          options: {
            includePricing,
            companyData: selectedCompany
              ? companies.find((c) => c.id === selectedCompany)
              : null,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF oluşturulamadı: ${response.status} ${errorText}`);
      }

      // PDF blob'unu al
      const blob = await response.blob();

      // Download linkini oluştur
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        fileName ||
        `formul-${formula.name?.replace(/[^a-z0-9]/gi, "_") || "urun"}.pdf`;

      // Linki tıkla ve temizle
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Formula PDF download completed successfully");
      setDialogOpen(false);
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      setError(`PDF oluşturulurken bir hata oluştu: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (children) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" />
              PDF Export Ayarları
            </DialogTitle>
            <DialogDescription>
              Formül PDF'i için özelleştirme seçeneklerini belirleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Include Pricing Toggle */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="pricing" className="flex flex-col space-y-1">
                <span className="font-semibold text-gray-900">
                  Fiyat Bilgisi
                </span>
                <span className="font-normal text-xs text-gray-600">
                  Hammadde ve toplam maliyet bilgilerini dahil et
                </span>
              </Label>
              <Switch
                id="pricing"
                checked={includePricing}
                onCheckedChange={setIncludePricing}
              />
            </div>

            {/* Company Selection */}
            <div className="space-y-2">
              <Label htmlFor="company" className="font-semibold text-gray-900">
                Müşteri Firma (Opsiyonel)
              </Label>
              <Select
                value={selectedCompany || ""}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger id="company" disabled={loadingCompanies}>
                  <SelectValue
                    placeholder={
                      loadingCompanies
                        ? "Yükleniyor..."
                        : "Firma seçin (opsiyonel)"
                    }
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
              <p className="text-xs text-gray-500">
                Seçili firma bilgileri PDF'te görünecektir
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
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
              className="bg-blue-600 hover:bg-blue-700"
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
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <FileDown className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-blue-600" />
            PDF Export Ayarları
          </DialogTitle>
          <DialogDescription>
            Formül PDF'i için özelleştirme seçeneklerini belirleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Include Pricing Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="pricing-default"
              className="flex flex-col space-y-1"
            >
              <span className="font-semibold text-gray-900">Fiyat Bilgisi</span>
              <span className="font-normal text-xs text-gray-600">
                Hammadde ve toplam maliyet bilgilerini dahil et
              </span>
            </Label>
            <Switch
              id="pricing-default"
              checked={includePricing}
              onCheckedChange={setIncludePricing}
            />
          </div>

          {/* Company Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="company-default"
              className="font-semibold text-gray-900"
            >
              Müşteri Firma (Opsiyonel)
            </Label>
            <Select
              value={selectedCompany || ""}
              onValueChange={setSelectedCompany}
            >
              <SelectTrigger id="company-default" disabled={loadingCompanies}>
                <SelectValue
                  placeholder={
                    loadingCompanies
                      ? "Yükleniyor..."
                      : "Firma seçin (opsiyonel)"
                  }
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
            <p className="text-xs text-gray-500">
              Seçili firma bilgileri PDF'te görünecektir
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
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
            className="bg-blue-600 hover:bg-blue-700"
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
      </DialogContent>
    </Dialog>
  );
};

export default FormulaPDFExport;
export { FormulaPDFExport as FormulaPDF };
