"use client";

import { useState, useEffect } from "react";
import { ProformaService, PROFORMA_STATUS_LABELS } from "../../../lib/services/proforma-service";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";

// Icons
import {
  Search,
  FileText,
  Building2,
  Calendar,
  Check,
  X,
  Loader2,
} from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "draft", label: "Taslak" },
  { key: "sent", label: "Gönderildi" },
  { key: "accepted", label: "Kabul Edildi" },
];

export function ProformaSelector({ 
  open, 
  onClose, 
  onSelect,
  selectedProformaId = null,
  customerId = null,
  companyId = null,
}) {
  const [loading, setLoading] = useState(true);
  const [proformas, setProformas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (open) {
      loadProformas();
    }
  }, [open]);

  const loadProformas = async () => {
    setLoading(true);
    try {
      // Her zaman tüm proformaları getir (filtreleme UI'da yapılacak)
      const result = await ProformaService.getProformas();
      const proformaList = result?.proformas || [];
      
      console.log("Loaded proformas:", proformaList.length);
      setProformas(proformaList);
    } catch (error) {
      console.error("Error loading proformas:", error);
      setProformas([]);
    } finally {
      setLoading(false);
    }
  };

  // Proformaları filtrele
  const filteredProformas = (proformas || []).filter(proforma => {
    // Status filtresi
    if (statusFilter !== "all" && proforma.status !== statusFilter) {
      return false;
    }
    
    // Arama filtresi
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    
    // Farklı field yapılarını destekle
    const companyName = proforma.customerInfo?.companyName || 
                        proforma.customer?.companyName || 
                        proforma.companyName || "";
    const contactPerson = proforma.customerInfo?.contactPerson || 
                          proforma.customer?.contactPerson || "";
    
    return (
      proforma.proformaNumber?.toLowerCase().includes(search) ||
      companyName.toLowerCase().includes(search) ||
      contactPerson.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount || 0);
  };

  const handleSelect = (proforma) => {
    onSelect(proforma);
    onClose();
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-slate-100 text-slate-600 border-slate-200",
      sent: "bg-blue-50 text-blue-600 border-blue-200",
      accepted: "bg-emerald-50 text-emerald-600 border-emerald-200",
      rejected: "bg-red-50 text-red-600 border-red-200",
      expired: "bg-amber-50 text-amber-600 border-amber-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Helper: Proforma'dan company name al
  const getCompanyName = (proforma) => {
    return proforma.customerInfo?.companyName || 
           proforma.customer?.companyName || 
           proforma.companyName || 
           "—";
  };

  // Helper: Proforma'dan total amount al
  const getTotalAmount = (proforma) => {
    return proforma.totalAmount || proforma.total || 0;
  };

  // Helper: Proforma'dan services/items al
  const getServicesPreview = (proforma) => {
    const services = proforma.services || proforma.items || [];
    if (services.length === 0) return null;
    return services.map(s => s.name || s.description).filter(Boolean).join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: '500px', width: '95vw' }}
      >
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b bg-slate-50">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-blue-600" />
            Proforma Seç
          </DialogTitle>
          <DialogDescription className="text-xs">
            Siparişe bağlanacak proformayı seçin.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="px-4 py-3 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Proforma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  statusFilter === filter.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Proforma List */}
        <div className="overflow-y-auto" style={{ maxHeight: '350px', minHeight: '200px' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredProformas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText className="h-8 w-8 mb-2" />
              <p className="text-sm">Proforma bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredProformas.map((proforma) => {
                const createdAt = proforma.createdAt?.toDate?.() || 
                                  (proforma.createdAt ? new Date(proforma.createdAt) : new Date());
                const isCurrentlySelected = selectedProformaId === proforma.id;
                const servicesPreview = getServicesPreview(proforma);
                
                return (
                  <div
                    key={proforma.id}
                    onClick={() => handleSelect(proforma)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50",
                      isCurrentlySelected && "bg-blue-50 hover:bg-blue-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-slate-900">
                            {proforma.proformaNumber}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] px-1.5 py-0", getStatusBadge(proforma.status))}
                          >
                            {PROFORMA_STATUS_LABELS[proforma.status] || proforma.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="h-3 w-3 flex-shrink-0" />
                            {getCompanyName(proforma)}
                          </span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Calendar className="h-3 w-3" />
                            {format(createdAt, "dd MMM yyyy", { locale: tr })}
                          </span>
                        </div>
                        
                        {/* Services preview */}
                        {servicesPreview && (
                          <p className="text-[11px] text-slate-400 mt-1 truncate">
                            {servicesPreview}
                          </p>
                        )}
                      </div>
                      
                      {/* Right - Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(getTotalAmount(proforma), proforma.currency)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          KDV %{proforma.taxRate || proforma.vatRate || 20}
                        </p>
                      </div>
                    </div>
                    
                    {/* Select indicator */}
                    {isCurrentlySelected && (
                      <div className="flex items-center gap-1 text-blue-600 text-xs mt-2">
                        <Check className="h-3.5 w-3.5" />
                        <span>Seçili</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-slate-50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Proforma Özet Kartı
export function ProformaSummaryCard({ proforma, onRemove, onView }) {
  if (!proforma) return null;
  
  const formatCurrency = (amount, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount || 0);
  };

  // Helper: Proforma'dan company name al
  const getCompanyName = () => {
    return proforma.customerInfo?.companyName || 
           proforma.customer?.companyName || 
           proforma.companyName || 
           "—";
  };

  // Helper: Proforma'dan total amount al
  const getTotalAmount = () => {
    return proforma.totalAmount || proforma.total || 0;
  };

  // Helper: Proforma'dan services count al
  const getServicesCount = () => {
    const services = proforma.services || proforma.items || [];
    return services.length;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-blue-900 truncate">{proforma.proformaNumber}</p>
            <p className="text-xs text-blue-600 truncate">
              {getCompanyName()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="font-semibold text-sm text-blue-900">
              {formatCurrency(getTotalAmount(), proforma.currency)}
            </p>
            <p className="text-[10px] text-blue-600">
              {getServicesCount()} kalem
            </p>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProformaSelector;
