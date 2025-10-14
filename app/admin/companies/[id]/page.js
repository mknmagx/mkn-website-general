"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  getCompanyById,
  updateCompanyNotes,
  updateCompanyReminders,
  updateLastContact,
} from "../../../../lib/services/companies-service";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";
import { Input } from "../../../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Globe,
  Edit,
  MessageSquare,
  Bell,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Plus,
  ExternalLink,
  Download,
} from "lucide-react";
import Link from "next/link";
import CompanyCommunications from "../../../../components/company-communications";
import { PermissionGuard } from "../../../../components/admin-route-guard";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [newReminder, setNewReminder] = useState({ date: "", description: "" });

  // URL parametresinden tab'ı belirle
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
  useEffect(() => {
    if (params.id) {
      loadCompany();
    }
  }, [params.id]);

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
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Not eklenirken bir hata oluştu!");
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
    } catch (error) {
      console.error("Error adding reminder:", error);
      alert("Hatırlatıcı eklenirken bir hata oluştu!");
    }
  };

  // Son iletişim tarihini güncelle
  const handleUpdateLastContact = async () => {
    if (!company) return;

    try {
      await updateLastContact(company.id);
      setCompany((prev) => ({
        ...prev,
        lastContact: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error updating last contact:", error);
    }
  };

  if (loading) {
    return (
      <PermissionGuard requiredPermission="companies.view">
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse">
              <div className="text-lg text-gray-600">
                Firma bilgileri yükleniyor...
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Firma bulunamadı
            </h2>
            <p className="text-gray-600">Aradığınız firma mevcut değil.</p>
            <Link href="/admin/companies">
              <Button className="mt-4">Firma Listesine Dön</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active-client":
        return "bg-green-100 text-green-800";
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "negotiation":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "paused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBusinessLineColor = (businessLine) => {
    switch (businessLine) {
      case "ambalaj":
        return "bg-indigo-100 text-indigo-800";
      case "eticaret":
        return "bg-violet-100 text-violet-800";
      case "pazarlama":
        return "bg-pink-100 text-pink-800";
      case "fason-kozmetik":
        return "bg-emerald-100 text-emerald-800";
      case "fason-gida":
        return "bg-orange-100 text-orange-800";
      case "fason-temizlik":
        return "bg-cyan-100 text-cyan-800";
      case "tasarim":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: Building2 },
    { id: "communications", label: "İletişim Geçmişi", icon: MessageSquare },
    { id: "notes", label: "Notlar & Görüşmeler", icon: MessageSquare },
    { id: "reminders", label: "Hatırlatmalar", icon: Bell },
    { id: "documents", label: "Belgeler", icon: FileText },
    { id: "analytics", label: "Analitik", icon: TrendingUp },
  ];

  return (
    <PermissionGuard requiredPermission="companies.view">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  {company.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {company.businessLine === "ambalaj"
                    ? "Ambalaj Üretimi"
                    : company.businessLine === "eticaret"
                    ? "E-ticaret Yönetimi"
                    : company.businessLine === "pazarlama"
                    ? "Pazarlama Hizmetleri"
                    : company.businessLine === "fason-kozmetik"
                    ? "Fason Üretim - Kozmetik"
                    : company.businessLine === "fason-gida"
                    ? "Fason Üretim - Gıda Takviyesi"
                    : company.businessLine === "fason-temizlik"
                    ? "Fason Üretim - Temizlik Ürünleri"
                    : company.businessLine === "tasarim"
                    ? "Tasarım Hizmetleri"
                    : "Diğer"}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(company.status)}>
                  {company.status === "lead"
                    ? "Potansiyel Müşteri"
                    : company.status === "negotiation"
                    ? "Görüşme Aşamasında"
                    : company.status === "active-client"
                    ? "Aktif Müşteri"
                    : company.status === "completed"
                    ? "Tamamlandı"
                    : company.status === "paused"
                    ? "Beklemede"
                    : "Diğer"}
                </Badge>
                <Badge className={getPriorityColor(company.priority)}>
                  {company.priority === "high"
                    ? "Yüksek Öncelik"
                    : company.priority === "medium"
                    ? "Orta Öncelik"
                    : "Düşük Öncelik"}
                </Badge>
                <Badge className={getBusinessLineColor(company.businessLine)}>
                  {company.businessLine === "ambalaj"
                    ? "Ambalaj"
                    : company.businessLine === "eticaret"
                    ? "E-ticaret"
                    : company.businessLine === "pazarlama"
                    ? "Pazarlama"
                    : company.businessLine === "fason-kozmetik"
                    ? "Fason-Kozmetik"
                    : company.businessLine === "fason-gida"
                    ? "Fason-Gıda"
                    : company.businessLine === "fason-temizlik"
                    ? "Fason-Temizlik"
                    : company.businessLine === "tasarim"
                    ? "Tasarım"
                    : "Diğer"}
                </Badge>
              </div>
              <Link href={`/admin/companies/${company.id}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Aylık Hacim</p>
                      <p className="text-lg font-bold text-green-600">
                        {company.projectDetails?.monthlyVolume || "N/A"}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Aylık Değer</p>
                      <p className="text-lg font-bold text-blue-600">
                        {company.projectDetails?.expectedMonthlyValue || "N/A"}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sözleşme Değeri</p>
                      <p className="text-lg font-bold text-purple-600">
                        {company.contractDetails?.contractValue || "N/A"}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Memnuniyet</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {company.satisfaction}/5
                      </p>
                    </div>
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>İletişim Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Telefon</p>
                            <p className="font-medium">{company.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">E-posta</p>
                            <p className="font-medium">{company.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Website</p>
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {company.website.replace("https://", "")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Adres</p>
                            <p className="font-medium">{company.address}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>İletişim Kişisi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Kişi</p>
                            <p className="font-medium">
                              {company.contactPerson}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Pozisyon</p>
                            <p className="font-medium">
                              {company.contactPosition}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Direkt Telefon
                            </p>
                            <p className="font-medium">
                              {company.contactPhone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Direkt E-posta
                            </p>
                            <p className="font-medium">
                              {company.contactEmail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Hizmetler & Etiketler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Proje Açıklaması
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {company.projectDetails?.projectDescription ||
                            "Proje açıklaması mevcut değil"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Teknik Özellikler
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {company.projectDetails?.specifications ||
                            "Teknik özellik bilgisi mevcut değil"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Firma Detayları</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kuruluş Yılı</span>
                        <span className="font-medium">
                          {company.foundedYear}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Çalışan Sayısı</span>
                        <span className="font-medium">{company.employees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">İş Kolu</span>
                        <span className="font-medium">
                          {company.businessLine === "ambalaj"
                            ? "Ambalaj Üretimi"
                            : company.businessLine === "eticaret"
                            ? "E-ticaret Yönetimi"
                            : company.businessLine === "pazarlama"
                            ? "Pazarlama Hizmetleri"
                            : company.businessLine === "fason-kozmetik"
                            ? "Fason Üretim - Kozmetik"
                            : company.businessLine === "fason-gida"
                            ? "Fason Üretim - Gıda Takviyesi"
                            : company.businessLine === "fason-temizlik"
                            ? "Fason Üretim - Temizlik Ürünleri"
                            : company.businessLine === "tasarim"
                            ? "Tasarım Hizmetleri"
                            : "Diğer"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ürün Tipi</span>
                        <span className="font-medium">
                          {company.projectDetails?.productType || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Sözleşme Başlangıç
                        </span>
                        <span className="font-medium">
                          {company.contractDetails?.contractStart || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sözleşme Bitiş</span>
                        <span className="font-medium">
                          {company.contractDetails?.contractEnd || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sosyal Medya</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(company.socialMedia).map(
                        ([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span className="capitalize font-medium">
                              {platform}
                            </span>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </a>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "communications" && (
              <CompanyCommunications
                companyId={company.id}
                companyName={company.name}
              />
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                {/* Add Note */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yeni Not Ekle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Görüşme notları, önemli bilgiler veya gözlemlerinizi buraya yazın..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Not Ekle
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes List */}
                <div className="space-y-4">
                  {company.notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {note.author}
                              </p>
                              <p className="text-sm text-gray-600">
                                {note.date}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {note.type === "meeting"
                              ? "Toplantı"
                              : note.type === "project"
                              ? "Proje"
                              : note.type === "update"
                              ? "Güncelleme"
                              : "Not"}
                          </Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reminders" && (
              <div className="space-y-6">
                {/* Add Reminder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yeni Hatırlatma Ekle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="date"
                        value={newReminder.date}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Hatırlatma açıklaması"
                        value={newReminder.description}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      onClick={handleAddReminder}
                      disabled={!newReminder.date || !newReminder.description}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Hatırlatma Ekle
                    </Button>
                  </CardContent>
                </Card>

                {/* Reminders List */}
                <div className="space-y-4">
                  {company.reminders.map((reminder) => (
                    <Card key={reminder.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Bell className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {reminder.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                {reminder.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              className={getPriorityColor(reminder.priority)}
                            >
                              {reminder.priority === "high"
                                ? "Yüksek"
                                : reminder.priority === "medium"
                                ? "Orta"
                                : "Düşük"}
                            </Badge>
                            <Badge variant="secondary">
                              {reminder.status === "pending"
                                ? "Bekliyor"
                                : "Tamamlandı"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Belgeler</CardTitle>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Belge Yükle
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {company.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {doc.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {doc.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {doc.type === "contract"
                                ? "Sözleşme"
                                : doc.type === "report"
                                ? "Rapor"
                                : "Belge"}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Performans Özeti
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Toplam Proje</span>
                          <span className="font-bold text-blue-600">
                            {company.projectsCompleted || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Ortalama Memnuniyet
                          </span>
                          <span className="font-bold text-green-600">
                            {company.satisfaction}/5
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Toplam Harcama</span>
                          <span className="font-bold text-purple-600">
                            {company.monthlyBudget
                              ? parseInt(
                                  company.monthlyBudget.replace(/[^\d]/g, "")
                                ) *
                                  8 +
                                " TL"
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        İletişim İstatistikleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Toplam Not</span>
                          <span className="font-bold">
                            {company.notes.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Aktif Hatırlatma
                          </span>
                          <span className="font-bold text-orange-600">
                            {
                              company.reminders.filter(
                                (r) => r.status === "pending"
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Son İletişim</span>
                          <span className="font-bold">
                            {company.lastContact}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Sözleşme Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Başlangıç</span>
                          <span className="font-bold">
                            {company.contractStart}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bitiş</span>
                          <span className="font-bold">
                            {company.contractEnd}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kalan Süre</span>
                          <span className="font-bold text-red-600">
                            {Math.round(
                              (new Date(company.contractEnd) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            gün
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
