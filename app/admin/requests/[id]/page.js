"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRequest } from "../../../../hooks/use-requests";
import { usePermissions } from "../../../../components/admin-route-guard";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  REQUEST_STATUS,
  getRequestCategoryLabel,
  getRequestStatusLabel,
  getRequestPriorityLabel,
  getRequestSourceLabel,
} from "../../../../lib/services/request-service";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";

// Icons
import {
  MessageSquareText,
  ArrowLeft,
  Edit3,
  Save,
  Plus,
  MessageSquare,
  Calendar,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { request, loading, error, updateRequest, addNote, addFollowUp } =
    useRequest(params.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [newFollowUp, setNewFollowUp] = useState({
    type: "call",
    description: "",
    scheduledDate: "",
    assignedTo: "",
  });

  const canView = hasPermission("requests.view") || hasPermission("admin.all");
  const canEdit = hasPermission("requests.edit") || hasPermission("admin.all");

  useEffect(() => {
    if (request && !isEditing) {
      setEditData({
        status: request.status,
        priority: request.priority,
        assignedTo: request.assignedTo || "",
        estimatedValue: request.estimatedValue || 0,
        actualValue: request.actualValue || 0,
        expectedDelivery: request.expectedDelivery || "",
        notes: request.notes || [],
      });
    }
  }, [request, isEditing]);

  const handleSave = async () => {
    try {
      const result = await updateRequest(editData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const result = await addNote({
        content: newNote,
        author: user?.displayName || user?.email,
        authorId: user?.uid,
      });

      if (result.success) {
        setNewNote("");
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.description.trim()) return;

    try {
      const result = await addFollowUp({
        ...newFollowUp,
        createdBy: user?.uid,
        createdByName: user?.displayName || user?.email,
      });

      if (result.success) {
        setNewFollowUp({
          type: "call",
          description: "",
          scheduledDate: "",
          assignedTo: "",
        });
      }
    } catch (error) {
      console.error("Error adding follow up:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case REQUEST_STATUS.ASSIGNED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case REQUEST_STATUS.IN_PROGRESS:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case REQUEST_STATUS.WAITING_CLIENT:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case REQUEST_STATUS.QUOTATION_SENT:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case REQUEST_STATUS.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case REQUEST_STATUS.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case REQUEST_STATUS.COMPLETED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case REQUEST_STATUS.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-500">
            Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Talep Bulunamadı
          </h3>
          <p className="text-gray-500">
            {error || "Belirtilen talep bulunamadı."}
          </p>
          <Link href="/admin/requests">
            <Button className="mt-4">Taleplere Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/requests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquareText className="h-8 w-8 text-blue-600" />
              {request.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-gray-600">#{request.requestNumber}</span>
              <Badge
                variant="outline"
                className={getStatusColor(request.status)}
              >
                {getRequestStatusLabel(request.status)}
              </Badge>
              <span className="text-gray-500">
                {getRequestCategoryLabel(request.category)}
              </span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Link href={`/admin/requests/${params.id}/edit`}>
              <Button variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Tam Düzenle
              </Button>
            </Link>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  İptal
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="ghost">
                <Edit3 className="h-4 w-4 mr-2" />
                Hızlı Düzenle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="details">Detaylar</TabsTrigger>
          <TabsTrigger value="notes">
            Notlar ({request.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            Takip ({request.followUps?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Talep Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Açıklama</Label>
                    <p className="text-gray-700 mt-1">{request.description}</p>
                  </div>

                  {request.requirements && (
                    <div>
                      <Label>Özel Gereksinimler</Label>
                      <p className="text-gray-700 mt-1">
                        {request.requirements}
                      </p>
                    </div>
                  )}

                  {request.additionalNotes && (
                    <div>
                      <Label>Ek Notlar</Label>
                      <p className="text-gray-700 mt-1">
                        {request.additionalNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>Firma</Label>
                        <p className="text-gray-700">{request.companyName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>İletişim Kişisi</Label>
                        <p className="text-gray-700">
                          {request.contactPerson || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>E-posta</Label>
                        <p className="text-gray-700">{request.contactEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>Telefon</Label>
                        <p className="text-gray-700">
                          {request.contactPhone || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Durum & Öncelik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label>Durum</Label>
                        <Select
                          value={editData.status}
                          onValueChange={(value) =>
                            setEditData((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(REQUEST_STATUS).map((status) => (
                              <SelectItem key={status} value={status}>
                                {getRequestStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Atanan Kişi</Label>
                        <Input
                          value={editData.assignedTo}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              assignedTo: e.target.value,
                            }))
                          }
                          placeholder="Atanan kişi"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Durum</Label>
                        <Badge
                          variant="outline"
                          className={getStatusColor(request.status)}
                        >
                          {getRequestStatusLabel(request.status)}
                        </Badge>
                      </div>

                      <div>
                        <Label>Öncelik</Label>
                        <p className="text-gray-700">
                          {getRequestPriorityLabel(request.priority)}
                        </p>
                      </div>

                      <div>
                        <Label>Kaynak</Label>
                        <p className="text-gray-700">
                          {getRequestSourceLabel(request.source)}
                        </p>
                      </div>

                      {request.assignedTo && (
                        <div>
                          <Label>Atanan Kişi</Label>
                          <p className="text-gray-700">{request.assignedTo}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Değer & Tarihler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label>Tahmini Değer (TL)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editData.estimatedValue}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              estimatedValue: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <Label>Gerçek Değer (TL)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editData.actualValue}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              actualValue: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <Label>Tahmini Değer</Label>
                          <p className="text-gray-700">
                            {formatCurrency(request.estimatedValue)}
                          </p>
                        </div>
                      </div>

                      {request.actualValue > 0 && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <div>
                            <Label>Gerçek Değer</Label>
                            <p className="text-gray-700">
                              {formatCurrency(request.actualValue)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <Label>Oluşturulma</Label>
                          <p className="text-gray-700">
                            {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>

                      {request.expectedDelivery && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <Label>Beklenen Teslimat</Label>
                            <p className="text-gray-700">
                              {request.expectedDelivery}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Talep Detayları */}
            <Card>
              <CardHeader>
                <CardTitle>Talep Detayları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Talep ID
                    </Label>
                    <p className="text-gray-900">{request.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Talep Numarası
                    </Label>
                    <p className="text-gray-900">#{request.requestNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Kategori
                    </Label>
                    <p className="text-gray-900">
                      {getRequestCategoryLabel(request.category)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Öncelik
                    </Label>
                    <p className="text-gray-900">
                      {getRequestPriorityLabel(request.priority)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Kaynak
                    </Label>
                    <p className="text-gray-900">
                      {getRequestSourceLabel(request.source)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Durum
                    </Label>
                    <Badge
                      variant="outline"
                      className={getStatusColor(request.status)}
                    >
                      {getRequestStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>

                {request.requirements && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Özel Gereksinimler
                    </Label>
                    <p className="text-gray-900 mt-1">{request.requirements}</p>
                  </div>
                )}

                {request.additionalNotes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Ek Notlar
                    </Label>
                    <p className="text-gray-900 mt-1">
                      {request.additionalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Firma Detayları */}
            <Card>
              <CardHeader>
                <CardTitle>Firma Detayları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Firma Adı
                  </Label>
                  <p className="text-gray-900">{request.companyName}</p>
                </div>

                {request.companyId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Firma ID
                    </Label>
                    <p className="text-gray-900">{request.companyId}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      İletişim Kişisi
                    </Label>
                    <p className="text-gray-900">
                      {request.contactPerson || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      E-posta
                    </Label>
                    <p className="text-gray-900">{request.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Telefon
                    </Label>
                    <p className="text-gray-900">
                      {request.contactPhone || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Değer ve Tarihler */}
            <Card>
              <CardHeader>
                <CardTitle>Değer ve Tarihler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Tahmini Değer
                    </Label>
                    <p className="text-gray-900">
                      {formatCurrency(request.estimatedValue)}
                    </p>
                  </div>
                  {request.actualValue > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Gerçek Değer
                      </Label>
                      <p className="text-gray-900">
                        {formatCurrency(request.actualValue)}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Oluşturulma Tarihi
                    </Label>
                    <p className="text-gray-900">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  {request.updatedAt && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Son Güncellenme
                      </Label>
                      <p className="text-gray-900">
                        {formatDate(request.updatedAt)}
                      </p>
                    </div>
                  )}
                  {request.expectedDelivery && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Beklenen Teslim
                      </Label>
                      <p className="text-gray-900">
                        {formatDate(request.expectedDelivery)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sistem Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle>Sistem Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Oluşturan Kişi
                    </Label>
                    <p className="text-gray-900">
                      {request.createdByName || "Sistem"}
                    </p>
                  </div>
                  {request.createdBy && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Oluşturan ID
                      </Label>
                      <p className="text-gray-900 font-mono text-sm">
                        {request.createdBy}
                      </p>
                    </div>
                  )}
                  {request.updatedByName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Son Güncelleyen
                      </Label>
                      <p className="text-gray-900">{request.updatedByName}</p>
                    </div>
                  )}
                  {request.assignedTo && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Atanan Kişi
                      </Label>
                      <p className="text-gray-900">{request.assignedTo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* İstatistikler */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {request.notes?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Toplam Not</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {request.followUps?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Takip Planı</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {request.documents?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Belge</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {request.updatedAt
                        ? Math.ceil(
                            (new Date() -
                              new Date(
                                request.updatedAt?.seconds
                                  ? request.updatedAt.seconds * 1000
                                  : request.updatedAt
                              )) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Gün Önce Güncellendi
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
              <CardDescription>
                Talep ile ilgili notlar ve yorumlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Yeni not ekle..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {request.notes?.map((note, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {note.author}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))}
                {(!request.notes || request.notes.length === 0) && (
                  <p className="text-gray-500 text-center py-8">
                    Henüz not eklenmemiş.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="follow-ups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Takip Planları</CardTitle>
              <CardDescription>
                Gelecekteki takip planları ve hatırlatmalar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <Label>Takip Türü</Label>
                  <Select
                    value={newFollowUp.type}
                    onValueChange={(value) =>
                      setNewFollowUp((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Telefon Görüşmesi</SelectItem>
                      <SelectItem value="email">E-posta</SelectItem>
                      <SelectItem value="meeting">Toplantı</SelectItem>
                      <SelectItem value="reminder">Hatırlatma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Planlanan Tarih</Label>
                  <Input
                    type="datetime-local"
                    value={newFollowUp.scheduledDate}
                    onChange={(e) =>
                      setNewFollowUp((prev) => ({
                        ...prev,
                        scheduledDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    placeholder="Takip açıklaması..."
                    value={newFollowUp.description}
                    onChange={(e) =>
                      setNewFollowUp((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    onClick={handleAddFollowUp}
                    disabled={!newFollowUp.description.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Takip Ekle
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {request.followUps?.map((followUp, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{followUp.type}</Badge>
                        <span className="font-medium text-gray-900">
                          {followUp.createdByName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(followUp.scheduledDate)}
                      </span>
                    </div>
                    <p className="text-gray-700">{followUp.description}</p>
                  </div>
                ))}
                {(!request.followUps || request.followUps.length === 0) && (
                  <p className="text-gray-500 text-center py-8">
                    Henüz takip planı eklenmemiş.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
