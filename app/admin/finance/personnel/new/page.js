"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  createPersonnel,
  PERSONNEL_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  FileText,
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

export default function NewPersonnelPage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    baseSalary: "",
    salaryCurrency: CURRENCY.TRY,
    startDate: new Date().toISOString().split("T")[0],
    bankName: "",
    iban: "",
    address: "",
    emergencyContact: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.firstName.trim()) {
      toast.error("İsim zorunludur");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Soyisim zorunludur");
      return;
    }

    setSaving(true);
    try {
      const personnelData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        position: formData.position || null,
        department: formData.department || null,
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : 0,
        salaryCurrency: formData.salaryCurrency,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        bankName: formData.bankName || null,
        iban: formData.iban || null,
        address: formData.address || null,
        emergencyContact: formData.emergencyContact || null,
        notes: formData.notes || null,
        status: PERSONNEL_STATUS.ACTIVE,
      };

      const result = await createPersonnel(personnelData, user?.uid);
      
      if (result.success) {
        toast.success("Personel kaydı oluşturuldu");
        router.push("/admin/finance/personnel");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Personel oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/personnel">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Personel</h1>
          <p className="text-sm text-slate-500">Yeni personel kaydı oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kişisel Bilgiler */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">İsim *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="İsim"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyisim *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Soyisim"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="ornek@email.com"
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Açık adres"
                  className="pl-9 min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Acil Durum İletişim</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                placeholder="İsim ve telefon"
              />
            </div>
          </CardContent>
        </Card>

        {/* İş Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              İş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Pozisyon</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="Çalışan pozisyonu"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departman</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="Departman adı"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">İşe Başlama Tarihi</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maaş Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Maaş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseSalary">Maaş</Label>
                <Input
                  id="baseSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.baseSalary}
                  onChange={(e) => handleChange("baseSalary", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">Para Birimi</Label>
                <Select
                  value={formData.salaryCurrency}
                  onValueChange={(value) => handleChange("salaryCurrency", value)}
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
            </div>
          </CardContent>
        </Card>

        {/* Banka Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Banka Bilgileri
            </CardTitle>
            <CardDescription>Maaş ödemesi için banka bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banka Adı</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Banka adı"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => handleChange("iban", e.target.value)}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Personel ile ilgili ek notlar..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Personel Kaydet
              </>
            )}
          </Button>
          <Link href="/admin/finance/personnel">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
