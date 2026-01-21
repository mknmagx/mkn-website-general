"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllCustomers,
  findCustomerByContact,
  createCustomer,
  getCustomer,
} from "../../../lib/services/crm-v2/customer-service";
import { CUSTOMER_TYPE, PRIORITY } from "../../../lib/services/crm-v2/schema";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

// Icons
import {
  Search,
  Building2,
  User,
  Mail,
  Phone,
  Check,
  X,
  Loader2,
  Plus,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// CUSTOMER AUTOCOMPLETE - Inline arama ve seçim
// ============================================================================
export function CustomerAutocomplete({
  value = null, // Seçili müşteri ID
  onSelect, // (customer) => void - Müşteri seçildiğinde
  onCustomerData, // (customerData) => void - Müşteri verisi değiştiğinde
  placeholder = "Müşteri ara veya yeni ekle...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Seçili müşteriyi yükle
  useEffect(() => {
    if (value && !selectedCustomer) {
      loadCustomer(value);
    }
  }, [value]);

  const loadCustomer = async (customerId) => {
    try {
      const customer = await getCustomer(customerId);
      if (customer) {
        setSelectedCustomer(customer);
        if (onCustomerData) {
          onCustomerData({
            companyName: customer.company?.name || customer.name || "",
            contactName: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading customer:", error);
    }
  };

  // Müşteri arama
  useEffect(() => {
    if (open && debouncedSearch) {
      searchCustomers(debouncedSearch);
    } else if (open && !debouncedSearch) {
      loadRecentCustomers();
    }
  }, [open, debouncedSearch]);

  const loadRecentCustomers = async () => {
    setLoading(true);
    try {
      const result = await getAllCustomers({
        limitCount: 10,
        sortBy: "updatedAt",
        sortDirection: "desc",
      });
      setCustomers(result || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (term) => {
    setLoading(true);
    try {
      const result = await getAllCustomers({
        searchTerm: term,
        limitCount: 20,
      });
      setCustomers(result || []);
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setOpen(false);
    setSearchTerm("");

    if (onSelect) {
      onSelect(customer);
    }

    if (onCustomerData) {
      onCustomerData({
        companyName: customer.company?.name || customer.name || "",
        contactName: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
    }
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    if (onSelect) {
      onSelect(null);
    }
    if (onCustomerData) {
      onCustomerData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
      });
    }
  };

  const handleCreateNew = () => {
    setOpen(false);
    setShowCreateModal(true);
  };

  const handleCustomerCreated = (customer) => {
    handleSelect(customer);
    setShowCreateModal(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[40px] py-2 px-3",
              !selectedCustomer && "text-muted-foreground"
            )}
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm truncate">
                    {selectedCustomer.company?.name || selectedCustomer.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedCustomer.email ||
                      selectedCustomer.phone ||
                      "İletişim bilgisi yok"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Firma adı, e-posta veya telefon..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-slate-500 mb-3">
                        Müşteri bulunamadı
                      </p>
                      <Button size="sm" onClick={handleCreateNew}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Yeni Müşteri Oluştur
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="Müşteriler">
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={() => handleSelect(customer)}
                        className="flex items-start gap-3 py-2 cursor-pointer"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {customer.company?.name || customer.name}
                          </div>
                          {customer.name && customer.company?.name && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {customer.name}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            {customer.email && (
                              <span className="flex items-center gap-0.5">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </span>
                            )}
                            {customer.phone && (
                              <span className="flex items-center gap-0.5">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedCustomer?.id === customer.id && (
                          <Check className="h-4 w-4 text-blue-600 shrink-0" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Müşteri Oluştur
                    </Button>
                  </div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Yeni Müşteri Oluşturma Modal */}
      <CreateCustomerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCustomerCreated={handleCustomerCreated}
        initialData={searchTerm ? { companyName: searchTerm } : null}
      />
    </>
  );
}

// ============================================================================
// CUSTOMER SELECTOR MODAL - Full screen modal
// ============================================================================
const PAGE_SIZE = 30;

export function CustomerSelector({
  open,
  onClose,
  onSelect,
  selectedCustomerId = null,
}) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setCustomers([]);
      setLastDoc(null);
      setHasMore(false);
      loadCustomers();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      // Reset and search when search term changes
      setCustomers([]);
      setLastDoc(null);
      setHasMore(false);

      if (debouncedSearch) {
        searchCustomers();
      } else {
        loadCustomers();
      }
    }
  }, [debouncedSearch]);

  const loadCustomers = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getAllCustomers({
        limitCount: PAGE_SIZE,
        sortBy: "updatedAt",
        sortDirection: "desc",
        startAfterDoc: loadMore ? lastDoc : null,
        returnLastDoc: true,
      });

      if (result.customers) {
        if (loadMore) {
          setCustomers((prev) => [...prev, ...result.customers]);
        } else {
          setCustomers(result.customers);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      if (!loadMore) setCustomers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const searchCustomers = async () => {
    setLoading(true);
    try {
      // Arama yapılırken tüm koleksiyonda ara (limit yok)
      const result = await getAllCustomers({
        searchTerm: debouncedSearch,
        limitCount: 0, // Tüm koleksiyonda ara
        sortBy: "updatedAt",
        sortDirection: "desc",
      });
      setCustomers(result || []);
      setHasMore(false); // Arama sonuçlarında pagination yok
      setTotalCount(result?.length || 0);
    } catch (error) {
      console.error("Error searching customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadCustomers(true);
    }
  };

  const handleSelect = (customer) => {
    onSelect(customer);
    onClose();
  };

  const handleCustomerCreated = (customer) => {
    handleSelect(customer);
    setShowCreateModal(false);
  };

  const getTypeBadge = (type) => {
    const styles = {
      [CUSTOMER_TYPE.LEAD]: "bg-blue-50 text-blue-600 border-blue-200",
      [CUSTOMER_TYPE.PROSPECT]: "bg-amber-50 text-amber-600 border-amber-200",
      [CUSTOMER_TYPE.CUSTOMER]:
        "bg-emerald-50 text-emerald-600 border-emerald-200",
      [CUSTOMER_TYPE.VIP]: "bg-purple-50 text-purple-600 border-purple-200",
      [CUSTOMER_TYPE.CHURNED]: "bg-red-50 text-red-600 border-red-200",
    };
    return styles[type] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getTypeLabel = (type) => {
    const labels = {
      [CUSTOMER_TYPE.LEAD]: "Lead",
      [CUSTOMER_TYPE.PROSPECT]: "Prospect",
      [CUSTOMER_TYPE.CUSTOMER]: "Müşteri",
      [CUSTOMER_TYPE.VIP]: "VIP",
      [CUSTOMER_TYPE.CHURNED]: "Kayıp",
    };
    return labels[type] || type;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="p-0 gap-0 overflow-hidden"
          style={{ maxWidth: "600px", width: "95vw" }}
        >
          {/* Header */}
          <DialogHeader className="px-4 py-3 border-b bg-slate-50">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              Müşteri Seç
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sipariş için mevcut bir müşteri seçin veya yeni müşteri oluşturun.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="px-4 py-3 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Firma adı, e-posta veya telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Yeni Müşteri Oluştur
            </Button>
          </div>

          {/* Customer List */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "400px", minHeight: "200px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Building2 className="h-8 w-8 mb-2" />
                <p className="text-sm">Müşteri bulunamadı</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowCreateModal(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Yeni Müşteri Oluştur
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {/* Sonuç sayısı */}
                {debouncedSearch && (
                  <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500">
                    {customers.length} müşteri bulundu
                  </div>
                )}

                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left",
                      selectedCustomerId === customer.id && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {customer.company?.name || customer.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getTypeBadge(customer.type))}
                        >
                          {getTypeLabel(customer.type)}
                        </Badge>
                      </div>
                      {customer.name && customer.company?.name && (
                        <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" />
                          {customer.name}
                          {customer.company?.position && (
                            <span className="text-slate-400">
                              • {customer.company.position}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedCustomerId === customer.id && (
                      <Check className="h-5 w-5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}

                {/* Daha fazla yükle butonu */}
                {hasMore && !debouncedSearch && (
                  <div className="p-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Daha Fazla Yükle
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Yeni Müşteri Modal */}
      <CreateCustomerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCustomerCreated={handleCustomerCreated}
        initialData={searchTerm ? { companyName: searchTerm } : null}
      />
    </>
  );
}

// ============================================================================
// CREATE CUSTOMER MODAL - Yeni müşteri oluşturma
// ============================================================================
export function CreateCustomerModal({
  open,
  onClose,
  onCustomerCreated,
  initialData = null,
}) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    position: "",
    notes: "",
  });

  // Initialize form with initial data
  useEffect(() => {
    if (open && initialData) {
      setFormData((prev) => ({
        ...prev,
        companyName: initialData.companyName || "",
        contactName: initialData.contactName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
      }));
    }
    if (!open) {
      // Reset form when closed
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        position: "",
        notes: "",
      });
      setMatchedCustomer(null);
    }
  }, [open, initialData]);

  // E-posta veya telefon ile eşleşme kontrolü
  const checkForExistingCustomer = useCallback(async () => {
    if (!formData.email && !formData.phone) {
      setMatchedCustomer(null);
      return;
    }

    setChecking(true);
    try {
      const existing = await findCustomerByContact(
        formData.email || null,
        formData.phone || null
      );
      setMatchedCustomer(existing);
    } catch (error) {
      console.error("Error checking customer:", error);
    } finally {
      setChecking(false);
    }
  }, [formData.email, formData.phone]);

  // Debounced check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email || formData.phone) {
        checkForExistingCustomer();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, formData.phone]);

  const handleUseExisting = () => {
    if (matchedCustomer && onCustomerCreated) {
      onCustomerCreated(matchedCustomer);
    }
  };

  const handleCreate = async () => {
    if (!formData.companyName && !formData.contactName) {
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        name: formData.contactName || formData.companyName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        notes: formData.notes,
        type: CUSTOMER_TYPE.LEAD,
        priority: PRIORITY.NORMAL,
      };

      const newCustomer = await createCustomer(customerData);

      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Yeni Müşteri Oluştur
          </DialogTitle>
          <DialogDescription>
            Müşteri bilgilerini girin. E-posta veya telefon ile mevcut müşteri
            eşleşmesi otomatik kontrol edilir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Eşleşme Uyarısı */}
          {matchedCustomer && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Bu iletişim bilgisiyle kayıtlı müşteri bulundu!
                  </p>
                  <div className="mt-2 p-2 bg-white rounded border border-amber-100">
                    <div className="font-medium text-sm">
                      {matchedCustomer.company?.name || matchedCustomer.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {matchedCustomer.email}{" "}
                      {matchedCustomer.phone && `• ${matchedCustomer.phone}`}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleUseExisting}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Bu Müşteriyi Kullan
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-sm font-medium">Firma Adı *</Label>
              <Input
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                placeholder="Firma adı"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Yetkili Kişi</Label>
              <Input
                value={formData.contactName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactName: e.target.value,
                  }))
                }
                placeholder="Ad Soyad"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Pozisyon</Label>
              <Input
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
                placeholder="Satın Alma Müdürü"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">E-posta</Label>
              <div className="relative mt-1.5">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@firma.com"
                />
                {checking && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Telefon</Label>
              <div className="relative mt-1.5">
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+90 5XX XXX XX XX"
                />
                {checking && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              loading || (!formData.companyName && !formData.contactName)
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Müşteri Oluştur
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CUSTOMER SUMMARY CARD - Seçili müşteri özeti
// ============================================================================
export function CustomerSummaryCard({ customer, onRemove, onEdit }) {
  if (!customer) return null;

  return (
    <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-blue-900">
              {customer.company?.name || customer.name}
            </span>
            <Badge
              variant="outline"
              className="text-xs bg-blue-100 text-blue-700 border-blue-200"
            >
              CRM Müşterisi
            </Badge>
          </div>
          {customer.name && customer.company?.name && (
            <div className="text-xs text-blue-700 mt-0.5 flex items-center gap-1">
              <User className="h-3 w-3" />
              {customer.name}
            </div>
          )}
          <div className="text-xs text-blue-600 flex items-center gap-3 mt-1">
            {customer.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {customer.email}
              </span>
            )}
            {customer.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.phone}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-blue-600 hover:text-red-600 hover:bg-red-50"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
