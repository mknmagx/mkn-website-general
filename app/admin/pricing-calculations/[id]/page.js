"use client";

import { useState, useEffect, use, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { PermissionGuard } from "@/components/admin-route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calculator,
  ArrowLeft,
  Package,
  DollarSign,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Tag,
  Users,
  Percent,
  FileText,
  TrendingUp,
  Beaker,
  Building2,
  RefreshCw,
  AlertTriangle,
  Globe,
  Clock,
  Box,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import * as PricingService from "@/lib/services/pricing-service";
import * as CompaniesService from "@/lib/services/companies-service";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PricingCalculationPDFExport from "@/components/pricing-calculation-pdf-export";
import Link from "next/link";

export default function PricingCalculationDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { loading: authLoading } = useAdminAuth();
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [linkedCompanies, setLinkedCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanyToAdd, setSelectedCompanyToAdd] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Currency conversion states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [showCurrencyWarning, setShowCurrencyWarning] = useState(false);

  useEffect(() => {
    loadCalculation();
  }, [id]);

  useEffect(() => {
    if (calculation) {
      loadLinkedCompanies();
    }
  }, [calculation]);

  const loadCalculation = async () => {
    try {
      setLoading(true);
      const data = await PricingService.getPricingCalculation(id);
      setCalculation(data);

      if (data.formData) {
        const initializedFormData = {
          ...data.formData,
          packaging: data.formData.packaging || [],
          otherCosts: data.formData.otherCosts || [],
          boxes:
            data.formData.boxes ||
            (data.formData.boxType
              ? [
                  {
                    type: data.formData.boxType,
                    quantity: data.formData.boxQuantity,
                    price: data.formData.boxPrice,
                  },
                ]
              : []),
          labels:
            data.formData.labels ||
            (data.formData.labelType
              ? [
                  {
                    type: data.formData.labelType,
                    quantity: data.formData.labelQuantity,
                    price: data.formData.labelPrice,
                  },
                ]
              : []),
        };
        setFormData(initializedFormData);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesaplama yüklenemedi.",
        variant: "destructive",
      });
      router.push("/admin/pricing-calculations");
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companies = await CompaniesService.getCompaniesByCalculationId(id);
      setLinkedCompanies(companies);
    } catch (error) {
      console.error("Error loading linked companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadAllCompanies = async () => {
    try {
      const companies = await CompaniesService.getCompaniesForSelect();
      setAllCompanies(companies);
    } catch (error) {
      console.error("Error loading all companies:", error);
    }
  };

  // Fetch exchange rate from API
  const fetchExchangeRate = useCallback(async () => {
    setLoadingRate(true);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${selectedCurrency}`,
      );
      const data = await response.json();
      const tryRate = data.rates?.TRY;
      if (tryRate) {
        setExchangeRate(tryRate.toFixed(4));
      } else {
        throw new Error("Rate not found");
      }
    } catch (error) {
      console.error("Exchange rate fetch error:", error);
      toast({
        title: "Uyarı",
        description: "Döviz kuru alınamadı. Manuel girebilirsiniz.",
        variant: "destructive",
      });
      const fallbackRates = { USD: "35.00", EUR: "38.00", GBP: "44.00" };
      setExchangeRate(fallbackRates[selectedCurrency] || "35.00");
    } finally {
      setLoadingRate(false);
    }
  }, [selectedCurrency, toast]);

  useEffect(() => {
    if (showCurrencyModal) {
      fetchExchangeRate();
    }
  }, [selectedCurrency, showCurrencyModal, fetchExchangeRate]);

  const handleOpenCurrencyModal = () => {
    if (calculation?.currencyData?.currency) {
      setShowCurrencyWarning(true);
    } else {
      setShowCurrencyModal(true);
    }
  };

  const handleCurrencyWarningConfirm = () => {
    setShowCurrencyWarning(false);
    setShowCurrencyModal(true);
  };

  const handleSaveCurrency = async () => {
    if (!exchangeRate || parseFloat(exchangeRate) <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir kur değeri giriniz.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingCurrency(true);

      const rate = parseFloat(exchangeRate);
      const unitPriceTRY = calculation.calculations?.unitPrice || 0;
      const totalPriceTRY = calculation.calculations?.totalPrice || 0;

      const currencyData = {
        currency: selectedCurrency,
        exchangeRate: rate,
        unitPriceConverted: (unitPriceTRY / rate).toFixed(2),
        totalPriceConverted: (totalPriceTRY / rate).toFixed(2),
        convertedAt: new Date().toISOString(),
        convertedAtTimestamp: Timestamp.now(),
      };

      await updateDoc(doc(db, "pricingCalculations", id), {
        currencyData,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Başarılı",
        description: `Döviz bilgisi kaydedildi. Birim: ${currencyData.unitPriceConverted} ${selectedCurrency}`,
      });

      setShowCurrencyModal(false);
      loadCalculation();
    } catch (error) {
      console.error("Currency save error:", error);
      toast({
        title: "Hata",
        description: "Döviz bilgisi kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleAddCompanyToCalculation = async () => {
    if (!selectedCompanyToAdd) return;

    try {
      const calculationInfo = {
        calculationId: id,
        productName: calculation.productName,
        productVolume: calculation.productVolume,
        quantity: calculation.quantity,
        totalCost: calculation.calculations?.totalCostPerUnit || 0,
        totalCostPerUnit: calculation.calculations?.totalCostPerUnit || 0,
        unitPrice: calculation.calculations?.unitPrice || 0,
        profitMargin: calculation.formData?.profitMarginPercent || 0,
        profitPerUnit: calculation.calculations?.profitPerUnit || 0,
        finalPrice: calculation.calculations?.unitPrice || 0,
        totalPrice: calculation.calculations?.totalPrice || 0,
        notes: calculation.formData?.notes,
        productType: calculation.productType,
      };

      await CompaniesService.addPricingCalculationToCompany(
        selectedCompanyToAdd,
        calculationInfo,
      );

      toast({
        title: "Başarılı",
        description: "Hesaplama müşteriye eklendi",
      });

      setShowAddCompanyDialog(false);
      setSelectedCompanyToAdd("");
      loadLinkedCompanies();
    } catch (error) {
      console.error("Error adding company to calculation:", error);
      toast({
        title: "Hata",
        description: "Müşteri eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCompanyFromCalculation = async (
    companyId,
    calculationRecordId,
  ) => {
    try {
      await CompaniesService.removePricingCalculationFromCompany(
        companyId,
        calculationRecordId,
      );

      toast({
        title: "Başarılı",
        description: "Hesaplama müşteriden kaldırıldı",
      });

      loadLinkedCompanies();
    } catch (error) {
      console.error("Error removing company from calculation:", error);
      toast({
        title: "Hata",
        description: "Müşteri kaldırılırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await PricingService.deletePricingCalculation(id);

      toast({
        title: "Silindi",
        description: "Hesaplama başarıyla silindi.",
      });

      router.push("/admin/pricing-calculations");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silme işlemi başarısız.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  const calculatedPrice = useMemo(() => {
    if (!formData) return null;
    return PricingService.calculatePricing(formData);
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          name: "",
          amount: "",
          unit: "gram",
          price: "",
          supplier: "",
          function: "",
        },
      ],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 0) {
      setFormData((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      }));
    }
  };

  const updatePackaging = (index, field, value) => {
    const newPackaging = [...formData.packaging];
    newPackaging[index] = { ...newPackaging[index], [field]: value };
    setFormData((prev) => ({ ...prev, packaging: newPackaging }));
  };

  const addPackaging = () => {
    setFormData((prev) => ({
      ...prev,
      packaging: [
        ...prev.packaging,
        {
          type: "",
          material: "",
          quantity: "",
          unit: "adet",
          price: "",
          supplier: "",
        },
      ],
    }));
  };

  const removePackaging = (index) => {
    if (formData.packaging.length > 0) {
      setFormData((prev) => ({
        ...prev,
        packaging: prev.packaging.filter((_, i) => i !== index),
      }));
    }
  };

  // Box functions
  const updateBox = (index, field, value) => {
    const newBoxes = [...(formData.boxes || [])];
    newBoxes[index] = { ...newBoxes[index], [field]: value };
    setFormData((prev) => ({ ...prev, boxes: newBoxes }));
  };

  const addBox = () => {
    setFormData((prev) => ({
      ...prev,
      boxes: [...(prev.boxes || []), { type: "", quantity: "", price: "" }],
    }));
  };

  const removeBox = (index) => {
    setFormData((prev) => ({
      ...prev,
      boxes: (prev.boxes || []).filter((_, i) => i !== index),
    }));
  };

  // Label functions
  const updateLabel = (index, field, value) => {
    const newLabels = [...(formData.labels || [])];
    newLabels[index] = { ...newLabels[index], [field]: value };
    setFormData((prev) => ({ ...prev, labels: newLabels }));
  };

  const addLabel = () => {
    setFormData((prev) => ({
      ...prev,
      labels: [...(prev.labels || []), { type: "", quantity: "", price: "" }],
    }));
  };

  const removeLabel = (index) => {
    setFormData((prev) => ({
      ...prev,
      labels: (prev.labels || []).filter((_, i) => i !== index),
    }));
  };

  const updateOtherCost = (index, field, value) => {
    const newOtherCosts = [...formData.otherCosts];
    newOtherCosts[index] = { ...newOtherCosts[index], [field]: value };
    setFormData((prev) => ({ ...prev, otherCosts: newOtherCosts }));
  };

  const addOtherCost = () => {
    setFormData((prev) => ({
      ...prev,
      otherCosts: [
        ...prev.otherCosts,
        { description: "", amount: "", category: "genel" },
      ],
    }));
  };

  const removeOtherCost = (index) => {
    if (formData.otherCosts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        otherCosts: prev.otherCosts.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (formData.sourceFormulaId && !formData.sourceFormulaName) {
        toast({
          title: "Eksik Bilgi",
          description: "Formül referansı eksik.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const cleanFormData = {
        ...formData,
        ingredients: formData.ingredients.filter((ing) => ing.name),
        packaging: formData.packaging.filter((pkg) => pkg.type),
        boxes: (formData.boxes || []).filter((box) => box.type),
        labels: (formData.labels || []).filter((label) => label.type),
        otherCosts: formData.otherCosts.filter((cost) => cost.description),
        sourceFormulaId: formData.sourceFormulaId || null,
        sourceFormulaName: formData.sourceFormulaName || null,
      };

      const updatedData = {
        productName: cleanFormData.productName,
        productType: cleanFormData.productType,
        productVolume: cleanFormData.productVolume,
        quantity: parseFloat(cleanFormData.quantity) || 0,
        description: cleanFormData.description,
        formData: cleanFormData,
        calculations: {
          unitPrice: parseFloat(calculatedPrice.unitPrice) || 0,
          totalPrice: parseFloat(calculatedPrice.totalPrice) || 0,
          totalCostPerUnit: parseFloat(calculatedPrice.totalCostPerUnit) || 0,
          profitPerUnit: parseFloat(calculatedPrice.profitPerUnit) || 0,
        },
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "pricingCalculations", id), updatedData);

      toast({ title: "Kaydedildi", description: "Değişiklikler kaydedildi." });
      setEditMode(false);
      loadCalculation();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: "Kaydetme hatası.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (calculation.formData) setFormData(calculation.formData);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Tarih bilinmiyor";
    try {
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Tarih bilinmiyor";
    }
  };

  const calculateIngredientCost = (ing, boxQuantityMultiplier = 1) => {
    const amount = parseFloat(ing.amount) || 0;
    const price = parseFloat(ing.price) || 0;
    const unit = ing.unit || "gram";

    // 1 birim için maliyet
    let costPerSingleUnit = 0;
    if (unit === "adet") {
      costPerSingleUnit = amount * price;
    } else {
      const kg =
        unit === "gram"
          ? amount / 1000
          : unit === "kg"
            ? amount
            : unit === "ml"
              ? amount / 1000
              : unit === "litre"
                ? amount
                : amount / 1000;
      costPerSingleUnit = kg * price;
    }

    // Kutu başına maliyet (kutu içerik adedi ile çarp)
    return costPerSingleUnit * boxQuantityMultiplier;
  };

  // Kutu içerik adedi (formülden gelen, örn: 60 kapsül/kutu)
  const boxQuantityMultiplier =
    parseFloat(calculation?.formData?.sourceFormulaProductionQuantity) || 1;

  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!calculation) return null;

  return (
    <PermissionGuard requiredPermission="proformas.view" showMessage={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push("/admin/pricing-calculations")}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {calculation.productName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-blue-50 text-blue-700 border-0">
                      {calculation.productType || "Genel"}
                    </Badge>
                    <Badge variant="outline">{calculation.quantity} adet</Badge>
                    {calculation.productVolume && (
                      <Badge variant="outline">
                        {calculation.productVolume} ml
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(calculation.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!editMode ? (
                  <>
                    <Button
                      onClick={handleOpenCurrencyModal}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Globe className="h-4 w-4" />
                      Döviz Çevir
                    </Button>
                    <PricingCalculationPDFExport
                      calculation={calculation}
                      fileName={`maliyet-${calculation.productName?.replace(/[^a-z0-9]/gi, "_")}.pdf`}
                    />
                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => setDeleteDialog(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="sm"
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Kaydet
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                      disabled={saving}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      İptal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Formula Reference */}
          {formData?.sourceFormulaId && formData?.sourceFormulaName && (
            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Beaker className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <span className="font-medium">
                    {formData.sourceFormulaName}
                  </span>{" "}
                  formülünden oluşturuldu
                </p>
                <Link
                  href={`/admin/formulas/${formData.sourceFormulaId}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Formülü görüntüle →
                </Link>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Birim Fiyat",
                value:
                  editMode && calculatedPrice
                    ? calculatedPrice.unitPrice
                    : calculation.calculations?.unitPrice?.toFixed(2),
                icon: DollarSign,
                color: "blue",
              },
              {
                label: "Toplam Fiyat",
                value:
                  editMode && calculatedPrice
                    ? calculatedPrice.totalPrice
                    : calculation.calculations?.totalPrice?.toFixed(2),
                icon: Package,
                color: "emerald",
              },
              {
                label: "Birim Maliyet",
                value:
                  editMode && calculatedPrice
                    ? calculatedPrice.totalCostPerUnit
                    : calculation.calculations?.totalCostPerUnit?.toFixed(2),
                icon: Tag,
                color: "amber",
              },
              {
                label: "Birim Kar",
                value:
                  editMode && calculatedPrice
                    ? calculatedPrice.profitPerUnit
                    : calculation.calculations?.profitPerUnit?.toFixed(2),
                icon: TrendingUp,
                color: "violet",
                isProfit: true,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 bg-${item.color}-100 rounded-xl flex items-center justify-center`}
                  >
                    <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                  </div>
                  <span className="text-sm text-slate-500">{item.label}</span>
                </div>
                <p
                  className={`text-2xl font-bold ${item.isProfit ? "text-emerald-600" : "text-slate-900"}`}
                >
                  {item.isProfit && "+"}₺{item.value || "0.00"}
                </p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Cost Analysis */}
              {!editMode && (
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Maliyet Analizi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Per Unit */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          Birim Maliyetler
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              label: `İçerik/Hammadde${boxQuantityMultiplier > 1 ? ` (${boxQuantityMultiplier} adet/kutu)` : ""}`,
                              value: (calculation.formData?.ingredients || [])
                                .reduce(
                                  (sum, ing) =>
                                    sum +
                                    calculateIngredientCost(
                                      ing,
                                      boxQuantityMultiplier,
                                    ),
                                  0,
                                )
                                .toFixed(2),
                            },
                            {
                              label: "Ambalaj",
                              value: (calculation.formData?.packaging || [])
                                .reduce(
                                  (sum, pkg) =>
                                    sum +
                                    (parseFloat(pkg.quantity) || 0) *
                                      (parseFloat(pkg.price) || 0),
                                  0,
                                )
                                .toFixed(2),
                            },
                            {
                              label: "Kutu",
                              value: (
                                (parseFloat(
                                  calculation.formData?.boxQuantity,
                                ) || 0) *
                                (parseFloat(calculation.formData?.boxPrice) ||
                                  0)
                              ).toFixed(2),
                            },
                            {
                              label: "Etiket",
                              value: (
                                (parseFloat(
                                  calculation.formData?.labelQuantity,
                                ) || 0) *
                                (parseFloat(calculation.formData?.labelPrice) ||
                                  0)
                              ).toFixed(2),
                            },
                            {
                              label: "İşçilik",
                              value: parseFloat(
                                calculation.formData?.laborCostPerUnit || 0,
                              ).toFixed(2),
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-slate-500">
                                {item.label}
                              </span>
                              <span className="font-medium tabular-nums">
                                {item.value} TL
                              </span>
                            </div>
                          ))}
                          <div className="h-px bg-slate-200 my-2" />
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-slate-700">
                              Birim Maliyet
                            </span>
                            <span className="text-blue-600 tabular-nums">
                              {calculation.calculations?.totalCostPerUnit?.toFixed(
                                2,
                              ) || "0.00"}{" "}
                              TL
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Birim Kar</span>
                            <span className="font-medium text-emerald-600 tabular-nums">
                              +
                              {calculation.calculations?.profitPerUnit?.toFixed(
                                2,
                              ) || "0.00"}{" "}
                              TL
                            </span>
                          </div>
                          <div className="flex justify-between bg-blue-50 -mx-2 px-3 py-3 rounded-xl mt-2">
                            <span className="font-bold text-slate-900">
                              Birim Satış
                            </span>
                            <span className="font-bold text-xl text-blue-600 tabular-nums">
                              {calculation.calculations?.unitPrice?.toFixed(
                                2,
                              ) || "0.00"}{" "}
                              TL
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Total */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          Toplam ({calculation.quantity} adet)
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              label: `İçerik/Hammadde${boxQuantityMultiplier > 1 ? ` (${boxQuantityMultiplier} adet/kutu)` : ""}`,
                              value: (
                                (
                                  calculation.formData?.ingredients || []
                                ).reduce(
                                  (sum, ing) =>
                                    sum +
                                    calculateIngredientCost(
                                      ing,
                                      boxQuantityMultiplier,
                                    ),
                                  0,
                                ) * calculation.quantity
                              ).toFixed(2),
                            },
                            {
                              label: "Ambalaj",
                              value: (
                                (calculation.formData?.packaging || []).reduce(
                                  (sum, pkg) =>
                                    sum +
                                    (parseFloat(pkg.quantity) || 0) *
                                      (parseFloat(pkg.price) || 0),
                                  0,
                                ) * calculation.quantity
                              ).toFixed(2),
                            },
                            {
                              label: "Kutu",
                              value: (
                                (parseFloat(
                                  calculation.formData?.boxQuantity,
                                ) || 0) *
                                (parseFloat(calculation.formData?.boxPrice) ||
                                  0) *
                                calculation.quantity
                              ).toFixed(2),
                            },
                            {
                              label: "Etiket",
                              value: (
                                (parseFloat(
                                  calculation.formData?.labelQuantity,
                                ) || 0) *
                                (parseFloat(calculation.formData?.labelPrice) ||
                                  0) *
                                calculation.quantity
                              ).toFixed(2),
                            },
                            {
                              label: "İşçilik",
                              value: (
                                parseFloat(
                                  calculation.formData?.laborCostPerUnit || 0,
                                ) * calculation.quantity
                              ).toFixed(2),
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-slate-500">
                                {item.label}
                              </span>
                              <span className="font-medium tabular-nums">
                                {item.value} TL
                              </span>
                            </div>
                          ))}
                          <div className="h-px bg-slate-200 my-2" />
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-slate-700">
                              Toplam Maliyet
                            </span>
                            <span className="text-blue-600 tabular-nums">
                              {(
                                (calculation.calculations?.totalCostPerUnit ||
                                  0) * calculation.quantity
                              ).toFixed(2)}{" "}
                              TL
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Toplam Kar</span>
                            <span className="font-medium text-emerald-600 tabular-nums">
                              +
                              {(
                                (calculation.calculations?.profitPerUnit || 0) *
                                calculation.quantity
                              ).toFixed(2)}{" "}
                              TL
                            </span>
                          </div>
                          <div className="flex justify-between bg-emerald-50 -mx-2 px-3 py-3 rounded-xl mt-2">
                            <span className="font-bold text-slate-900">
                              Toplam Satış
                            </span>
                            <span className="font-bold text-xl text-emerald-600 tabular-nums">
                              {calculation.calculations?.totalPrice?.toFixed(
                                2,
                              ) || "0.00"}{" "}
                              TL
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ingredients */}
              {(calculation.formData?.ingredients?.filter((i) => i.name)
                .length > 0 ||
                editMode) && (
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="ingredients"
                  >
                    <AccordionItem value="ingredients" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 text-violet-600" />
                          </div>
                          <span className="font-semibold text-slate-900">
                            Hammaddeler
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-violet-100 text-violet-700"
                          >
                            {editMode
                              ? formData.ingredients?.filter((i) => i.name)
                                  .length || 0
                              : calculation.formData.ingredients?.filter(
                                  (i) => i.name,
                                ).length || 0}{" "}
                            adet
                          </Badge>
                          {boxQuantityMultiplier > 1 && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {boxQuantityMultiplier} adet/kutu
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      {editMode && (
                        <div className="px-6 pb-3">
                          <Button
                            onClick={addIngredient}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Hammadde Ekle
                          </Button>
                        </div>
                      )}
                      <AccordionContent className="px-6 pb-6">
                        {!editMode ? (
                          <div className="space-y-2">
                            {boxQuantityMultiplier > 1 && (
                              <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                                Kutu içerik: {boxQuantityMultiplier} adet •
                                Maliyet = miktar × fiyat ×{" "}
                                {boxQuantityMultiplier}
                              </div>
                            )}
                            {calculation.formData.ingredients
                              .filter((i) => i.name)
                              .map((ing, idx) => {
                                const singleUnitCost = calculateIngredientCost(
                                  ing,
                                  1,
                                );
                                const totalCost = calculateIngredientCost(
                                  ing,
                                  boxQuantityMultiplier,
                                );
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {ing.name}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {ing.amount} {ing.unit}
                                        {ing.function && ` • ${ing.function}`}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium tabular-nums">
                                        {parseFloat(ing.price).toFixed(2)}{" "}
                                        {ing.unit === "adet"
                                          ? "TL/adet"
                                          : "TL/kg"}
                                      </p>
                                      <p className="text-xs text-slate-400 tabular-nums">
                                        1 adet: {singleUnitCost.toFixed(4)} TL
                                      </p>
                                      <p className="text-sm text-blue-600 tabular-nums font-medium">
                                        {totalCost.toFixed(2)} TL
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {formData.ingredients.map((ingredient, index) => (
                              <div
                                key={index}
                                className="p-4 bg-slate-50 rounded-xl space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-700">
                                    #{index + 1} {ingredient.name || "Yeni"}
                                  </span>
                                  <Button
                                    onClick={() => removeIngredient(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Ad
                                    </Label>
                                    <Input
                                      value={ingredient.name || ""}
                                      onChange={(e) =>
                                        updateIngredient(
                                          index,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Miktar
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={ingredient.amount || ""}
                                      onChange={(e) =>
                                        updateIngredient(
                                          index,
                                          "amount",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Birim
                                    </Label>
                                    <Select
                                      value={ingredient.unit || "gram"}
                                      onValueChange={(value) =>
                                        updateIngredient(index, "unit", value)
                                      }
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="gram">
                                          Gram
                                        </SelectItem>
                                        <SelectItem value="kg">Kg</SelectItem>
                                        <SelectItem value="ml">ml</SelectItem>
                                        <SelectItem value="litre">
                                          Litre
                                        </SelectItem>
                                        <SelectItem value="adet">
                                          Adet
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Fiyat
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={ingredient.price || ""}
                                      onChange={(e) =>
                                        updateIngredient(
                                          index,
                                          "price",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              )}

              {/* Packaging */}
              {(calculation.formData?.packaging?.filter((p) => p.type).length >
                0 ||
                editMode) && (
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <Accordion type="single" collapsible defaultValue="packaging">
                    <AccordionItem value="packaging" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Box className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="font-semibold text-slate-900">
                            Ambalaj
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700"
                          >
                            {editMode
                              ? formData.packaging?.filter((p) => p.type)
                                  .length || 0
                              : calculation.formData.packaging?.filter(
                                  (p) => p.type,
                                ).length || 0}{" "}
                            adet
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      {editMode && (
                        <div className="px-6 pb-3">
                          <Button
                            onClick={addPackaging}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Ambalaj Ekle
                          </Button>
                        </div>
                      )}
                      <AccordionContent className="px-6 pb-6">
                        {!editMode ? (
                          <div className="space-y-2">
                            {calculation.formData.packaging
                              .filter((p) => p.type)
                              .map((pkg, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                >
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {pkg.type}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {pkg.material && `${pkg.material} • `}
                                      {pkg.quantity} {pkg.unit || "adet"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium tabular-nums">
                                      {parseFloat(pkg.price).toFixed(2)} TL/
                                      {pkg.unit || "adet"}
                                    </p>
                                    <p className="text-sm text-orange-600 tabular-nums">
                                      {(
                                        (parseFloat(pkg.quantity) || 0) *
                                        (parseFloat(pkg.price) || 0)
                                      ).toFixed(2)}{" "}
                                      TL
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {formData.packaging.map((pkg, index) => (
                              <div
                                key={index}
                                className="p-4 bg-slate-50 rounded-xl space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-700">
                                    #{index + 1} {pkg.type || "Yeni"}
                                  </span>
                                  {formData.packaging.length > 0 && (
                                    <Button
                                      onClick={() => removePackaging(index)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Tip
                                    </Label>
                                    <Input
                                      value={pkg.type || ""}
                                      onChange={(e) =>
                                        updatePackaging(
                                          index,
                                          "type",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                      placeholder="Örn: Şişe, Kavanoz"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Malzeme
                                    </Label>
                                    <Input
                                      value={pkg.material || ""}
                                      onChange={(e) =>
                                        updatePackaging(
                                          index,
                                          "material",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                      placeholder="Örn: Cam, Plastik"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Birim
                                    </Label>
                                    <Select
                                      value={pkg.unit || "adet"}
                                      onValueChange={(value) =>
                                        updatePackaging(index, "unit", value)
                                      }
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="adet">
                                          Adet
                                        </SelectItem>
                                        <SelectItem value="kg">Kg</SelectItem>
                                        <SelectItem value="metre">
                                          Metre
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Miktar
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={pkg.quantity || ""}
                                      onChange={(e) =>
                                        updatePackaging(
                                          index,
                                          "quantity",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Fiyat
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={pkg.price || ""}
                                      onChange={(e) =>
                                        updatePackaging(
                                          index,
                                          "price",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Tedarikçi
                                    </Label>
                                    <Input
                                      value={pkg.supplier || ""}
                                      onChange={(e) =>
                                        updatePackaging(
                                          index,
                                          "supplier",
                                          e.target.value,
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              )}

              {/* Box & Label */}
              {(calculation.formData?.boxes?.length > 0 ||
                calculation.formData?.labels?.length > 0 ||
                calculation.formData?.boxType ||
                calculation.formData?.labelType ||
                editMode) && (
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <Accordion type="single" collapsible defaultValue="boxlabel">
                    <AccordionItem value="boxlabel" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Tag className="h-4 w-4 text-pink-600" />
                          </div>
                          <span className="font-semibold text-slate-900">
                            Kutu ve Etiket
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        {!editMode ? (
                          <div className="space-y-4">
                            {/* Boxes */}
                            {(calculation.formData?.boxes?.length > 0 ||
                              calculation.formData?.boxType) && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3">
                                  Kutular
                                </h4>
                                <div className="space-y-2">
                                  {calculation.formData?.boxes?.map(
                                    (box, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                      >
                                        <div>
                                          <p className="font-medium text-slate-900">
                                            {box.type}
                                          </p>
                                          <p className="text-sm text-slate-500">
                                            {box.quantity} adet
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium tabular-nums">
                                            {parseFloat(box.price).toFixed(2)}{" "}
                                            TL/adet
                                          </p>
                                          <p className="text-sm text-blue-600 tabular-nums">
                                            {(
                                              (parseFloat(box.quantity) || 0) *
                                              (parseFloat(box.price) || 0)
                                            ).toFixed(2)}{" "}
                                            TL
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {/* Fallback for old data structure */}
                                  {!calculation.formData?.boxes?.length &&
                                    calculation.formData?.boxType && (
                                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                          <p className="font-medium text-slate-900">
                                            {calculation.formData.boxType}
                                          </p>
                                          <p className="text-sm text-slate-500">
                                            {calculation.formData.boxQuantity}{" "}
                                            adet
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium tabular-nums">
                                            {parseFloat(
                                              calculation.formData.boxPrice,
                                            ).toFixed(2)}{" "}
                                            TL/adet
                                          </p>
                                          <p className="text-sm text-blue-600 tabular-nums">
                                            {(
                                              (parseFloat(
                                                calculation.formData
                                                  .boxQuantity,
                                              ) || 0) *
                                              (parseFloat(
                                                calculation.formData.boxPrice,
                                              ) || 0)
                                            ).toFixed(2)}{" "}
                                            TL
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            )}
                            {/* Labels */}
                            {(calculation.formData?.labels?.length > 0 ||
                              calculation.formData?.labelType) && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3">
                                  Etiketler
                                </h4>
                                <div className="space-y-2">
                                  {calculation.formData?.labels?.map(
                                    (label, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                      >
                                        <div>
                                          <p className="font-medium text-slate-900">
                                            {label.type}
                                          </p>
                                          <p className="text-sm text-slate-500">
                                            {label.quantity} adet
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium tabular-nums">
                                            {parseFloat(label.price).toFixed(2)}{" "}
                                            TL/adet
                                          </p>
                                          <p className="text-sm text-violet-600 tabular-nums">
                                            {(
                                              (parseFloat(label.quantity) ||
                                                0) *
                                              (parseFloat(label.price) || 0)
                                            ).toFixed(2)}{" "}
                                            TL
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {/* Fallback for old data structure */}
                                  {!calculation.formData?.labels?.length &&
                                    calculation.formData?.labelType && (
                                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                          <p className="font-medium text-slate-900">
                                            {calculation.formData.labelType}
                                          </p>
                                          <p className="text-sm text-slate-500">
                                            {calculation.formData.labelQuantity}{" "}
                                            adet
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium tabular-nums">
                                            {parseFloat(
                                              calculation.formData.labelPrice,
                                            ).toFixed(2)}{" "}
                                            TL/adet
                                          </p>
                                          <p className="text-sm text-violet-600 tabular-nums">
                                            {(
                                              (parseFloat(
                                                calculation.formData
                                                  .labelQuantity,
                                              ) || 0) *
                                              (parseFloat(
                                                calculation.formData.labelPrice,
                                              ) || 0)
                                            ).toFixed(2)}{" "}
                                            TL
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Boxes Edit */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-slate-700">
                                  Kutular
                                </h4>
                                <Button
                                  onClick={addBox}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 h-8"
                                >
                                  <Plus className="h-3 w-3" />
                                  Kutu Ekle
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {(formData.boxes || []).map((box, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-slate-50 rounded-xl"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-xs font-medium text-slate-500">
                                        #{index + 1}
                                      </span>
                                      <Button
                                        onClick={() => removeBox(index)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-red-500"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <Input
                                        value={box.type || ""}
                                        onChange={(e) =>
                                          updateBox(
                                            index,
                                            "type",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Tip"
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        type="number"
                                        value={box.quantity || ""}
                                        onChange={(e) =>
                                          updateBox(
                                            index,
                                            "quantity",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Miktar"
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={box.price || ""}
                                        onChange={(e) =>
                                          updateBox(
                                            index,
                                            "price",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Fiyat"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                                {(!formData.boxes ||
                                  formData.boxes.length === 0) && (
                                  <p className="text-sm text-slate-400 text-center py-4">
                                    Henüz kutu eklenmedi
                                  </p>
                                )}
                              </div>
                            </div>
                            {/* Labels Edit */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-slate-700">
                                  Etiketler
                                </h4>
                                <Button
                                  onClick={addLabel}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 h-8"
                                >
                                  <Plus className="h-3 w-3" />
                                  Etiket Ekle
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {(formData.labels || []).map((label, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-slate-50 rounded-xl"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-xs font-medium text-slate-500">
                                        #{index + 1}
                                      </span>
                                      <Button
                                        onClick={() => removeLabel(index)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-red-500"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <Input
                                        value={label.type || ""}
                                        onChange={(e) =>
                                          updateLabel(
                                            index,
                                            "type",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Tip"
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        type="number"
                                        value={label.quantity || ""}
                                        onChange={(e) =>
                                          updateLabel(
                                            index,
                                            "quantity",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Miktar"
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={label.price || ""}
                                        onChange={(e) =>
                                          updateLabel(
                                            index,
                                            "price",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Fiyat"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                                {(!formData.labels ||
                                  formData.labels.length === 0) && (
                                  <p className="text-sm text-slate-400 text-center py-4">
                                    Henüz etiket eklenmedi
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              )}

              {/* Labor & Profit */}
              <div className="grid md:grid-cols-2 gap-6">
                {(calculation.formData?.laborCostPerUnit || editMode) && (
                  <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-cyan-600" />
                        </div>
                        İşçilik
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {!editMode ? (
                        <div className="text-center">
                          <p className="text-3xl font-bold tabular-nums">
                            {parseFloat(
                              calculation.formData.laborCostPerUnit,
                            ).toFixed(2)}{" "}
                            TL
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Birim başına
                          </p>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.laborCostPerUnit || ""}
                          onChange={(e) =>
                            updateField("laborCostPerUnit", e.target.value)
                          }
                          className="h-10"
                          placeholder="Birim İşçilik (TL)"
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Percent className="h-4 w-4 text-emerald-600" />
                      </div>
                      Kar Marjı
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {!editMode ? (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                          {calculation.formData?.profitType === "percentage"
                            ? `%${calculation.formData?.profitMarginPercent}`
                            : `${calculation.formData?.profitAmountPerUnit} TL`}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {calculation.formData?.profitType === "percentage"
                            ? "Yüzde"
                            : "Sabit"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Select
                          value={formData.profitType || "percentage"}
                          onValueChange={(value) =>
                            updateField("profitType", value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Yüzde (%)
                            </SelectItem>
                            <SelectItem value="fixed">Sabit (TL)</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.profitType === "percentage" ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.profitMarginPercent || ""}
                            onChange={(e) =>
                              updateField("profitMarginPercent", e.target.value)
                            }
                            className="h-9"
                            placeholder="%"
                          />
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.profitAmountPerUnit || ""}
                            onChange={(e) =>
                              updateField("profitAmountPerUnit", e.target.value)
                            }
                            className="h-9"
                            placeholder="TL"
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Edit Mode: Basic Info */}
              {editMode && (
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      Temel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs text-slate-500">
                          Ürün Adı
                        </Label>
                        <Input
                          value={formData.productName || ""}
                          onChange={(e) =>
                            updateField("productName", e.target.value)
                          }
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">
                          Ürün Tipi
                        </Label>
                        <Select
                          value={formData.productType || ""}
                          onValueChange={(value) =>
                            updateField("productType", value)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kozmetik">Kozmetik</SelectItem>
                            <SelectItem value="gida">Gıda Takviyesi</SelectItem>
                            <SelectItem value="temizlik">Temizlik</SelectItem>
                            <SelectItem value="kisisel-bakim">
                              Kişisel Bakım
                            </SelectItem>
                            <SelectItem value="diger">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">Miktar</Label>
                        <Input
                          type="number"
                          value={formData.quantity || ""}
                          onChange={(e) =>
                            updateField("quantity", e.target.value)
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500">Açıklama</Label>
                      <Textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Linked Companies */}
              <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                      </div>
                      Müşteriler
                      <Badge variant="secondary">
                        {linkedCompanies.length}
                      </Badge>
                    </CardTitle>
                    <Button
                      onClick={() => {
                        loadAllCompanies();
                        setShowAddCompanyDialog(true);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {loadingCompanies ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : linkedCompanies.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        Henüz müşteri yok
                      </p>
                      <Button
                        onClick={() => {
                          loadAllCompanies();
                          setShowAddCompanyDialog(true);
                        }}
                        size="sm"
                        variant="link"
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ekle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedCompanies.map((company) => {
                        const calcInCompany = (
                          company.pricingCalculations || []
                        ).find((calc) => calc.calculationId === id);
                        return (
                          <div
                            key={company.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-slate-100"
                          >
                            <Link
                              href={`/admin/companies/${company.id}`}
                              className="flex-1 min-w-0"
                            >
                              <p className="font-medium text-slate-900 truncate hover:text-blue-600">
                                {company.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {calcInCompany &&
                                  new Date(
                                    calcInCompany.addedAt,
                                  ).toLocaleDateString("tr-TR")}
                              </p>
                            </Link>
                            <Button
                              onClick={() =>
                                handleRemoveCompanyFromCalculation(
                                  company.id,
                                  calcInCompany?.id,
                                )
                              }
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Currency Data */}
              {calculation.currencyData && (
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      Döviz ({calculation.currencyData.currency})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                          {getCurrencySymbol(calculation.currencyData.currency)}
                          {calculation.currencyData.unitPriceConverted}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Birim Fiyat
                        </p>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Toplam</span>
                        <span className="font-semibold text-emerald-600 tabular-nums">
                          {getCurrencySymbol(calculation.currencyData.currency)}
                          {calculation.currencyData.totalPriceConverted}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Kur</span>
                        <span className="font-medium tabular-nums">
                          {calculation.currencyData.exchangeRate}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(
                            calculation.currencyData.convertedAt,
                          ).toLocaleString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Live Calculation */}
              {editMode && calculatedPrice && (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-blue-100">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                      <Calculator className="h-4 w-4" />
                      Güncel Hesaplama
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3 text-sm">
                      {[
                        {
                          label: "İçerik",
                          value: calculatedPrice.ingredientsCostPerUnit,
                        },
                        {
                          label: "Ambalaj",
                          value: calculatedPrice.packagingCostPerUnit,
                        },
                        {
                          label: "Kutu",
                          value: calculatedPrice.boxCostPerUnit,
                        },
                        {
                          label: "Etiket",
                          value: calculatedPrice.labelCostPerUnit,
                        },
                        {
                          label: "İşçilik",
                          value: calculatedPrice.laborCostPerUnit,
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-blue-700">{item.label}</span>
                          <span className="font-medium text-blue-900 tabular-nums">
                            {item.value} TL
                          </span>
                        </div>
                      ))}
                      <div className="h-px bg-blue-200" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-blue-900">Maliyet</span>
                        <span className="text-blue-900 tabular-nums">
                          {calculatedPrice.totalCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Kar</span>
                        <span className="font-medium text-emerald-600 tabular-nums">
                          +{calculatedPrice.profitPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between bg-blue-100 -mx-2 px-3 py-2 rounded-lg">
                        <span className="font-bold text-blue-900">
                          Birim Fiyat
                        </span>
                        <span className="font-bold text-lg text-blue-600 tabular-nums">
                          {calculatedPrice.unitPrice} TL
                        </span>
                      </div>
                      <div className="flex justify-between bg-emerald-100 -mx-2 px-3 py-2 rounded-lg">
                        <span className="font-bold text-emerald-900">
                          Toplam ({calculatedPrice.quantity})
                        </span>
                        <span className="font-bold text-lg text-emerald-600 tabular-nums">
                          {calculatedPrice.totalPrice} TL
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* Currency Modal */}
        <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Döviz Çevirimi
              </DialogTitle>
              <DialogDescription>Birim fiyatı dövize çevirin</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Döviz Cinsi</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Kur (1 {selectedCurrency} = ? TL)</Label>
                  <Button
                    onClick={fetchExchangeRate}
                    size="sm"
                    variant="ghost"
                    disabled={loadingRate}
                    className="h-8 text-xs gap-1"
                  >
                    {loadingRate ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Güncelle
                  </Button>
                </div>
                <Input
                  type="number"
                  step="0.0001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="35.50"
                />
                <p className="text-xs text-slate-500">
                  API'den çekilen kur. Manuel düzenleyebilirsiniz.
                </p>
              </div>
              {exchangeRate && parseFloat(exchangeRate) > 0 && (
                <div className="p-4 bg-emerald-50 rounded-xl space-y-3">
                  <h4 className="text-sm font-semibold text-emerald-900">
                    Hesaplanan
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-700">Birim</p>
                      <p className="text-xl font-bold text-emerald-600 tabular-nums">
                        {getCurrencySymbol(selectedCurrency)}
                        {(
                          (calculation.calculations?.unitPrice || 0) /
                          parseFloat(exchangeRate)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Toplam</p>
                      <p className="text-xl font-bold text-emerald-600 tabular-nums">
                        {getCurrencySymbol(selectedCurrency)}
                        {(
                          (calculation.calculations?.totalPrice || 0) /
                          parseFloat(exchangeRate)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-600">
                    Tarih: {new Date().toLocaleString("tr-TR")}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveCurrency}
                  disabled={
                    savingCurrency ||
                    !exchangeRate ||
                    parseFloat(exchangeRate) <= 0
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {savingCurrency ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Kaydet
                </Button>
                <Button
                  onClick={() => setShowCurrencyModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Currency Warning */}
        <AlertDialog
          open={showCurrencyWarning}
          onOpenChange={setShowCurrencyWarning}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Mevcut Döviz Kaydı
              </AlertDialogTitle>
              <AlertDialogDescription>
                Zaten kayıtlı:{" "}
                <strong>{calculation.currencyData?.currency}</strong> - Kur:{" "}
                {calculation.currencyData?.exchangeRate}
                <br />
                <span className="text-sm text-slate-500">
                  {calculation.currencyData?.convertedAt &&
                    new Date(
                      calculation.currencyData.convertedAt,
                    ).toLocaleString("tr-TR")}
                </span>
                <br />
                <br />
                Yeni kur ile güncellemek istiyor musunuz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCurrencyWarningConfirm}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Güncelle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Company */}
        <Dialog
          open={showAddCompanyDialog}
          onOpenChange={setShowAddCompanyDialog}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Müşteri Ekle
              </DialogTitle>
              <DialogDescription>
                Hesaplamayı ekleyeceğiniz müşteriyi seçin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select
                value={selectedCompanyToAdd}
                onValueChange={setSelectedCompanyToAdd}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {allCompanies
                    .filter(
                      (c) => !linkedCompanies.some((lc) => lc.id === c.id),
                    )
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddCompanyToCalculation}
                  disabled={!selectedCompanyToAdd}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ekle
                </Button>
                <Button
                  onClick={() => {
                    setShowAddCompanyDialog(false);
                    setSelectedCompanyToAdd("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hesaplamayı Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Silmek istediğinizden emin misiniz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Siliniyor...
                  </>
                ) : (
                  "Sil"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}
