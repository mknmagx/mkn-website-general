"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  getCompanyById,
  updateCompany,
  updateCompanyNotes,
  updateCompanyReminders,
  addPricingCalculationToCompany,
  removePricingCalculationFromCompany,
} from "../../../../lib/services/companies-service";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Globe,
  Edit2,
  MessageSquare,
  Bell,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Plus,
  ExternalLink,
  Package,
  ShoppingCart,
  Loader2,
  Calendar,
  Eye,
  Check,
  X,
  Copy,
  Calculator,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { formatPrice } from "../../../../lib/services/proforma-service";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "../../../../hooks/use-toast";
import * as PricingService from "../../../../lib/services/pricing-service";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [companyDetailsTab, setCompanyDetailsTab] = useState("info");
  const [newNote, setNewNote] = useState("");
  const [newReminder, setNewReminder] = useState({ date: "", description: "" });

  // Editing states
  const [editMode, setEditMode] = useState({});
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  // Related data states
  const [proformas, setProformas] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [relatedDataLoading, setRelatedDataLoading] = useState(false);

  // Pricing calculations states
  const [allCalculations, setAllCalculations] = useState([]);
  const [calculationsLoading, setCalculationsLoading] = useState(false);
  const [showCalculationsDialog, setShowCalculationsDialog] = useState(false);

  // Firestore'dan firma verilerini yükle
  const loadCompany = async () => {
    try {
      setLoading(true);
      const companyData = await getCompanyById(params.id);
      if (companyData) {
        setCompany(companyData);
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error("Error loading company:", error);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  // Load related data from Firestore
  const loadRelatedData = async () => {
    if (!company) return;

    try {
      setRelatedDataLoading(true);

      // Load Proformas
      try {
        const proformasQuery = query(
          collection(db, "proformas"),
          where("companyId", "==", params.id),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const proformasSnapshot = await getDocs(proformasQuery);
        const proformasData = proformasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProformas(proformasData);
      } catch (error) {
        console.error("Error loading proformas:", error);
        setProformas([]);
      }

      // Load Contracts
      try {
        const contractsQuery = query(
          collection(db, "contracts"),
          where("companyId", "==", params.id),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const contractsSnapshot = await getDocs(contractsQuery);
        const contractsData = contractsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContracts(contractsData);
      } catch (error) {
        console.error("Error loading contracts:", error);
        setContracts([]);
      }

      // Load Deliveries
      try {
        const deliveriesQuery = query(
          collection(db, "deliveries"),
          where("companyInfo.companyName", "==", company.name),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = deliveriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveriesData);
      } catch (error) {
        console.error("Error loading deliveries:", error);
        setDeliveries([]);
      }

      // Load Integrations
      try {
        const integrationsQuery = query(
          collection(db, "integrations"),
          where("companyId", "==", params.id),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const integrationsSnapshot = await getDocs(integrationsQuery);
        const integrationsData = integrationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIntegrations(integrationsData);
      } catch (error) {
        console.error("Error loading integrations:", error);
        setIntegrations([]);
      }
    } catch (error) {
      console.error("Error loading related data:", error);
    } finally {
      setRelatedDataLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadCompany();
    }
  }, [params.id]);

  useEffect(() => {
    if (company) {
      loadRelatedData();
      loadAllCalculations();
    }
  }, [company]);

  // Load all pricing calculations
  const loadAllCalculations = async () => {
    try {
      setCalculationsLoading(true);
      const data = await PricingService.getPricingCalculations();
      setAllCalculations(data);
    } catch (error) {
      console.error("Error loading calculations:", error);
    } finally {
      setCalculationsLoading(false);
    }
  };

  // Add calculation to company
  const handleAddCalculation = async (calculation) => {
    try {
      // Pricing calculator'dan gelen veri yapısını kontrol et
      const totalCost = calculation.calculations?.totalCostPerUnit
        ? calculation.calculations.totalCostPerUnit *
          (calculation.quantity || 1)
        : calculation.totals?.totalCost || 0;

      const finalPrice = calculation.calculations?.unitPrice
        ? calculation.calculations.unitPrice * (calculation.quantity || 1)
        : calculation.totals?.sellingPrice || 0;

      const profitMargin =
        calculation.formData?.profitMarginPercent ||
        calculation.profitMargin ||
        calculation.calculations?.profitPerUnit ||
        0;

      await addPricingCalculationToCompany(params.id, {
        calculationId: calculation.id,
        productName:
          calculation.productName || calculation.formData?.productName,
        productVolume:
          calculation.productVolume || calculation.formData?.productVolume,
        quantity: calculation.quantity,
        totalCost: totalCost,
        totalCostPerUnit: calculation.calculations?.totalCostPerUnit,
        unitPrice: calculation.calculations?.unitPrice,
        profitMargin: profitMargin,
        profitPerUnit: calculation.calculations?.profitPerUnit,
        finalPrice: finalPrice,
        totalPrice: calculation.calculations?.totalPrice,
        notes: calculation.notes || calculation.formData?.notes,
        productType:
          calculation.productType || calculation.formData?.productType,
      });

      await loadCompany(); // Reload company data
      setShowCalculationsDialog(false);

      toast({
        title: "Başarılı",
        description: "Hesaplama firmaya eklendi",
      });
    } catch (error) {
      console.error("Error adding calculation:", error);
      toast({
        title: "Hata",
        description: "Hesaplama eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Remove calculation from company
  const handleRemoveCalculation = async (calculationId) => {
    try {
      await removePricingCalculationFromCompany(params.id, calculationId);
      await loadCompany(); // Reload company data

      toast({
        title: "Başarılı",
        description: "Hesaplama kaldırıldı",
      });
    } catch (error) {
      console.error("Error removing calculation:", error);
      toast({
        title: "Hata",
        description: "Hesaplama kaldırılırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Inline editing functions
  const startEdit = (field, currentValue) => {
    setEditMode({ ...editMode, [field]: true });
    setEditValues({ ...editValues, [field]: currentValue || "" });
  };

  const cancelEdit = (field) => {
    const newEditMode = { ...editMode };
    const newEditValues = { ...editValues };
    delete newEditMode[field];
    delete newEditValues[field];
    setEditMode(newEditMode);
    setEditValues(newEditValues);
  };

  const saveEdit = async (field) => {
    try {
      setSaving(true);
      await updateCompany(params.id, { [field]: editValues[field] });
      setCompany({ ...company, [field]: editValues[field] });
      cancelEdit(field);
      toast({
        title: "Başarılı",
        description: "Değişiklikler kaydedildi",
      });
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Hata",
        description: "Güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Panoya kopyalandı",
    });
  };

  // Not ekleme
  const handleAddNote = async () => {
    if (!newNote.trim() || !company) return;

    try {
      const note = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        author: user?.name || "Admin User",
        content: newNote,
        type: "note",
      };

      const updatedNotes = [note, ...(company.notes || [])];
      await updateCompanyNotes(company.id, updatedNotes);

      setCompany((prev) => ({
        ...prev,
        notes: updatedNotes,
      }));
      setNewNote("");
      toast({
        title: "Başarılı",
        description: "Not eklendi",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Hata",
        description: "Not eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Hatırlatıcı ekleme
  const handleAddReminder = async () => {
    if (!newReminder.date || !newReminder.description.trim() || !company)
      return;

    try {
      const reminder = {
        id: Date.now().toString(),
        date: newReminder.date,
        description: newReminder.description,
        status: "pending",
        priority: "medium",
      };

      const updatedReminders = [...(company.reminders || []), reminder];
      await updateCompanyReminders(company.id, updatedReminders);

      setCompany((prev) => ({
        ...prev,
        reminders: updatedReminders,
      }));
      setNewReminder({ date: "", description: "" });
      toast({
        title: "Başarılı",
        description: "Hatırlatma eklendi",
      });
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Hata",
        description: "Hatırlatma eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <PermissionGuard requiredPermission="companies.view">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Firma bilgileri yükleniyor...
            </p>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Firma bulunamadı
          </h2>
          <p className="text-gray-600 mb-4">Aradığınız firma mevcut değil.</p>
          <Link href="/admin/companies">
            <Button>Firma Listesine Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      "active-client": "bg-green-100 text-green-800",
      lead: "bg-blue-100 text-blue-800",
      negotiation: "bg-yellow-100 text-yellow-800",
      completed: "bg-purple-100 text-purple-800",
      paused: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getBusinessLineColor = (businessLine) => {
    const colors = {
      ambalaj: "bg-indigo-100 text-indigo-800",
      eticaret: "bg-violet-100 text-violet-800",
      pazarlama: "bg-pink-100 text-pink-800",
      "fason-kozmetik": "bg-emerald-100 text-emerald-800",
      "fason-gida": "bg-orange-100 text-orange-800",
      "fason-temizlik": "bg-cyan-100 text-cyan-800",
      tasarim: "bg-purple-100 text-purple-800",
    };
    return colors[businessLine] || "bg-gray-100 text-gray-800";
  };

  const getBusinessLineLabel = (businessLine) => {
    const labels = {
      ambalaj: "Ambalaj Üretimi",
      eticaret: "E-ticaret Yönetimi",
      pazarlama: "Pazarlama Hizmetleri",
      "fason-kozmetik": "Fason Üretim - Kozmetik",
      "fason-gida": "Fason Üretim - Gıda Takviyesi",
      "fason-temizlik": "Fason Üretim - Temizlik Ürünleri",
      tasarim: "Tasarım Hizmetleri",
    };
    return labels[businessLine] || "Diğer";
  };

  const getStatusLabel = (status) => {
    const labels = {
      lead: "Potansiyel Müşteri",
      negotiation: "Görüşme Aşamasında",
      "active-client": "Aktif Müşteri",
      completed: "Tamamlandı",
      paused: "Beklemede",
    };
    return labels[status] || "Diğer";
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: "Yüksek Öncelik",
      medium: "Orta Öncelik",
      low: "Düşük Öncelik",
    };
    return labels[priority] || "Normal";
  };

  const getProformaStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: "Taslak", color: "bg-gray-100 text-gray-800" },
      sent: { label: "Gönderildi", color: "bg-blue-100 text-blue-800" },
      approved: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
      rejected: { label: "Reddedildi", color: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getContractStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: "Taslak", color: "bg-gray-100 text-gray-800" },
      active: { label: "Aktif", color: "bg-green-100 text-green-800" },
      completed: { label: "Tamamlandı", color: "bg-blue-100 text-blue-800" },
      cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDeliveryStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
      shipped: { label: "Kargoda", color: "bg-blue-100 text-blue-800" },
      delivered: {
        label: "Teslim Edildi",
        color: "bg-green-100 text-green-800",
      },
      cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Editable Field Component
  const EditableField = ({
    label,
    field,
    value,
    type = "text",
    icon: Icon,
    isLink = false,
    isEmail = false,
    isPhone = false,
  }) => {
    const isEditing = editMode[field];

    return (
      <div className="group">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
          {label}
        </label>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type={type}
              value={editValues[field]}
              onChange={(e) =>
                setEditValues({ ...editValues, [field]: e.target.value })
              }
              className="flex-1"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => saveEdit(field)}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit(field)}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {Icon && (
                <div className="bg-blue-50 rounded-lg p-2 flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {isLink && value ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium truncate"
                  >
                    {value.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : isEmail && value ? (
                  <a
                    href={`mailto:${value}`}
                    className="text-blue-600 hover:underline font-medium truncate block"
                  >
                    {value}
                  </a>
                ) : isPhone && value ? (
                  <a
                    href={`tel:${value}`}
                    className="text-blue-600 hover:underline font-medium truncate block"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-gray-900 font-medium truncate">
                    {value || "-"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {value && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(value)}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startEdit(field, value)}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <PermissionGuard requiredPermission="companies.view">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    {editMode["name"] ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValues["name"]}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="text-2xl font-bold h-auto py-2 px-3"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit("name")}
                          disabled={saving}
                          className="bg-green-500 hover:bg-green-600 h-9 w-9 p-0"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelEdit("name")}
                          disabled={saving}
                          className="h-9 w-9 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="group/title flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                          {company.name}
                        </h1>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit("name", company.name)}
                          className="h-8 w-8 p-0 opacity-0 group-hover/title:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    <p className="text-gray-600 mt-1">
                      {getBusinessLineLabel(company.businessLine)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(company.status)}>
                  {getStatusLabel(company.status)}
                </Badge>
                <Badge className={getPriorityColor(company.priority)}>
                  {getPriorityLabel(company.priority)}
                </Badge>
                <Badge className={getBusinessLineColor(company.businessLine)}>
                  {company.businessLine}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Stats Cards - Modern Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
              className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveView("proformas")}
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">
                  PROFORMALAR
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {proformas.length}
              </div>
              <div className="text-sm mt-2 opacity-80">Toplam proforma</div>
            </div>

            <div
              className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveView("contracts")}
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">
                  SÖZLEŞMELER
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {contracts.length}
              </div>
              <div className="text-sm mt-2 opacity-80">Aktif sözleşme</div>
            </div>

            <div
              className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveView("deliveries")}
            >
              <div className="flex items-center justify-between mb-4">
                <Package className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">
                  TESLİMATLAR
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {deliveries.length}
              </div>
              <div className="text-sm mt-2 opacity-80">Toplam teslimat</div>
            </div>

            <div
              className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveView("integrations")}
            >
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">
                  ENTEGRASYONLAR
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {integrations.length}
              </div>
              <div className="text-sm mt-2 opacity-80">Aktif entegrasyon</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-200">
              <nav className="flex gap-2">
                {[
                  { id: "overview", label: "Genel Bakış", icon: Building2 },
                  { id: "proformas", label: "Proformalar", icon: FileText },
                  { id: "contracts", label: "Sözleşmeler", icon: FileText },
                  { id: "deliveries", label: "Teslimatlar", icon: Package },
                  {
                    id: "integrations",
                    label: "Entegrasyonlar",
                    icon: ShoppingCart,
                  },
                  {
                    id: "calculations",
                    label: "Hesaplamalar",
                    icon: Calculator,
                  },
                  { id: "notes", label: "Notlar", icon: MessageSquare },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`flex items-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                        activeView === tab.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* View Content */}
          <div className="space-y-6">
            {/* Overview View */}
            {activeView === "overview" && (
              <>
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Contact & Person Combined Card */}
                    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Contact Information Side */}
                        <div className="p-6 border-r border-gray-100">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-500 rounded-xl p-2">
                              <Phone className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900">
                              İletişim Bilgileri
                            </h3>
                          </div>
                          <div className="space-y-4">
                            <EditableField
                              label="Telefon"
                              field="phone"
                              value={company.phone}
                              icon={Phone}
                              isPhone
                            />
                            <EditableField
                              label="E-posta"
                              field="email"
                              value={company.email}
                              icon={Mail}
                              isEmail
                            />
                            <EditableField
                              label="Website"
                              field="website"
                              value={company.website}
                              icon={Globe}
                              isLink
                            />
                          </div>
                        </div>

                        {/* Contact Person Side */}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-500 rounded-xl p-2">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900">
                              İletişim Kişisi
                            </h3>
                          </div>
                          <div className="space-y-4">
                            <EditableField
                              label="İsim Soyisim"
                              field="contactPerson"
                              value={company.contactPerson}
                              icon={Users}
                            />
                            <EditableField
                              label="Pozisyon"
                              field="contactPosition"
                              value={company.contactPosition}
                              icon={Building2}
                            />
                            <EditableField
                              label="Direkt Telefon"
                              field="contactPhone"
                              value={company.contactPhone}
                              icon={Phone}
                              isPhone
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Address Card - Full Width */}
                    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                      <CardContent className="p-6">
                        <EditableField
                          label="Adres"
                          field="address"
                          value={company.address}
                          icon={MapPin}
                        />
                      </CardContent>
                    </Card>

                    {/* Tax Information */}
                    {(company.taxOffice ||
                      company.taxNumber ||
                      company.mersisNumber ||
                      editMode.taxOffice ||
                      editMode.taxNumber ||
                      editMode.mersisNumber) && (
                      <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-white border-b border-gray-100">
                          <CardTitle className="flex items-center gap-3 text-gray-900">
                            <div className="bg-purple-500 rounded-xl p-2">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            Vergi Bilgileri
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <EditableField
                              label="Vergi Dairesi"
                              field="taxOffice"
                              value={company.taxOffice}
                            />
                            <EditableField
                              label="Vergi No"
                              field="taxNumber"
                              value={company.taxNumber}
                            />
                            <EditableField
                              label="Mersis No"
                              field="mersisNumber"
                              value={company.mersisNumber}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Right Column - Sidebar */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Company Details with Tabs */}
                    <Card className="border-0 shadow-md rounded-2xl bg-white">
                      <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center gap-3 text-gray-900">
                          <div className="bg-indigo-500 rounded-xl p-2">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          Firma Detayları
                        </CardTitle>
                      </CardHeader>
                      <div className="border-b border-gray-100">
                        <div className="flex gap-1 p-2">
                          <button
                            onClick={() => setCompanyDetailsTab("info")}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              companyDetailsTab === "info"
                                ? "bg-indigo-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            Bilgiler
                          </button>
                          <button
                            onClick={() => setCompanyDetailsTab("settings")}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              companyDetailsTab === "settings"
                                ? "bg-indigo-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            Ayarlar
                          </button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        {companyDetailsTab === "info" && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                              <span className="text-sm text-gray-600">
                                Kuruluş Yılı
                              </span>
                              <span className="font-semibold text-gray-900">
                                {company.foundedYear || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                              <span className="text-sm text-gray-600">
                                Çalışan Sayısı
                              </span>
                              <span className="font-semibold text-gray-900">
                                {company.employees || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                              <span className="text-sm text-gray-600">
                                İş Kolu
                              </span>
                              <Badge
                                className={getBusinessLineColor(
                                  company.businessLine
                                )}
                              >
                                {company.businessLine}
                              </Badge>
                            </div>
                            {company.satisfaction && (
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                                <span className="text-sm text-gray-600">
                                  Memnuniyet
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-semibold text-gray-900">
                                    {company.satisfaction}/5
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {companyDetailsTab === "settings" && (
                          <div className="space-y-4">
                            <EditableField
                              label="Vergi Dairesi"
                              field="taxOffice"
                              value={company.taxOffice}
                              icon={FileText}
                            />
                            <EditableField
                              label="Vergi Numarası"
                              field="taxNumber"
                              value={company.taxNumber}
                              icon={FileText}
                            />
                            <EditableField
                              label="Mersis No"
                              field="mersisNumber"
                              value={company.mersisNumber}
                              icon={FileText}
                            />
                            <div className="pt-2 border-t border-gray-100">
                              <EditableField
                                label="Kuruluş Yılı"
                                field="foundedYear"
                                value={company.foundedYear}
                                type="number"
                                icon={Calendar}
                              />
                            </div>
                            <EditableField
                              label="Çalışan Sayısı"
                              field="employees"
                              value={company.employees}
                              type="number"
                              icon={Users}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Social Media */}
                    {company.socialMedia &&
                      Object.entries(company.socialMedia).some(
                        ([_, url]) => url
                      ) && (
                        <Card className="border-0 shadow-md rounded-2xl bg-white">
                          <CardHeader className="bg-white border-b border-gray-100">
                            <CardTitle className="flex items-center gap-3 text-gray-900">
                              <div className="bg-pink-500 rounded-xl p-2">
                                <Globe className="h-5 w-5 text-white" />
                              </div>
                              Sosyal Medya
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 pt-4">
                            {Object.entries(company.socialMedia).map(
                              ([platform, url]) =>
                                url && (
                                  <a
                                    key={platform}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    <span className="capitalize font-medium text-gray-700 group-hover:text-blue-600">
                                      {platform}
                                    </span>
                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                  </a>
                                )
                            )}
                          </CardContent>
                        </Card>
                      )}

                    {/* Quick Actions - Minimalist Grid */}
                    <Card className="border-0 shadow-md rounded-2xl bg-white">
                      <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center gap-3 text-gray-900">
                          <div className="bg-gray-900 rounded-xl p-2">
                            <Plus className="h-5 w-5 text-white" />
                          </div>
                          Hızlı İşlemler
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href={`/admin/proformas/new?companyId=${company.id}`}
                          >
                            <div className="group cursor-pointer bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all">
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className="bg-blue-50 group-hover:bg-blue-500 rounded-xl p-3 transition-colors">
                                  <FileText className="h-5 w-5 text-blue-500 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                  Proforma
                                </span>
                              </div>
                            </div>
                          </Link>
                          <Link
                            href={`/admin/contracts/new?companyId=${company.id}`}
                          >
                            <div className="group cursor-pointer bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-green-500 hover:shadow-md transition-all">
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className="bg-green-50 group-hover:bg-green-500 rounded-xl p-3 transition-colors">
                                  <FileText className="h-5 w-5 text-green-500 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                                  Sözleşme
                                </span>
                              </div>
                            </div>
                          </Link>
                          <Link
                            href={`/admin/deliveries/new?companyId=${company.id}`}
                          >
                            <div className="group cursor-pointer bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all">
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className="bg-purple-50 group-hover:bg-purple-500 rounded-xl p-3 transition-colors">
                                  <Package className="h-5 w-5 text-purple-500 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                  Teslimat
                                </span>
                              </div>
                            </div>
                          </Link>
                          <Link
                            href={`/admin/integrations/shopify/new?companyId=${company.id}`}
                          >
                            <div className="group cursor-pointer bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-orange-500 hover:shadow-md transition-all">
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className="bg-orange-50 group-hover:bg-orange-500 rounded-xl p-3 transition-colors">
                                  <ShoppingCart className="h-5 w-5 text-orange-500 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                                  Entegrasyon
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {/* Proformas View */}
            {activeView === "proformas" && (
              <Card className="border-0 shadow-md rounded-2xl bg-white">
                <CardHeader className="bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <div className="bg-blue-500 rounded-xl p-2">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      Proformalar ({proformas.length})
                    </CardTitle>
                    <Link href={`/admin/proformas/new?companyId=${company.id}`}>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Proforma
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {relatedDataLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Yükleniyor...</p>
                    </div>
                  ) : proformas.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Henüz proforma bulunmuyor
                      </p>
                      <Link
                        href={`/admin/proformas/new?companyId=${company.id}`}
                      >
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Proformayı Oluştur
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Proforma No</TableHead>
                            <TableHead>Müşteri</TableHead>
                            <TableHead>Tutar</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">
                              İşlemler
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {proformas.map((proforma) => (
                            <TableRow key={proforma.id}>
                              <TableCell className="font-medium">
                                {proforma.proformaNumber}
                              </TableCell>
                              <TableCell>
                                {proforma.customerInfo?.companyName || "-"}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">
                                {formatPrice(proforma.totals?.grandTotal || 0)}
                              </TableCell>
                              <TableCell>
                                {getProformaStatusBadge(proforma.status)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {proforma.createdAt
                                  ? format(
                                      proforma.createdAt.toDate(),
                                      "dd MMM yyyy",
                                      { locale: tr }
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link href={`/admin/proformas/${proforma.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Görüntüle
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contracts View */}
            {activeView === "contracts" && (
              <Card className="border-0 shadow-md rounded-2xl bg-white">
                <CardHeader className="bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <div className="bg-green-500 rounded-xl p-2">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      Sözleşmeler ({contracts.length})
                    </CardTitle>
                    <Link href={`/admin/contracts/new?companyId=${company.id}`}>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Sözleşme
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {relatedDataLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600">Yükleniyor...</p>
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Henüz sözleşme bulunmuyor
                      </p>
                      <Link
                        href={`/admin/contracts/new?companyId=${company.id}`}
                      >
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Sözleşmeyi Oluştur
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sözleşme No</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead>Firma</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">
                              İşlemler
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contracts.map((contract) => (
                            <TableRow key={contract.id}>
                              <TableCell className="font-medium">
                                {contract.contractNumber}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {contract.contractType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {contract.companyInfo?.companyName || "-"}
                              </TableCell>
                              <TableCell>
                                {getContractStatusBadge(contract.status)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {contract.createdAt
                                  ? format(
                                      contract.createdAt.toDate(),
                                      "dd MMM yyyy",
                                      { locale: tr }
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link href={`/admin/contracts/${contract.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Görüntüle
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Deliveries View */}
            {activeView === "deliveries" && (
              <Card className="border-0 shadow-md rounded-2xl bg-white">
                <CardHeader className="bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <div className="bg-purple-500 rounded-xl p-2">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      Teslimatlar ({deliveries.length})
                    </CardTitle>
                    <Link
                      href={`/admin/deliveries/new?companyId=${company.id}`}
                    >
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Teslimat
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {relatedDataLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                      <p className="text-gray-600">Yükleniyor...</p>
                    </div>
                  ) : deliveries.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Henüz teslimat bulunmuyor
                      </p>
                      <Link
                        href={`/admin/deliveries/new?companyId=${company.id}`}
                      >
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Teslimatı Ekle
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>İrsaliye No</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead>Firma</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">
                              İşlemler
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deliveries.map((delivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell className="font-medium">
                                {delivery.deliveryNumber}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{delivery.type}</Badge>
                              </TableCell>
                              <TableCell>
                                {delivery.companyInfo?.companyName || "-"}
                              </TableCell>
                              <TableCell>
                                {getDeliveryStatusBadge(delivery.status)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {delivery.createdAt
                                  ? format(
                                      delivery.createdAt.toDate(),
                                      "dd MMM yyyy",
                                      { locale: tr }
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link href={`/admin/deliveries/${delivery.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Görüntüle
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Integrations View - Modern Minimalist */}
            {activeView === "integrations" && (
              <div className="space-y-4">
                {/* Header Card */}
                <Card className="border-0 shadow-md rounded-2xl bg-white">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-gray-900">
                        <div className="bg-orange-500 rounded-xl p-2">
                          <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        Entegrasyonlar ({integrations.length})
                      </CardTitle>
                      <Link
                        href={`/admin/integrations/shopify/new?companyId=${company.id}`}
                      >
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni Entegrasyon
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>

                {/* Content */}
                {relatedDataLoading ? (
                  <div className="text-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">
                      Entegrasyonlar yükleniyor...
                    </p>
                  </div>
                ) : integrations.length === 0 ? (
                  <Card className="border-0 shadow-md rounded-2xl bg-white">
                    <CardContent className="text-center py-16">
                      <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-10 w-10 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Henüz entegrasyon yok
                      </h3>
                      <p className="text-gray-600 mb-6">
                        İlk e-ticaret entegrasyonunuzu ekleyin
                      </p>
                      <Link
                        href={`/admin/integrations/shopify/new?companyId=${company.id}`}
                      >
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Entegrasyonu Ekle
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {integrations.map((integration, index) => (
                      <Card
                        key={integration.id}
                        className="border-0 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden group"
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center gap-4 p-5">
                            {/* Index Badge */}
                            <div className="flex-shrink-0 w-12 h-12 bg-orange-50 group-hover:bg-orange-100 rounded-xl flex items-center justify-center transition-colors">
                              <span className="text-lg font-bold text-orange-600">
                                {index + 1}
                              </span>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {integration.companyName ||
                                    integration.customerName ||
                                    integration.storeName ||
                                    "İsimsiz Mağaza"}
                                </h3>
                                <Badge
                                  className={
                                    integration.status === "active"
                                      ? "bg-green-100 text-green-700 border-0"
                                      : "bg-gray-100 text-gray-600 border-0"
                                  }
                                >
                                  {integration.status === "active"
                                    ? "Aktif"
                                    : "Pasif"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Globe className="h-3.5 w-3.5" />
                                  <span className="capitalize">
                                    {integration.platform || "Shopify"}
                                  </span>
                                </div>
                                {integration.credentials?.shopDomain && (
                                  <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <span className="truncate">
                                      {integration.credentials.shopDomain}
                                      .myshopify.com
                                    </span>
                                  </>
                                )}
                                {integration.lastSyncOrderCount > 0 && (
                                  <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <span className="text-orange-600 font-medium">
                                      {integration.lastSyncOrderCount} sipariş
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Stats Info */}
                            <div className="flex-shrink-0 hidden lg:flex items-center gap-4">
                              {integration.lastSyncCustomerCount > 0 && (
                                <div className="text-center px-3 py-2 bg-blue-50 rounded-lg">
                                  <div className="text-xs text-blue-600 mb-0.5">
                                    Müşteriler
                                  </div>
                                  <div className="text-lg font-bold text-blue-700">
                                    {integration.lastSyncCustomerCount}
                                  </div>
                                </div>
                              )}
                              {integration.lastSyncOrderCount > 0 && (
                                <div className="text-center px-3 py-2 bg-green-50 rounded-lg">
                                  <div className="text-xs text-green-600 mb-0.5">
                                    Siparişler
                                  </div>
                                  <div className="text-lg font-bold text-green-700">
                                    {integration.lastSyncOrderCount}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Date Info */}
                            <div className="flex-shrink-0 text-right hidden md:block">
                              <div className="text-xs text-gray-500 mb-1">
                                {integration.lastSyncAt
                                  ? "Son Senkronizasyon"
                                  : "Oluşturulma"}
                              </div>
                              <div className="text-sm font-medium text-gray-700">
                                {(() => {
                                  const dateField =
                                    integration.lastSyncAt ||
                                    integration.createdAt;
                                  if (!dateField) return "-";
                                  try {
                                    let date;
                                    if (
                                      typeof dateField.toDate === "function"
                                    ) {
                                      date = dateField.toDate();
                                    } else if (dateField._seconds) {
                                      date = new Date(
                                        dateField._seconds * 1000
                                      );
                                    } else if (
                                      typeof dateField === "string" ||
                                      typeof dateField === "number"
                                    ) {
                                      date = new Date(dateField);
                                    } else {
                                      date = dateField;
                                    }
                                    return format(date, "dd MMM yyyy", {
                                      locale: tr,
                                    });
                                  } catch (error) {
                                    return "-";
                                  }
                                })()}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              <Link
                                href={`/admin/integrations/shopify/${integration.id}`}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="group-hover:bg-orange-50 group-hover:text-orange-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Görüntüle
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {/* Additional Info Bar */}
                          {(integration.credentials?.shopDomain ||
                            integration.companyEmail ||
                            integration.customerEmail ||
                            integration.settings?.syncInterval) && (
                            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                              <div className="flex items-center gap-4 text-xs">
                                {integration.credentials?.shopDomain && (
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Globe className="h-3 w-3" />
                                    <span className="truncate max-w-[200px]">
                                      {integration.credentials.shopDomain}
                                      .myshopify.com
                                    </span>
                                  </div>
                                )}
                                {(integration.companyEmail ||
                                  integration.customerEmail) && (
                                  <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate max-w-[180px]">
                                        {integration.companyEmail ||
                                          integration.customerEmail}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {integration.settings?.syncInterval && (
                                  <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3 text-orange-500" />
                                      <span className="text-orange-600 font-medium capitalize">
                                        {integration.settings.syncInterval ===
                                        "realtime"
                                          ? "Gerçek Zamanlı"
                                          : integration.settings.syncInterval}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {integration.webhooks?.active?.length > 0 && (
                                  <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5 text-green-600">
                                      <Bell className="h-3 w-3" />
                                      <span className="font-medium">
                                        {integration.webhooks.active.length}{" "}
                                        webhook
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calculations View - Modern Minimalist */}
            {activeView === "calculations" && (
              <div className="space-y-4">
                {/* Header Card */}
                <Card className="border-0 shadow-md rounded-2xl bg-white">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-gray-900">
                        <div className="bg-indigo-500 rounded-xl p-2">
                          <Calculator className="h-5 w-5 text-white" />
                        </div>
                        Kaydedilmiş Hesaplamalar (
                        {company.pricingCalculations?.length || 0})
                      </CardTitle>
                      <Button
                        onClick={() => setShowCalculationsDialog(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Hesaplama Ekle
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Content */}
                {company.pricingCalculations &&
                company.pricingCalculations.length > 0 ? (
                  <div className="space-y-3">
                    {company.pricingCalculations.map((calc, index) => (
                      <Card
                        key={calc.id}
                        className="border-0 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden group"
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center gap-4 p-5">
                            {/* Index Badge */}
                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-colors">
                              <span className="text-lg font-bold text-indigo-600">
                                {index + 1}
                              </span>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {calc.productName}
                                </h3>
                                {calc.productVolume && (
                                  <Badge className="bg-gray-100 text-gray-600 border-0">
                                    {calc.productVolume}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                {calc.quantity && (
                                  <>
                                    <div className="flex items-center gap-1.5">
                                      <Package className="h-3.5 w-3.5" />
                                      <span className="font-medium">
                                        {calc.quantity} adet
                                      </span>
                                    </div>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                  </>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                  <span className="text-green-600 font-medium">
                                    %{calc.profitMargin || 0} kar
                                  </span>
                                </div>
                                {calc.totalCostPerUnit && (
                                  <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <span>
                                      Maliyet:{" "}
                                      <span className="font-medium text-gray-900">
                                        {calc.totalCostPerUnit.toFixed(2)} TL
                                      </span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Price Display */}
                            <div className="flex-shrink-0 hidden md:block">
                              <div className="text-center px-4 py-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                                <div className="text-xs text-indigo-600 mb-0.5">
                                  Birim Satış
                                </div>
                                <div className="text-lg font-bold text-indigo-900">
                                  {calc.unitPrice
                                    ? `${calc.unitPrice.toFixed(2)} TL`
                                    : calc.finalPrice
                                    ? `${calc.finalPrice.toFixed(2)} TL`
                                    : "-"}
                                </div>
                              </div>
                            </div>

                            {/* Total Price (if exists) */}
                            {calc.totalPrice && (
                              <div className="flex-shrink-0 hidden lg:block">
                                <div className="text-center px-4 py-2 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                  <div className="text-xs text-green-600 mb-0.5">
                                    Toplam
                                  </div>
                                  <div className="text-lg font-bold text-green-900">
                                    {calc.totalPrice.toFixed(2)} TL
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Date */}
                            <div className="flex-shrink-0 text-right hidden sm:block">
                              <div className="text-xs text-gray-500 mb-1">
                                Eklenme Tarihi
                              </div>
                              <div className="text-sm font-medium text-gray-700">
                                {calc.addedAt
                                  ? format(
                                      new Date(calc.addedAt),
                                      "dd MMM yyyy",
                                      { locale: tr }
                                    )
                                  : "-"}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <Link
                                href={`/admin/pricing-calculations/${calc.calculationId}`}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="group-hover:bg-indigo-50 group-hover:text-indigo-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Görüntüle
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveCalculation(calc.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Additional Info Bar */}
                          {(calc.notes || calc.productType) && (
                            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                              <div className="flex items-center gap-4 text-xs">
                                {calc.productType && (
                                  <div className="flex items-center gap-1.5">
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {calc.productType}
                                    </Badge>
                                  </div>
                                )}
                                {calc.notes && (
                                  <>
                                    {calc.productType && (
                                      <div className="w-px h-3 bg-gray-300"></div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-gray-600 flex-1 min-w-0">
                                      <MessageSquare className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {calc.notes}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md rounded-2xl bg-white">
                    <CardContent className="text-center py-16">
                      <div className="bg-indigo-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Calculator className="h-10 w-10 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Henüz hesaplama yok
                      </h3>
                      <p className="text-gray-600 mb-6">
                        İlk fiyat hesaplamasını ekleyin
                      </p>
                      <Button
                        onClick={() => setShowCalculationsDialog(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        İlk Hesaplamayı Ekle
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Calculations Dialog - Modern Minimalist Single List */}
                {showCalculationsDialog && (
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCalculationsDialog(false)}
                  >
                    <div
                      className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                              <Calculator className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-white">
                                Hesaplama Seç
                              </h2>
                              <p className="text-indigo-100 text-sm">
                                Firmaya eklemek için bir hesaplama seçin
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href="/admin/pricing-calculator">
                              <Button
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Yeni Hesaplama
                              </Button>
                            </Link>
                            <button
                              onClick={() => setShowCalculationsDialog(false)}
                              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
                        {calculationsLoading ? (
                          <div className="text-center py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-3" />
                            <p className="text-gray-600">
                              Hesaplamalar yükleniyor...
                            </p>
                          </div>
                        ) : allCalculations.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                              <Calculator className="h-10 w-10 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-semibold mb-2">
                              Henüz hesaplama yok
                            </p>
                            <p className="text-gray-600 text-sm mb-4">
                              İlk hesaplamayı oluşturun
                            </p>
                            <Link href="/admin/pricing-calculator">
                              <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Yeni Hesaplama
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {allCalculations.map((calc, index) => (
                              <div
                                key={calc.id}
                                onClick={() => handleAddCalculation(calc)}
                                className="group bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-white border border-gray-200 hover:border-indigo-300 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Index Badge */}
                                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                                    <span className="text-sm font-semibold text-gray-600 group-hover:text-indigo-600">
                                      {index + 1}
                                    </span>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-900 mb-1 truncate">
                                      {calc.productName ||
                                        calc.formData?.productName ||
                                        "İsimsiz Ürün"}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500">
                                          Maliyet:
                                        </span>
                                        <span className="font-medium text-gray-700">
                                          {calc.calculations?.totalCostPerUnit
                                            ? `${calc.calculations.totalCostPerUnit.toFixed(
                                                2
                                              )} TL`
                                            : calc.totals?.totalCost
                                            ? `${calc.totals.totalCost.toFixed(
                                                2
                                              )} TL`
                                            : "-"}
                                        </span>
                                      </div>
                                      <div className="w-px h-4 bg-gray-200"></div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500">
                                          Kar:
                                        </span>
                                        <span className="font-medium text-gray-700">
                                          {calc.formData?.profitMarginPercent ||
                                            calc.profitMargin ||
                                            calc.calculations?.profitPerUnit ||
                                            0}
                                          %
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Price */}
                                  <div className="flex-shrink-0 text-right">
                                    <div className="text-xs text-gray-500 mb-1">
                                      Satış Fiyatı
                                    </div>
                                    <div className="text-lg font-bold text-indigo-600 group-hover:text-indigo-700">
                                      {calc.calculations?.unitPrice
                                        ? `${calc.calculations.unitPrice.toFixed(
                                            2
                                          )} TL`
                                        : calc.totals?.sellingPrice
                                        ? `${calc.totals.sellingPrice.toFixed(
                                            2
                                          )} TL`
                                        : "-"}
                                    </div>
                                  </div>

                                  {/* Arrow Icon */}
                                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                      <Plus className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes View */}
            {activeView === "notes" && (
              <div className="space-y-6">
                {/* Add Note */}
                <Card className="border-0 shadow-md rounded-2xl bg-white">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <div className="bg-blue-500 rounded-xl p-2">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      Yeni Not Ekle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Görüşme notları, önemli bilgiler veya gözlemlerinizi buraya yazın..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={4}
                      className="resize-none border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Not Ekle
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes List */}
                <div className="space-y-4">
                  {company.notes && company.notes.length > 0 ? (
                    company.notes.map((note) => (
                      <Card
                        key={note.id}
                        className="border-0 shadow-sm rounded-2xl bg-white"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {note.author}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {note.date
                                    ? format(
                                        new Date(note.date),
                                        "dd MMM yyyy HH:mm",
                                        { locale: tr }
                                      )
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700"
                            >
                              {note.type === "meeting"
                                ? "Toplantı"
                                : note.type === "project"
                                ? "Proje"
                                : note.type === "update"
                                ? "Güncelleme"
                                : "Not"}
                            </Badge>
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Henüz not bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
