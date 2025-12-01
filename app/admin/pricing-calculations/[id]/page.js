"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { PermissionGuard } from "@/components/admin-route-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  AlertCircle,
  FileText,
  TrendingUp,
  Beaker,
  Building2,
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

      // Initialize form data from calculation
      if (data.formData) {
        // Ensure arrays exist
        const initializedFormData = {
          ...data.formData,
          packaging: data.formData.packaging || [],
          otherCosts: data.formData.otherCosts || [],
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
        calculationInfo
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
    calculationRecordId
  ) => {
    try {
      await CompaniesService.removePricingCalculationFromCompany(
        companyId,
        calculationRecordId
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

  // Calculate pricing from form data
  const calculatedPrice = useMemo(() => {
    if (!formData) return null;
    return PricingService.calculatePricing(formData);
  }, [formData]);

  // Form update functions
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
    if (formData.ingredients.length > 1) {
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
    if (formData.packaging.length > 1) {
      setFormData((prev) => ({
        ...prev,
        packaging: prev.packaging.filter((_, i) => i !== index),
      }));
    }
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

      // Validation: Ensure formula reference is preserved if it exists
      if (formData.sourceFormulaId && !formData.sourceFormulaName) {
        toast({
          title: "Eksik Bilgi",
          description: "Formül referansı eksik. Lütfen sayfayı yenileyin.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Clean form data
      const cleanFormData = {
        ...formData,
        ingredients: formData.ingredients.filter((ing) => ing.name),
        packaging: formData.packaging.filter((pkg) => pkg.type),
        otherCosts: formData.otherCosts.filter((cost) => cost.description),
        // CRITICAL: Always preserve formula reference if it exists
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

      toast({
        title: "Kaydedildi",
        description: "Değişiklikler başarıyla kaydedildi.",
      });

      setEditMode(false);
      loadCalculation();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: "Kaydetme sırasında hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Reset form data to original calculation
    if (calculation.formData) {
      setFormData(calculation.formData);
    }
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!calculation) return null;

  return (
    <PermissionGuard requiredPermission="proformas.view" showMessage={true}>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/pricing-calculations")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                    <Calculator className="h-7 w-7 text-white" />
                  </div>
                  {calculation.productName}
                </h1>
                <div className="flex gap-2 flex-wrap mt-3 ml-14">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {calculation.productType || "Genel"}
                  </Badge>
                  {calculation.quantity && (
                    <Badge variant="outline" className="border-gray-300">
                      {calculation.quantity} adet
                    </Badge>
                  )}
                  {calculation.productVolume && (
                    <Badge variant="outline" className="border-gray-300">
                      {calculation.productVolume} ml
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-gray-300"
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDate(calculation.createdAt)}
                  </Badge>
                  {calculation.formData?.sourceFormulaId &&
                    calculation.formData?.sourceFormulaName && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <Beaker className="h-3 w-3 mr-1" />
                        {calculation.formData.sourceFormulaName}
                      </Badge>
                    )}
                </div>
              </div>

              <div className="flex gap-2">
                {!editMode ? (
                  <>
                    <PricingCalculationPDFExport
                      calculation={calculation}
                      fileName={`maliyet-hesaplama-${
                        calculation.productName?.replace(/[^a-z0-9]/gi, "_") ||
                        "urun"
                      }.pdf`}
                    />
                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="border-2 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => setDeleteDialog(true)}
                      variant="outline"
                      className="border-2 border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Kaydet
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      disabled={saving}
                      className="border-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Formula Reference Warning in Edit Mode */}
          {editMode &&
            formData.sourceFormulaId &&
            formData.sourceFormulaName && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Beaker className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Bu hesaplama bir formülden oluşturuldu
                  </h4>
                  <p className="text-sm text-blue-700">
                    <strong>{formData.sourceFormulaName}</strong> formülü baz
                    alınarak oluşturulmuştur. Değişiklikleriniz kaydedildiğinde
                    formül bağlantısı korunacaktır.
                  </p>
                  <Link
                    href={`/admin/formulas/${formData.sourceFormulaId}`}
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    <Beaker className="h-4 w-4" />
                    Formülü görüntüle
                  </Link>
                </div>
              </div>
            )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 rounded-xl p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600 mb-1">
                Birim Fiyat
              </div>
              <div className="text-3xl font-bold tracking-tight text-blue-700">
                ₺
                {editMode && calculatedPrice
                  ? calculatedPrice.unitPrice
                  : calculation.calculations?.unitPrice?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm mt-2 text-blue-600">Satış fiyatı</div>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 rounded-xl p-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-green-600 mb-1">
                Toplam Fiyat
              </div>
              <div className="text-3xl font-bold tracking-tight text-green-700">
                ₺
                {editMode && calculatedPrice
                  ? calculatedPrice.totalPrice
                  : calculation.calculations?.totalPrice?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm mt-2 text-green-600">
                {calculation.quantity} adet için
              </div>
            </div>

            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 rounded-xl p-3">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-orange-600 mb-1">
                Birim Maliyet
              </div>
              <div className="text-3xl font-bold tracking-tight text-orange-700">
                ₺
                {editMode && calculatedPrice
                  ? calculatedPrice.totalCostPerUnit
                  : calculation.calculations?.totalCostPerUnit?.toFixed(2) ||
                    "0.00"}
              </div>
              <div className="text-sm mt-2 text-orange-600">Toplam maliyet</div>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 rounded-xl p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-purple-600 mb-1">
                Birim Kar
              </div>
              <div className="text-3xl font-bold tracking-tight text-purple-700">
                ₺
                {editMode && calculatedPrice
                  ? calculatedPrice.profitPerUnit
                  : calculation.calculations?.profitPerUnit?.toFixed(2) ||
                    "0.00"}
              </div>
              <div className="text-sm mt-2 text-purple-600">Kar marjı</div>
            </div>
          </div>

          {/* Linked Companies Card */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Bağlı Müşteriler
                  <Badge variant="secondary" className="ml-2">
                    {linkedCompanies.length}
                  </Badge>
                </CardTitle>
                <Button
                  onClick={() => {
                    loadAllCompanies();
                    setShowAddCompanyDialog(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="border-2 border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Müşteri Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : linkedCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Bu hesaplama henüz hiç müşteriye atanmamış
                  </p>
                  <Button
                    onClick={() => {
                      loadAllCompanies();
                      setShowAddCompanyDialog(true);
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Müşteriyi Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedCompanies.map((company) => {
                    // Bu company'de bu hesaplamayı bul
                    const calcInCompany = (
                      company.pricingCalculations || []
                    ).find((calc) => calc.calculationId === id);

                    return (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <Link
                            href={`/admin/companies/${company.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {company.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {company.email && (
                              <span className="text-sm text-gray-500">
                                {company.email}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {company.status}
                            </Badge>
                            {calcInCompany && (
                              <Badge
                                variant="outline"
                                className="text-xs text-blue-600"
                              >
                                {new Date(
                                  calcInCompany.addedAt
                                ).toLocaleDateString("tr-TR")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            handleRemoveCompanyFromCalculation(
                              company.id,
                              calcInCompany?.id
                            )
                          }
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

          {/* Description */}
          {!editMode && calculation.description && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardContent className="pt-6">
                <p className="text-gray-700">{calculation.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Edit Mode: Description */}
          {editMode && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Ürün Açıklaması
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Açıklama
                  </Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    placeholder="Ürün açıklaması..."
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Info in Edit Mode */}
          {editMode && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Temel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Ürün Adı *
                    </Label>
                    <Input
                      value={formData.productName || ""}
                      onChange={(e) =>
                        updateField("productName", e.target.value)
                      }
                      className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Ürün Tipi
                    </Label>
                    <Select
                      value={formData.productType || ""}
                      onValueChange={(value) =>
                        updateField("productType", value)
                      }
                    >
                      <SelectTrigger className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kozmetik">Kozmetik</SelectItem>
                        <SelectItem value="gida">Gıda Takviyesi</SelectItem>
                        <SelectItem value="temizlik">Temizlik Ürünü</SelectItem>
                        <SelectItem value="kisisel-bakim">
                          Kişisel Bakım
                        </SelectItem>
                        <SelectItem value="diger">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Üretim Miktarı *
                    </Label>
                    <Input
                      type="number"
                      value={formData.quantity || ""}
                      onChange={(e) => updateField("quantity", e.target.value)}
                      className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Hacim (ml)
                    </Label>
                    <Input
                      type="number"
                      value={formData.productVolume || ""}
                      onChange={(e) =>
                        updateField("productVolume", e.target.value)
                      }
                      className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          {(calculation.formData?.ingredients?.filter((i) => i.name).length >
            0 ||
            editMode) && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ingredients" className="border-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            Hammaddeler
                          </span>
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-purple-100 text-purple-700 border-purple-200"
                          >
                            {editMode
                              ? formData.ingredients?.filter((i) => i.name)
                                  .length || 0
                              : calculation.formData.ingredients?.filter(
                                  (i) => i.name
                                ).length || 0}{" "}
                            adet
                          </Badge>
                          {!editMode &&
                            calculation.formData?.sourceFormulaId && (
                              <Link
                                href={`/admin/formulas/${calculation.formData.sourceFormulaId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950 rounded cursor-pointer transition-colors"
                              >
                                <Beaker className="h-3 w-3" />
                                {calculation.formData.sourceFormulaName}{" "}
                                Formülünden
                              </Link>
                            )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    {editMode && formData && (
                      <div className="px-6 pb-2">
                        <Button
                          onClick={addIngredient}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ekle
                        </Button>
                      </div>
                    )}
                    <AccordionContent className="px-6 pb-4">
                      {!editMode ? (
                        <Accordion type="multiple" className="w-full">
                          {calculation.formData.ingredients
                            .filter((i) => i.name)
                            .map((ing, idx) => {
                              return (
                                <AccordionItem
                                  key={idx}
                                  value={`view-ingredient-${idx}`}
                                >
                                  <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-700">
                                          {ing.name}
                                        </span>
                                        {ing.function && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {ing.function}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">
                                          {ing.amount} {ing.unit}
                                        </span>
                                        {ing.price && (
                                          <span className="text-sm font-medium text-blue-600">
                                            {parseFloat(ing.price).toFixed(2)}{" "}
                                            TL/kg
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                          <span className="text-gray-600">
                                            Miktar:
                                          </span>
                                          <p className="font-medium">
                                            {ing.amount} {ing.unit}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">
                                            Birim Fiyat:
                                          </span>
                                          <p className="font-medium">
                                            {parseFloat(ing.price).toFixed(2)}{" "}
                                            TL/kg
                                          </p>
                                        </div>
                                        {ing.supplier && (
                                          <div>
                                            <span className="text-gray-600">
                                              Tedarikçi:
                                            </span>
                                            <p className="font-medium">
                                              {ing.supplier}
                                            </p>
                                          </div>
                                        )}
                                        {ing.function && (
                                          <div>
                                            <span className="text-gray-600">
                                              Fonksiyon:
                                            </span>
                                            <p className="font-medium">
                                              {ing.function}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                        </Accordion>
                      ) : (
                        <Accordion type="multiple" className="w-full">
                          {formData.ingredients.map((ingredient, index) => (
                            <AccordionItem
                              key={index}
                              value={`ingredient-${index}`}
                            >
                              <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-4">
                                  <span>
                                    Hammadde #{index + 1}{" "}
                                    {ingredient.name && `- ${ingredient.name}`}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="p-4 space-y-4 bg-gray-50 rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                    <div className="space-y-2 md:col-span-3">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Hammadde Adı *
                                      </Label>
                                      <Input
                                        value={ingredient.name || ""}
                                        onChange={(e) =>
                                          updateIngredient(
                                            index,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        className="h-10 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Miktar *
                                      </Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={ingredient.amount || ""}
                                        onChange={(e) =>
                                          updateIngredient(
                                            index,
                                            "amount",
                                            e.target.value
                                          )
                                        }
                                        className="h-10 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Birim
                                      </Label>
                                      <Select
                                        value={ingredient.unit || "gram"}
                                        onValueChange={(value) =>
                                          updateIngredient(index, "unit", value)
                                        }
                                      >
                                        <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="gram">
                                            Gram
                                          </SelectItem>
                                          <SelectItem value="kg">
                                            Kilogram (kg)
                                          </SelectItem>
                                          <SelectItem value="ml">
                                            Mililitre (ml)
                                          </SelectItem>
                                          <SelectItem value="litre">
                                            Litre
                                          </SelectItem>
                                          <SelectItem value="adet">
                                            Adet
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Fiyat (TL/kg) *
                                      </Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={ingredient.price || ""}
                                        onChange={(e) =>
                                          updateIngredient(
                                            index,
                                            "price",
                                            e.target.value
                                          )
                                        }
                                        className="h-10 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                      />
                                    </div>
                                  </div>

                                  {formData.ingredients.length > 1 && (
                                    <div className="flex justify-end pt-2">
                                      <Button
                                        onClick={() => removeIngredient(index)}
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Sil
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Packaging */}
          {(calculation.formData?.packaging?.filter((p) => p.type).length > 0 ||
            editMode) && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Ambalaj Malzemeleri
                </CardTitle>
              </CardHeader>
              {editMode && formData && (
                <div className="px-6 pt-4">
                  <Button onClick={addPackaging} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              )}
              <CardContent>
                {!editMode ? (
                  <div className="space-y-3">
                    {calculation.formData.packaging
                      .filter((p) => p.type)
                      .map((pkg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {pkg.type}
                            </p>
                            {pkg.material && (
                              <p className="text-sm text-gray-500">
                                {pkg.material}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {pkg.quantity} {pkg.unit}
                            </p>
                            {pkg.price && (
                              <p className="text-sm text-gray-500">
                                {parseFloat(pkg.price).toFixed(2)} TL
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.packaging.map((pkg, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Ambalaj #{index + 1}
                          </span>
                          {formData.packaging.length > 1 && (
                            <Button
                              onClick={() => removePackaging(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Tip
                            </Label>
                            <Input
                              value={pkg.type || ""}
                              onChange={(e) =>
                                updatePackaging(index, "type", e.target.value)
                              }
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Malzeme
                            </Label>
                            <Input
                              value={pkg.material || ""}
                              onChange={(e) =>
                                updatePackaging(
                                  index,
                                  "material",
                                  e.target.value
                                )
                              }
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
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
                                  e.target.value
                                )
                              }
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Fiyat (TL)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={pkg.price || ""}
                              onChange={(e) =>
                                updatePackaging(index, "price", e.target.value)
                              }
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Box and Label */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Tag className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                Kutu ve Etiket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {!editMode ? (
                <>
                  {/* Box Info */}
                  {calculation.formData?.boxType && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Kutu Bilgileri
                      </h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {calculation.formData.boxType}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Miktar: {calculation.formData.boxQuantity} adet
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Birim Fiyat</p>
                            <p className="text-lg font-bold text-blue-600">
                              {parseFloat(
                                calculation.formData.boxPrice
                              ).toFixed(2)}{" "}
                              TL
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Toplam Kutu Maliyeti:
                            </span>
                            <span className="font-bold text-gray-900">
                              {(
                                parseFloat(calculation.formData.boxQuantity) *
                                parseFloat(calculation.formData.boxPrice)
                              ).toFixed(2)}{" "}
                              TL
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Label Info */}
                  {calculation.formData?.labelType && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Etiket Bilgileri
                      </h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {calculation.formData.labelType}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Miktar: {calculation.formData.labelQuantity} adet
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Birim Fiyat</p>
                            <p className="text-lg font-bold text-purple-600">
                              {parseFloat(
                                calculation.formData.labelPrice
                              ).toFixed(2)}{" "}
                              TL
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Toplam Etiket Maliyeti:
                            </span>
                            <span className="font-bold text-gray-900">
                              {(
                                parseFloat(calculation.formData.labelQuantity) *
                                parseFloat(calculation.formData.labelPrice)
                              ).toFixed(2)}{" "}
                              TL
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Kutu Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Kutu Tipi</Label>
                        <Input
                          value={formData.boxType || ""}
                          onChange={(e) =>
                            updateField("boxType", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Miktar</Label>
                        <Input
                          type="number"
                          value={formData.boxQuantity || ""}
                          onChange={(e) =>
                            updateField("boxQuantity", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Birim Fiyat (TL)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.boxPrice || ""}
                          onChange={(e) =>
                            updateField("boxPrice", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Etiket Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Etiket Tipi</Label>
                        <Input
                          value={formData.labelType || ""}
                          onChange={(e) =>
                            updateField("labelType", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Miktar</Label>
                        <Input
                          type="number"
                          value={formData.labelQuantity || ""}
                          onChange={(e) =>
                            updateField("labelQuantity", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Birim Fiyat (TL)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.labelPrice || ""}
                          onChange={(e) =>
                            updateField("labelPrice", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Labor Cost */}
          {calculation.formData?.laborCostPerUnit && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  İşçilik Maliyeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!editMode ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Birim İşçilik Maliyeti
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {parseFloat(
                            calculation.formData.laborCostPerUnit
                          ).toFixed(2)}{" "}
                          TL
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Toplam ({calculation.quantity} adet)
                        </p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {(
                            parseFloat(calculation.formData.laborCostPerUnit) *
                            calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </p>
                      </div>
                    </div>
                    {calculation.formData.laborNotes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">Notlar:</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {calculation.formData.laborNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Birim İşçilik Maliyeti (TL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.laborCostPerUnit || ""}
                        onChange={(e) =>
                          updateField("laborCostPerUnit", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notlar</Label>
                      <Textarea
                        value={formData.laborNotes || ""}
                        onChange={(e) =>
                          updateField("laborNotes", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Other Costs */}
          {(calculation.formData?.otherCosts?.filter((c) => c.description)
            .length > 0 ||
            editMode) && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <DollarSign className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Diğer Masraflar
                </CardTitle>
              </CardHeader>
              {editMode && formData && (
                <div className="px-6 pt-4">
                  <Button onClick={addOtherCost} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              )}
              <CardContent>
                {!editMode ? (
                  <div className="space-y-3">
                    {calculation.formData.otherCosts
                      .filter((c) => c.description)
                      .map((cost, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {cost.description}
                            </p>
                            {cost.category && (
                              <p className="text-sm text-gray-500 capitalize">
                                {cost.category}
                              </p>
                            )}
                          </div>
                          <p className="font-medium text-gray-900">
                            {parseFloat(cost.amount || 0).toFixed(2)} TL
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.otherCosts.map((cost, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Masraf #{index + 1}
                          </span>
                          {formData.otherCosts.length > 1 && (
                            <Button
                              onClick={() => removeOtherCost(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input
                              value={cost.description || ""}
                              onChange={(e) =>
                                updateOtherCost(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select
                              value={cost.category || "genel"}
                              onValueChange={(value) =>
                                updateOtherCost(index, "category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="genel">
                                  Genel Gider
                                </SelectItem>
                                <SelectItem value="nakliye">Nakliye</SelectItem>
                                <SelectItem value="vergi">Vergi</SelectItem>
                                <SelectItem value="depo">Depolama</SelectItem>
                                <SelectItem value="diger">Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Tutar (TL)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={cost.amount || ""}
                              onChange={(e) =>
                                updateOtherCost(index, "amount", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profit Margin */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Kar Marjı Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!editMode ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-green-700">Kar Türü</p>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {calculation.formData?.profitType === "percentage"
                          ? "Yüzde (%)"
                          : "Sabit Tutar (TL)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">
                        {calculation.formData?.profitType === "percentage"
                          ? "Kar Marjı"
                          : "Birim Kar Tutarı"}
                      </p>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {calculation.formData?.profitType === "percentage"
                          ? `%${calculation.formData?.profitMarginPercent}`
                          : `${calculation.formData?.profitAmountPerUnit} TL`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Birim Kar</p>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {calculation.calculations?.profitPerUnit?.toFixed(2) ||
                          "0.00"}{" "}
                        TL
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kar Türü</Label>
                    <Select
                      value={formData.profitType || "percentage"}
                      onValueChange={(value) =>
                        updateField("profitType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        <SelectItem value="fixed">Sabit Tutar (TL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.profitType === "percentage" ? (
                    <div className="space-y-2">
                      <Label>Kar Marjı (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.profitMarginPercent || ""}
                        onChange={(e) =>
                          updateField("profitMarginPercent", e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Birim Kar Tutarı (TL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.profitAmountPerUnit || ""}
                        onChange={(e) =>
                          updateField("profitAmountPerUnit", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Cost Breakdown - View Mode Only */}
          {!editMode && (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calculator className="h-5 w-5" />
                  Detaylı Maliyet Analizi
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Ürün başına ve toplam maliyet dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Per Unit Costs */}
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      Birim Maliyetler
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">İçerik/Hammadde:</span>
                        <span className="font-medium">
                          {(calculation.formData?.ingredients || [])
                            .reduce((sum, ing) => {
                              const amount = parseFloat(ing.amount) || 0;
                              const price = parseFloat(ing.price) || 0;
                              const unit = ing.unit || "gram";
                              const kg =
                                unit === "gram"
                                  ? amount / 1000
                                  : unit === "kg"
                                  ? amount
                                  : amount / 1000;
                              return sum + kg * price;
                            }, 0)
                            .toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">Ambalaj:</span>
                        <span className="font-medium">
                          {(calculation.formData?.packaging || [])
                            .reduce((sum, pkg) => {
                              return (
                                sum +
                                (parseFloat(pkg.quantity) || 0) *
                                  (parseFloat(pkg.price) || 0)
                              );
                            }, 0)
                            .toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">Kutu:</span>
                        <span className="font-medium">
                          {(
                            (parseFloat(calculation.formData?.boxQuantity) ||
                              0) *
                            (parseFloat(calculation.formData?.boxPrice) || 0)
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">Etiket:</span>
                        <span className="font-medium">
                          {(
                            (parseFloat(calculation.formData?.labelQuantity) ||
                              0) *
                            (parseFloat(calculation.formData?.labelPrice) || 0)
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">İşçilik:</span>
                        <span className="font-medium">
                          {parseFloat(
                            calculation.formData?.laborCostPerUnit || 0
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t-2 border-blue-200">
                        <span className="font-semibold text-gray-900">
                          Birim Maliyet:
                        </span>
                        <span className="font-bold text-blue-600">
                          {calculation.calculations?.totalCostPerUnit?.toFixed(
                            2
                          ) || "0.00"}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-green-700 font-medium">
                          Birim Kar:
                        </span>
                        <span className="font-semibold text-green-700">
                          +
                          {calculation.calculations?.profitPerUnit?.toFixed(
                            2
                          ) || "0.00"}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-blue-300 bg-blue-50 p-3 rounded -mx-2">
                        <span className="font-bold text-gray-900">
                          Birim Satış Fiyatı:
                        </span>
                        <span className="font-bold text-xl text-blue-600">
                          {calculation.calculations?.unitPrice?.toFixed(2) ||
                            "0.00"}{" "}
                          TL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Costs */}
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Toplam Maliyetler ({calculation.quantity} adet)
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">İçerik/Hammadde:</span>
                        <span className="font-medium">
                          {(
                            (calculation.formData?.ingredients || []).reduce(
                              (sum, ing) => {
                                const amount = parseFloat(ing.amount) || 0;
                                const price = parseFloat(ing.price) || 0;
                                const unit = ing.unit || "gram";
                                const kg =
                                  unit === "gram"
                                    ? amount / 1000
                                    : unit === "kg"
                                    ? amount
                                    : amount / 1000;
                                return sum + kg * price;
                              },
                              0
                            ) * calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">Ambalaj:</span>
                        <span className="font-medium">
                          {(
                            (calculation.formData?.packaging || []).reduce(
                              (sum, pkg) => {
                                return (
                                  sum +
                                  (parseFloat(pkg.quantity) || 0) *
                                    (parseFloat(pkg.price) || 0)
                                );
                              },
                              0
                            ) * calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">Kutu:</span>
                        <span className="font-medium">
                          {(
                            (parseFloat(calculation.formData?.boxQuantity) ||
                              0) *
                            (parseFloat(calculation.formData?.boxPrice) || 0) *
                            calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">Etiket:</span>
                        <span className="font-medium">
                          {(
                            (parseFloat(calculation.formData?.labelQuantity) ||
                              0) *
                            (parseFloat(calculation.formData?.labelPrice) ||
                              0) *
                            calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-gray-600">İşçilik:</span>
                        <span className="font-medium">
                          {(
                            parseFloat(
                              calculation.formData?.laborCostPerUnit || 0
                            ) * calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t-2 border-blue-200">
                        <span className="font-semibold text-gray-900">
                          Toplam Maliyet:
                        </span>
                        <span className="font-bold text-blue-600">
                          {(
                            (calculation.calculations?.totalCostPerUnit || 0) *
                            calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-green-700 font-medium">
                          Toplam Kar:
                        </span>
                        <span className="font-semibold text-green-700">
                          +
                          {(
                            (calculation.calculations?.profitPerUnit || 0) *
                            calculation.quantity
                          ).toFixed(2)}{" "}
                          TL
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-green-300 bg-green-50 p-3 rounded -mx-2">
                        <span className="font-bold text-gray-900">
                          Toplam Satış Fiyatı:
                        </span>
                        <span className="font-bold text-xl text-green-600">
                          {calculation.calculations?.totalPrice?.toFixed(2) ||
                            "0.00"}{" "}
                          TL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(calculation.formData?.notes || editMode) && (
            <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-gray-900 dark:text-white">
                  Notlar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!editMode ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {calculation.formData.notes}
                  </p>
                ) : (
                  <Textarea
                    value={formData.notes || ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={4}
                    placeholder="Özel notlar..."
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Live Calculation Display in Edit Mode */}
          {editMode && calculatedPrice && (
            <Card className="mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-blue-200 dark:border-blue-700">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Calculator className="h-5 w-5" />
                  Güncel Hesaplama
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Değişikliklerinize göre anlık hesaplama sonuçları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-900">
                      Birim Maliyetler
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">İçerik:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.ingredientsCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Ambalaj:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.packagingCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Kutu:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.boxCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Etiket:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.labelCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">İşçilik:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.laborCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Diğer:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.otherCostPerUnit} TL
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-300 flex justify-between">
                        <span className="font-medium text-blue-900">
                          Toplam Maliyet:
                        </span>
                        <span className="font-bold text-blue-900">
                          {calculatedPrice.totalCostPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Kar:</span>
                        <span className="font-medium text-green-700">
                          +{calculatedPrice.profitPerUnit} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-blue-900">
                          Birim Fiyat:
                        </span>
                        <span className="font-bold text-lg text-blue-900">
                          {calculatedPrice.unitPrice} TL
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-900">
                      Toplam ({calculatedPrice.quantity} adet)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">İçerik:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.ingredientsCostTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Ambalaj:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.packagingCostTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Kutu:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.boxCostTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Etiket:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.labelCostTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">İşçilik:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.laborCostTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Diğer:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.otherCostTotal} TL
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-300 flex justify-between">
                        <span className="font-medium text-blue-900">
                          Toplam Maliyet:
                        </span>
                        <span className="font-bold text-blue-900">
                          {calculatedPrice.totalCostTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Kar:</span>
                        <span className="font-medium text-green-700">
                          +{calculatedPrice.profitTotal} TL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-blue-900">
                          Toplam Fiyat:
                        </span>
                        <span className="font-bold text-lg text-blue-900">
                          {calculatedPrice.totalPrice} TL
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-900">Özet</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Ürün Hacmi:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.totalProductVolume}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Kar Türü:</span>
                        <span className="font-medium text-blue-900">
                          {calculatedPrice.profitType === "percentage"
                            ? `%${calculatedPrice.profitMarginPercent}`
                            : "Sabit Tutar"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Kar Marjı:</span>
                        <span className="font-medium text-green-700">
                          {calculatedPrice.profitType === "percentage"
                            ? `${(
                                (parseFloat(calculatedPrice.profitPerUnit) /
                                  parseFloat(
                                    calculatedPrice.totalCostPerUnit
                                  )) *
                                100
                              ).toFixed(1)}%`
                            : `${calculatedPrice.profitPerUnit} TL/adet`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Company Dialog */}
        <Dialog
          open={showAddCompanyDialog}
          onOpenChange={setShowAddCompanyDialog}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Müşteri Ekle
              </DialogTitle>
              <DialogDescription>
                Bu hesaplamayı eklemek istediğiniz müşteriyi seçin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company-select">Müşteri Seçin</Label>
                <Select
                  value={selectedCompanyToAdd}
                  onValueChange={setSelectedCompanyToAdd}
                >
                  <SelectTrigger id="company-select">
                    <SelectValue placeholder="Bir müşteri seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCompanies
                      .filter(
                        (company) =>
                          !linkedCompanies.some((lc) => lc.id === company.id)
                      )
                      .map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex items-center gap-2">
                            <span>{company.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {company.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {allCompanies.filter(
                (company) => !linkedCompanies.some((lc) => lc.id === company.id)
              ).length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Tüm müşteriler bu hesaplamaya zaten eklenmiş
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddCompanyToCalculation}
                  disabled={!selectedCompanyToAdd}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent className="bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Hesaplamayı Sil
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                Bu hesaplamayı silmek istediğinizden emin misiniz? Bu işlem geri
                alınamaz ve tüm bağlı müşteri kayıtları da kaldırılacaktır.
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
