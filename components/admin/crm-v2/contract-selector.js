"use client";

import { useState, useEffect } from "react";
import { ContractService } from "../../../lib/services/contract-service";
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
  DialogFooter,
} from "../../ui/dialog";

// Icons
import {
  Search,
  FileSignature,
  Building2,
  Calendar,
  Check,
  X,
  Loader2,
} from "lucide-react";

const CONTRACT_STATUS_LABELS = {
  draft: "Taslak",
  active: "Aktif",
  completed: "Tamamlandı",
  cancelled: "İptal",
  expired: "Süresi Doldu",
};

const CONTRACT_TYPE_LABELS = {
  manufacturing: "Üretim Sözleşmesi",
  supply: "Tedarik Sözleşmesi",
  service: "Hizmet Sözleşmesi",
  framework: "Çerçeve Sözleşmesi",
  nda: "Gizlilik Sözleşmesi",
};

export function ContractSelector({ 
  open, 
  onClose, 
  onSelect,
  selectedContractId = null,
  customerId = null,
  companyId = null,
}) {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    if (open) {
      loadContracts();
      setSelectedContract(null);
    }
  }, [open, companyId]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      let result;
      if (companyId) {
        // Firmaya ait sözleşmeleri getir
        result = await ContractService.getContractsByCompany(companyId);
      } else {
        // Tüm sözleşmeleri getir
        result = await ContractService.getContracts({ limitCount: 100 });
      }
      
      if (result.success) {
        setContracts(result.contracts || []);
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Contract'tan company name al (farklı field yapılarını destekle)
  const getCompanyName = (contract) => {
    return contract.companyInfo?.companyName || 
           contract.companyName || 
           contract.customer?.companyName ||
           "Firma belirtilmemiş";
  };

  // Sözleşmeleri filtrele
  const filteredContracts = contracts.filter(contract => {
    // Status filtresi
    if (statusFilter !== "all" && contract.status !== statusFilter) {
      return false;
    }
    
    // Arama filtresi
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const companyName = getCompanyName(contract);
    
    return (
      contract.contractNumber?.toLowerCase().includes(search) ||
      companyName.toLowerCase().includes(search) ||
      contract.contractType?.toLowerCase().includes(search)
    );
  });

  const handleSelect = (contract) => {
    setSelectedContract(contract);
  };

  const handleConfirm = () => {
    if (selectedContract) {
      onSelect(selectedContract);
      onClose();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      expired: "bg-amber-100 text-amber-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeColor = (type) => {
    const colors = {
      manufacturing: "bg-purple-100 text-purple-700",
      supply: "bg-blue-100 text-blue-700",
      service: "bg-emerald-100 text-emerald-700",
      framework: "bg-orange-100 text-orange-700",
      nda: "bg-slate-100 text-slate-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // Helper: Tarihleri güvenli şekilde al
  const getDate = (dateField) => {
    if (!dateField) return null;
    if (dateField.toDate) return dateField.toDate();
    if (dateField instanceof Date) return dateField;
    return new Date(dateField);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="flex flex-col p-0 gap-0 overflow-hidden"
        style={{ maxWidth: '600px', width: '95vw', maxHeight: '85vh' }}
      >
        <DialogHeader className="px-4 py-3 border-b bg-slate-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-emerald-600" />
            Kontrat Seç
          </DialogTitle>
          <DialogDescription className="text-xs">
            Siparişe bağlanacak kontratı seçin.
          </DialogDescription>
        </DialogHeader>

        {/* Arama ve Filtre */}
        <div className="flex flex-col gap-2 px-4 py-3 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Kontrat no veya firma adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all", "active", "draft", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  statusFilter === status
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {status === "all" ? "Tümü" : CONTRACT_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Kontrat Listesi */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: '200px', maxHeight: '350px' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileSignature className="h-10 w-10 mb-2" />
              <p className="text-sm">Kontrat bulunamadı</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Aramayı temizle
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredContracts.map((contract) => {
                const isSelected = selectedContract?.id === contract.id;
                const startDate = getDate(contract.startDate);
                const endDate = getDate(contract.endDate);
                
                return (
                  <div
                    key={contract.id}
                    onClick={() => handleSelect(contract)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-all",
                      isSelected
                        ? "bg-emerald-50 border-l-2 border-emerald-500"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">
                            {contract.contractNumber}
                          </span>
                          <Badge className={cn("text-[10px] px-1.5 py-0", getStatusColor(contract.status))}>
                            {CONTRACT_STATUS_LABELS[contract.status] || contract.status}
                          </Badge>
                          <Badge className={cn("text-[10px] px-1.5 py-0", getTypeColor(contract.contractType))}>
                            {CONTRACT_TYPE_LABELS[contract.contractType] || contract.contractType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="h-3 w-3 flex-shrink-0" />
                            {getCompanyName(contract)}
                          </span>
                          {startDate && endDate && (
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Calendar className="h-3 w-3" />
                              {format(startDate, "dd.MM.yy", { locale: tr })} - {format(endDate, "dd.MM.yy", { locale: tr })}
                            </span>
                          )}
                        </div>
                        
                        {/* Kontrat özeti */}
                        {contract.description && (
                          <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-1">
                            {contract.description}
                          </p>
                        )}
                      </div>
                      
                      {isSelected && (
                        <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seçili Kontrat Özeti */}
        {selectedContract && (
          <div className="border-t px-4 py-3 bg-emerald-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600">Seçili Kontrat</p>
                  <p className="font-semibold text-sm text-emerald-900">{selectedContract.contractNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600">Tip</p>
                <p className="font-medium text-sm text-emerald-900">
                  {CONTRACT_TYPE_LABELS[selectedContract.contractType] || selectedContract.contractType}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="px-4 py-3 border-t bg-slate-50 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            İptal
          </Button>
          <Button 
            size="sm"
            onClick={handleConfirm} 
            disabled={!selectedContract}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Kontratı Seç
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Kontrat Özet Kartı
export function ContractSummaryCard({ contract, onRemove, onView }) {
  if (!contract) return null;

  // Helper: Contract'tan company name al
  const getCompanyName = () => {
    return contract.companyInfo?.companyName || 
           contract.companyName || 
           contract.customer?.companyName ||
           "—";
  };

  // Helper: Tarihleri güvenli şekilde al
  const getDate = (dateField) => {
    if (!dateField) return null;
    if (dateField.toDate) return dateField.toDate();
    if (dateField instanceof Date) return dateField;
    return new Date(dateField);
  };

  const startDate = getDate(contract.startDate);
  const endDate = getDate(contract.endDate);

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <FileSignature className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-emerald-900 truncate">{contract.contractNumber}</p>
            <p className="text-xs text-emerald-600 truncate">
              {getCompanyName()}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs font-medium text-emerald-900">
              {CONTRACT_TYPE_LABELS[contract.contractType] || contract.contractType}
            </p>
            {startDate && endDate && (
              <p className="text-[10px] text-emerald-600">
                {format(startDate, "dd.MM.yy")} - {format(endDate, "dd.MM.yy")}
              </p>
            )}
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
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

export default ContractSelector;
