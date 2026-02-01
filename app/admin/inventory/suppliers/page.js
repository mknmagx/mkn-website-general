"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../../hooks/use-toast";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useSuppliers } from "../../../../hooks/use-inventory";
import { supplierService } from "../../../../lib/services/inventory-service";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

// Icons
import {
  Truck,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Search,
  X,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Calendar,
  Package,
  MoreVertical,
} from "lucide-react";

const SUPPLIER_TYPE_LABELS = {
  manufacturer: "Üretici",
  distributor: "Distribütör",
  wholesaler: "Toptancı",
  retailer: "Perakendeci",
  other: "Diğer",
};

export default function SuppliersPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { suppliers, loading, refresh } = useSuppliers();

  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formDialog, setFormDialog] = useState({ open: false, supplier: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, supplier: null });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "manufacturer",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    if (formDialog.supplier) {
      setFormData({
        name: formDialog.supplier.name || "",
        code: formDialog.supplier.code || "",
        type: formDialog.supplier.type || "manufacturer",
        contactPerson: formDialog.supplier.contactPerson || "",
        email: formDialog.supplier.email || "",
        phone: formDialog.supplier.phone || "",
        website: formDialog.supplier.website || "",
        address: formDialog.supplier.address || "",
        notes: formDialog.supplier.notes || "",
        isActive: formDialog.supplier.isActive !== false,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        type: "manufacturer",
        contactPerson: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        notes: "",
        isActive: true,
      });
    }
  }, [formDialog]);

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.code?.toLowerCase().includes(term) ||
      s.contactPerson?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Hata",
        description: "Tedarikçi adı ve kodu zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (formDialog.supplier) {
        await supplierService.update(formDialog.supplier.id, formData, user);
        toast({
          title: "Başarılı",
          description: "Tedarikçi güncellendi.",
        });
      } else {
        await supplierService.create(formData, user);
        toast({
          title: "Başarılı",
          description: "Tedarikçi oluşturuldu.",
        });
      }
      setFormDialog({ open: false, supplier: null });
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.supplier) return;

    setSaving(true);
    try {
      await supplierService.delete(deleteDialog.supplier.id);
      toast({
        title: "Başarılı",
        description: "Tedarikçi silindi.",
      });
      setDeleteDialog({ open: false, supplier: null });
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tedarikçiler</h1>
            <p className="text-sm text-slate-600 mt-1">
              Toplam {filteredSuppliers.length} tedarikçi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setFormDialog({ open: true, supplier: null })}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Tedarikçi
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Search */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="İsim, kod veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="bg-white border-slate-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {supplier.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {supplier.code}
                        </code>
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          {SUPPLIER_TYPE_LABELS[supplier.type]}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      supplier.isActive
                        ? "border-green-300 text-green-700 bg-green-50"
                        : "border-red-300 text-red-700 bg-red-50"
                    }
                  >
                    {supplier.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.contactPerson && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4 text-slate-400" />
                    {supplier.contactPerson}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${supplier.phone}`} className="hover:text-blue-600">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a
                      href={`mailto:${supplier.email}`}
                      className="hover:text-blue-600 truncate"
                    >
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Package className="h-3 w-3" />
                      {supplier.productCount || 0} ürün
                    </div>
                    {supplier.createdAt?.seconds && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(supplier.createdAt.seconds * 1000),
                          "dd MMM yyyy",
                          { locale: tr }
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300"
                    onClick={() => setFormDialog({ open: true, supplier })}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteDialog({ open: true, supplier })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredSuppliers.length === 0 && (
            <div className="col-span-full">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-12 text-center">
                  <Truck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {searchTerm ? "Tedarikçi bulunamadı" : "Henüz tedarikçi yok"}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {searchTerm
                      ? "Farklı arama terimleri deneyin."
                      : "İlk tedarikçinizi ekleyerek başlayın."}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setFormDialog({ open: true, supplier: null })}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Tedarikçi
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => !open && setFormDialog({ open: false, supplier: null })}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formDialog.supplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.supplier
                ? "Tedarikçi bilgilerini güncelleyin."
                : "Yeni tedarikçi için gerekli bilgileri girin."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tedarikçi Adı *</Label>
                <Input
                  placeholder="ABC Ambalaj"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Tedarikçi Kodu *</Label>
                <Input
                  placeholder="TED-001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tedarikçi Tipi</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPLIER_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Yetkili Kişi</Label>
              <Input
                placeholder="Ahmet Yılmaz"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                className="border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  placeholder="+90 532 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  placeholder="info@tedarikci.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://tedarikci.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Adres</Label>
              <Textarea
                placeholder="Tam adres..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-slate-300 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Notlar</Label>
              <Textarea
                placeholder="Tedarikçi hakkında ek notlar..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-slate-300 min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label>Aktif</Label>
                <p className="text-xs text-slate-500">
                  Deaktif tedarikçiler seçimlerde görünmez
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormDialog({ open: false, supplier: null })}
              className="border-slate-300"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {saving ? "Kaydediliyor..." : formDialog.supplier ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, supplier: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tedarikçiyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteDialog.supplier?.name}</strong> tedarikçisini silmek
              istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              {saving ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
