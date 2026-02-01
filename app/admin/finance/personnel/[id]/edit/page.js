"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getPersonnelById,
  updatePersonnel,
  getPersonnelList,
  PERSONNEL_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import { getAllUsers } from "@/lib/services/admin-user-service";
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
  RefreshCw,
  UserCircle,
  Link2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function EditPersonnelPage() {
  const router = useRouter();
  const params = useParams();
  const { user, permissions } = useAdminAuth();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [existingPersonnel, setExistingPersonnel] = useState([]);
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [originalLinkedUserId, setOriginalLinkedUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    linkedUserId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    baseSalary: "",
    salaryCurrency: CURRENCY.TRY,
    startDate: "",
    status: PERSONNEL_STATUS.ACTIVE,
    bankName: "",
    iban: "",
    address: "",
    emergencyContact: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Personel bilgisini yükle
      const personnelResult = await getPersonnelById(params.id);
      if (personnelResult.success) {
        const p = personnelResult.data;
        setFormData({
          linkedUserId: p.linkedUserId || "",
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          email: p.email || "",
          phone: p.phone || "",
          position: p.position || "",
          department: p.department || "",
          baseSalary: p.baseSalary?.toString() || "",
          salaryCurrency: p.salaryCurrency || p.currency || CURRENCY.TRY,
          startDate: p.startDate ? formatDateForInput(p.startDate) : "",
          status: p.status || PERSONNEL_STATUS.ACTIVE,
          bankName: p.bankName || "",
          iban: p.iban || "",
          address: p.address || "",
          emergencyContact: p.emergencyContact || "",
          notes: p.notes || "",
        });
        setOriginalLinkedUserId(p.linkedUserId || null);
      } else {
        toast.error("Personel bulunamadı");
        router.push("/admin/finance/personnel");
        return;
      }
      
      // Kullanıcıları yükle
      const usersResult = await getAllUsers(permissions);
      if (usersResult.success) {
        setUsers(usersResult.users || []);
      }
      
      // Mevcut personelleri yükle (bağlı kullanıcıları filtrelemek için)
      const personnelListResult = await getPersonnelList();
      if (personnelListResult.success) {
        setExistingPersonnel(personnelListResult.data || []);
      }
    } catch (error) {
      toast.error("Veri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  // Kullanıcı seçildiğinde
  const handleUserSelect = (userId) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        linkedUserId: userId,
        // Email'i sadece boşsa güncelle
        email: prev.email || selectedUser.email || "",
      }));
    }
    setUserSelectOpen(false);
  };

  // Kullanıcı bağlantısını kaldır
  const handleRemoveUserLink = () => {
    setFormData(prev => ({
      ...prev,
      linkedUserId: "",
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Zaten personele bağlı kullanıcıları filtrele (bu personel hariç)
  const linkedUserIds = existingPersonnel
    .filter(p => p.linkedUserId && p.id !== params.id)
    .map(p => p.linkedUserId);

  const availableUsers = users.filter(u => !linkedUserIds.includes(u.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      const updateData = {
        linkedUserId: formData.linkedUserId || null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        position: formData.position || null,
        department: formData.department || null,
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : 0,
        salaryCurrency: formData.salaryCurrency,
        currency: formData.salaryCurrency,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        status: formData.status,
        bankName: formData.bankName || null,
        iban: formData.iban || null,
        address: formData.address || null,
        emergencyContact: formData.emergencyContact || null,
        notes: formData.notes || null,
      };

      const result = await updatePersonnel(params.id, updateData, user?.uid);
      
      if (result.success) {
        toast.success("Personel kaydı güncellendi");
        router.push(`/admin/finance/personnel/${params.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Personel güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find(u => u.id === formData.linkedUserId);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/finance/personnel/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personel Düzenle</h1>
          <p className="text-sm text-slate-500">{formData.firstName} {formData.lastName}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kullanıcı Bağlantısı */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              Sistem Kullanıcısı Bağlantısı
            </CardTitle>
            <CardDescription>
              Personeli sistemdeki bir kullanıcıya bağlayın. Bağlı kullanıcılar kendi sayfalarında maaş ve finans bilgilerini görebilirler.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {formData.linkedUserId ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser?.photoURL} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {selectedUser?.firstName?.[0] || selectedUser?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
                      {selectedUser?.displayName || `${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`}
                    </p>
                    <p className="text-sm text-slate-500">{selectedUser?.email}</p>
                  </div>
                  <Badge className="ml-2 bg-blue-100 text-blue-700">Bağlı</Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveUserLink}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Bağlantıyı Kaldır
                </Button>
              </div>
            ) : (
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-slate-500 border-slate-300"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Kullanıcı Seç (Opsiyonel)
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Kullanıcı ara..." />
                    <CommandList>
                      <CommandEmpty>Kullanıcı bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {availableUsers.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.email} ${u.displayName || ''} ${u.firstName || ''}`}
                            onSelect={() => handleUserSelect(u.id)}
                            className="cursor-pointer"
                          >
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={u.photoURL} />
                              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                {u.firstName?.[0] || u.email?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {u.displayName || `${u.firstName || ''} ${u.lastName || ''}`}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{u.email}</p>
                            </div>
                            {u.role && (
                              <Badge variant="outline" className="text-xs ml-2">
                                {u.role}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </CardContent>
        </Card>

        {/* Kişisel Bilgiler */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">İsim *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="İsim"
                  className="border-slate-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyisim *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Soyisim"
                  className="border-slate-300"
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
                    className="pl-9 border-slate-300"
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
                    className="pl-9 border-slate-300"
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
                  className="pl-9 min-h-[80px] border-slate-300"
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
                className="border-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* İş Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              İş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Pozisyon</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="Çalışan pozisyonu"
                  className="border-slate-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departman</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="Departman adı"
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PERSONNEL_STATUS.ACTIVE}>Aktif</SelectItem>
                    <SelectItem value={PERSONNEL_STATUS.ON_LEAVE}>İzinli</SelectItem>
                    <SelectItem value={PERSONNEL_STATUS.TERMINATED}>İşten Ayrılmış</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="pl-9 border-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maaş Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Maaş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
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
                  className="border-slate-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">Para Birimi</Label>
                <Select
                  value={formData.salaryCurrency}
                  onValueChange={(value) => handleChange("salaryCurrency", value)}
                >
                  <SelectTrigger className="border-slate-300">
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
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Banka Bilgileri
            </CardTitle>
            <CardDescription>Maaş ödemesi için banka bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banka Adı</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Banka adı"
                  className="border-slate-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => handleChange("iban", e.target.value)}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="border-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Personel ile ilgili ek notlar..."
              rows={4}
              className="border-slate-300"
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <Button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
          <Link href={`/admin/finance/personnel/${params.id}`}>
            <Button type="button" variant="outline" className="border-slate-300">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
