"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Icons
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  Download,
  Phone,
  Mail,
  Building,
  User,
  Users,
  UserPlus,
  MessageSquare,
  RefreshCw,
  Loader2,
  Filter,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const GROUP_LABELS = {
  customer: { label: "Müşteri", color: "bg-green-100 text-green-700" },
  lead: { label: "Potansiyel", color: "bg-blue-100 text-blue-700" },
  supplier: { label: "Tedarikçi", color: "bg-purple-100 text-purple-700" },
  partner: { label: "İş Ortağı", color: "bg-orange-100 text-orange-700" },
  other: { label: "Diğer", color: "bg-gray-100 text-gray-700" },
};

export default function WhatsAppContactsPage() {
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    name: "",
    company: "",
    email: "",
    group: "customer",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (groupFilter !== "all") params.append("group", groupFilter);
      params.append("stats", "true");
      params.append("limit", String(pageSize * 10)); // Load more for client-side pagination

      const response = await fetch(`/api/admin/whatsapp/contacts?${params}`);
      const data = await response.json();

      if (data.success) {
        const allContacts = data.data || [];
        setTotalCount(allContacts.length);
        
        // Client-side pagination
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setContacts(allContacts.slice(startIdx, endIdx));
        
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Hata",
        description: "Kişiler yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, groupFilter, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, groupFilter]);

  // Reset form
  const resetForm = () => {
    setFormData({
      phoneNumber: "",
      name: "",
      company: "",
      email: "",
      group: "customer",
      notes: "",
    });
    setSelectedContact(null);
  };

  // Handle add contact
  const handleAdd = async () => {
    if (!formData.phoneNumber) {
      toast({
        title: "Hata",
        description: "Telefon numarası zorunludur",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/whatsapp/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kişi eklendi",
        });
        setShowAddModal(false);
        resetForm();
        fetchContacts();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kişi eklenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle edit contact
  const handleEdit = async () => {
    if (!selectedContact) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/whatsapp/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedContact.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kişi güncellendi",
        });
        setShowEditModal(false);
        resetForm();
        fetchContacts();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kişi güncellenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete contact
  const handleDelete = async () => {
    if (!selectedContact) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/contacts?id=${selectedContact.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kişi silindi",
        });
        setShowDeleteDialog(false);
        setSelectedContact(null);
        fetchContacts();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kişi silinemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      phoneNumber: contact.phoneNumber || "",
      name: contact.name || "",
      company: contact.company || "",
      email: contact.email || "",
      group: contact.group || "customer",
      notes: contact.notes || "",
    });
    setShowEditModal(true);
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      let date;
      if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp?._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      return format(date, "dd MMM yyyy", { locale: tr });
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Rehberi</h1>
          <p className="text-gray-500 text-sm">
            Kişilerinizi yönetin ve WhatsApp mesajları gönderin
          </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchContacts} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Yenile
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Yeni Kişi
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
                <p className="text-xs text-gray-500">Toplam</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(GROUP_LABELS).map(([key, { label, color }]) => (
          <Card key={key} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", color.split(" ")[0])}>
                  <User className={cn("h-5 w-5", color.split(" ")[1])} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.groups?.[key] || 0}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="İsim, telefon veya şirket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {Object.entries(GROUP_LABELS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Users className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchQuery || groupFilter !== "all"
                  ? "Sonuç bulunamadı"
                  : "Henüz kişi yok"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Yeni kişi eklemek için yukarıdaki butonu kullanın
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kişi</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Şirket</TableHead>
                  <TableHead>Grup</TableHead>
                  <TableHead>Eklenme</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                            {(contact.name || contact.phoneNumber)?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {contact.name || "İsimsiz"}
                          </p>
                          {contact.email && (
                            <p className="text-xs text-gray-500">
                              {contact.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {contact.phoneNumber}
                    </TableCell>
                    <TableCell>{contact.company || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          GROUP_LABELS[contact.group]?.color
                        )}
                      >
                        {GROUP_LABELS[contact.group]?.label || contact.group}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatTime(contact.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditModal(contact)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: Start conversation
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Mesaj Gönder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {!loading && contacts.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{totalCount}</span> kişiden{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>
                -
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                arası gösteriliyor
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Önceki
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    // Show first, last, current, and nearby pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kişi Ekle</DialogTitle>
            <DialogDescription>
              WhatsApp rehberine yeni bir kişi ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Telefon Numarası *</Label>
              <Input
                placeholder="905551234567"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Ülke kodu ile birlikte girin
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>İsim</Label>
                <Input
                  placeholder="Ad Soyad"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Şirket</Label>
                <Input
                  placeholder="Şirket adı"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Grup</Label>
                <Select
                  value={formData.group}
                  onValueChange={(v) => setFormData({ ...formData, group: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GROUP_LABELS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notlar</Label>
              <Textarea
                placeholder="Kişi hakkında notlar..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kişiyi Düzenle</DialogTitle>
            <DialogDescription>Kişi bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Telefon Numarası</Label>
              <Input
                value={formData.phoneNumber}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>İsim</Label>
                <Input
                  placeholder="Ad Soyad"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Şirket</Label>
                <Input
                  placeholder="Şirket adı"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Grup</Label>
                <Select
                  value={formData.group}
                  onValueChange={(v) => setFormData({ ...formData, group: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GROUP_LABELS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notlar</Label>
              <Textarea
                placeholder="Kişi hakkında notlar..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kişiyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedContact?.name || selectedContact?.phoneNumber}</strong>{" "}
              kişisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
