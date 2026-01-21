"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Building2,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  ArrowRight,
  X,
  Mail,
} from "lucide-react";
import {
  createCompanyFromCrmItem,
} from "../../lib/services/companies-service";
import { useToast } from "../../hooks/use-toast";

// Durum renkleri
const getStatusColor = (status) => {
  const colors = {
    lead: "bg-blue-100 text-blue-700 border-blue-200",
    negotiation: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "active-client": "bg-green-100 text-green-700 border-green-200",
    completed: "bg-purple-100 text-purple-700 border-purple-200",
    paused: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

// Durum etiketleri
const getStatusLabel = (status) => {
  const labels = {
    lead: "Potansiyel",
    negotiation: "Görüşme",
    "active-client": "Aktif Müşteri",
    completed: "Tamamlandı",
    paused: "Beklemede",
  };
  return labels[status] || status;
};

// İş kolu listesi
const BUSINESS_LINES = [
  { value: "ambalaj", label: "Ambalaj" },
  { value: "eticaret", label: "E-ticaret" },
  { value: "pazarlama", label: "Pazarlama" },
  { value: "fason-kozmetik", label: "Fason Kozmetik" },
  { value: "fason-gida", label: "Fason Gıda" },
  { value: "fason-temizlik", label: "Fason Temizlik" },
  { value: "tasarim", label: "Tasarım" },
];

export default function CompanyMatchModal({
  isOpen,
  onClose,
  crmItem,
  companies = [], // Şirketler artık prop olarak geliyor
  onCompanySelected,
  onCompanyCreated,
}) {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [creating, setCreating] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompanyBusinessLine, setNewCompanyBusinessLine] = useState("ambalaj");

  // Modal kapandığında state'leri temizle
  useEffect(() => {
    if (!isOpen) {
      setSelectedCompany(null);
      setShowCreateForm(false);
      setNewCompanyBusinessLine("ambalaj");
    }
  }, [isOpen]);

  // SADECE TELEFON ile eşleştirme (en hızlı)
  const matchResults = useMemo(() => {
    if (!crmItem || companies.length === 0) return [];
    
    const itemPhone = (crmItem.phone || '').replace(/\D/g, '').slice(-10);
    if (itemPhone.length !== 10) return [];
    
    const matches = [];
    
    for (const company of companies) {
      const p1 = (company.phone || '').replace(/\D/g, '').slice(-10);
      const p2 = (company.contactPhone || '').replace(/\D/g, '').slice(-10);
      
      if (itemPhone === p1 || itemPhone === p2) {
        matches.push({ company, score: 100, matchedField: 'Telefon' });
        if (matches.length >= 3) break; // Max 3 sonuç
      }
    }
    
    return matches;
  }, [crmItem, companies]);

  // Şirkete git
  const handleGoToCompany = (companyId) => {
    onClose();
    router.push(`/admin/companies/${companyId}`);
  };

  // Şirket seç ve callback çağır
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    if (onCompanySelected) {
      onCompanySelected(company);
    }
  };

  // Yeni şirket oluştur
  const handleCreateCompany = async () => {
    if (!crmItem) return;

    setCreating(true);
    try {
      const result = await createCompanyFromCrmItem(crmItem, {
        businessLine: newCompanyBusinessLine,
      });

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Yeni şirket başarıyla oluşturuldu",
        });

        if (onCompanyCreated) {
          onCompanyCreated(result.companyId, result.companyData);
        }

        // Yeni şirkete yönlendir
        onClose();
        router.push(`/admin/companies/${result.companyId}`);
      } else {
        throw new Error(result.error || "Bilinmeyen hata");
      }
    } catch (error) {
      console.error("Şirket oluşturma hatası:", error);
      toast({
        title: "Hata",
        description: `Şirket oluşturulurken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Yeni şirket oluşturma sayfasına git (tam form ile)
  const handleGoToNewCompanyPage = () => {
    // Query parametreleri ile pre-fill data gönder
    const params = new URLSearchParams();
    if (crmItem?.company) params.set("name", crmItem.company);
    if (crmItem?.email) params.set("email", crmItem.email);
    if (crmItem?.phone) params.set("phone", crmItem.phone);
    if (crmItem?.name) params.set("contactPerson", crmItem.name);

    onClose();
    router.push(`/admin/companies/new?${params.toString()}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0"
        style={{
          maxWidth: "800px",
          width: "95vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 shadow-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Şirket Eşleştirme
          </DialogTitle>
          <DialogDescription>
            CRM kaydı için mevcut şirketlerle eşleştirme yapın veya yeni şirket
            oluşturun
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-hidden"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {/* CRM Item Özeti */}
          {crmItem && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Kaynak Veri
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {crmItem.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium truncate">{crmItem.company}</span>
                  </div>
                )}
                {crmItem.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{crmItem.name}</span>
                  </div>
                )}
                {crmItem.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{crmItem.email}</span>
                  </div>
                )}
                {crmItem.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{crmItem.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sonuçlar */}
          <ScrollArea
            className="flex-1"
            style={{ height: "calc(90vh - 350px)" }}
          >
            <div className="p-6">
              {/* Sonuç özeti */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {matchResults.length} eşleşme bulundu
                  </span>
                </div>
                {matchResults.some(m => m.score >= 90) && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yüksek eşleşme var
                  </Badge>
                )}
              </div>

              {/* Eşleşme listesi */}
              {matchResults.length > 0 ? (
                <div className="space-y-3">
                  {matchResults.map((match) => (
                    <div
                      key={match.company.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                        selectedCompany?.id === match.company.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                      onClick={() => handleSelectCompany(match.company)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Sol: Şirket bilgileri */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {match.company.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className={getStatusColor(match.company.status)}
                            >
                              {getStatusLabel(match.company.status)}
                            </Badge>
                          </div>

                          {/* İletişim bilgileri */}
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {match.company.email && (
                              <div className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{match.company.email}</span>
                              </div>
                            )}
                            {match.company.phone && (
                              <div className="flex items-center gap-1 truncate">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{match.company.phone}</span>
                              </div>
                            )}
                            {match.company.contactPerson && (
                              <div className="flex items-center gap-1 truncate">
                                <User className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{match.company.contactPerson}</span>
                              </div>
                            )}
                          </div>

                          {/* Eşleşen alan */}
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {match.matchedField}
                          </Badge>
                        </div>

                        {/* Sağ: Skor ve aksiyonlar */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {/* Skor */}
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${
                                match.score >= 90
                                  ? "text-green-600"
                                  : match.score >= 70
                                  ? "text-blue-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              %{match.score}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                match.score >= 90
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : match.score >= 70
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {match.score >= 90 ? "Yüksek" : match.score >= 70 ? "Orta" : "Düşük"}
                            </Badge>
                          </div>

                          {/* Şirkete git butonu */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoToCompany(match.company.id);
                            }}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Şirkete Git
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    Eşleşen şirket bulunamadı
                  </p>
                  <p className="text-gray-400 text-sm">
                    Bu müşteri için yeni bir şirket kaydı oluşturabilirsiniz
                  </p>
                </div>
              )}

              {/* Yeni şirket oluşturma bölümü */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {!showCreateForm ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Yeni Şirket Oluştur
                      </h4>
                      <p className="text-sm text-gray-500">
                        Eşleşme bulunamadıysa veya yeni bir kayıt istiyorsanız
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleGoToNewCompanyPage}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Detaylı Form
                      </Button>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Hızlı Oluştur
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Hızlı Şirket Oluşturma
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreateForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Oluşturulacak veriler özeti */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                        <p className="text-gray-500 mb-2">
                          Aşağıdaki bilgilerle yeni şirket oluşturulacak:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-400">Firma Adı:</span>{" "}
                            <span className="font-medium">
                              {crmItem?.company || crmItem?.name || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">E-posta:</span>{" "}
                            <span className="font-medium">
                              {crmItem?.email || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Telefon:</span>{" "}
                            <span className="font-medium">
                              {crmItem?.phone || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              İletişim Kişisi:
                            </span>{" "}
                            <span className="font-medium">
                              {crmItem?.name || "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* İş kolu seçimi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          İş Kolu
                        </label>
                        <Select
                          value={newCompanyBusinessLine}
                          onValueChange={setNewCompanyBusinessLine}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="İş kolu seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_LINES.map((line) => (
                              <SelectItem key={line.value} value={line.value}>
                                {line.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Oluştur butonu */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleCreateCompany}
                          disabled={creating}
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Şirket Oluştur
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleGoToNewCompanyPage}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Detaylı Form
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          {selectedCompany && (
            <Button onClick={() => handleGoToCompany(selectedCompany.id)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Seçili Şirkete Git
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
