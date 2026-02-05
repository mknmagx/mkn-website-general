"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getDocuments } from "@/lib/firestore";
import {
  createPayable,
  CURRENCY,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function NewPayablePage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useSupplierSelect, setUseSupplierSelect] = useState(true);
  
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierId: "",
    description: "",
    totalAmount: "",
    currency: CURRENCY.TRY,
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await getDocuments("inventory_suppliers");
      setSuppliers(suppliersData || []);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierSelect = (supplierId) => {
    if (supplierId === "manual") {
      setUseSupplierSelect(false);
      setFormData(prev => ({ ...prev, supplierName: "", supplierId: "" }));
    } else if (supplierId === "none") {
      setFormData(prev => ({ ...prev, supplierName: "", supplierId: "" }));
    } else {
      const selectedSupplier = suppliers.find(s => s.id === supplierId);
      if (selectedSupplier) {
        setFormData(prev => ({
          ...prev,
          supplierName: selectedSupplier.name || '',
          supplierId: supplierId,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.supplierName.trim()) {
      toast.error("Tedarikçi adı zorunludur");
      return;
    }
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }

    setSaving(true);
    try {
      const payableData = {
        supplierName: formData.supplierName,
        supplierId: formData.supplierId || null,
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        currency: formData.currency,
        invoiceNumber: formData.invoiceNumber || null,
        invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        notes: formData.notes,
      };

      const result = await createPayable(payableData, user?.uid);
      
      if (result.success) {
        toast.success("Borç kaydı oluşturuldu");
        router.push("/admin/finance/payables");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Borç oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/payables">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Borç</h1>
          <p className="text-sm text-slate-500">Yeni borç kaydı oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tedarikçi Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              Tedarikçi Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="supplierName">Tedarikçi Adı *</Label>
                  {!useSupplierSelect && suppliers.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseSupplierSelect(true)}
                      className="h-6 text-xs text-blue-600"
                    >
                      <Building2 className="w-3 h-3 mr-1" />
                      Listeden Seç
                    </Button>
                  )}
                </div>
                {useSupplierSelect && suppliers.length > 0 ? (
                  <Select
                    value={formData.supplierId || "none"}
                    onValueChange={handleSupplierSelect}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Tedarikçi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Seçilmedi</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="manual" className="text-blue-600">
                        Manuel Giriş Yap
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => handleChange("supplierName", e.target.value)}
                    placeholder="Tedarikçi veya firma adı"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplierId">Tedarikçi ID</Label>
                <Input
                  id="supplierId"
                  value={formData.supplierId}
                  onChange={(e) => handleChange("supplierId", e.target.value)}
                  placeholder="Tedarikçi ID (opsiyonel)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Borç açıklaması"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fatura Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-600" />
              Fatura Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Fatura Numarası</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                  placeholder="Fatura no"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Fatura Tarihi</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => handleChange("invoiceDate", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutar Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              Tutar ve Vade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Toplam Tutar *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCY).map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Vade Tarihi</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Borç ile ilgili ek notlar..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Borç Kaydet
              </>
            )}
          </Button>
          <Link href="/admin/finance/payables">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
