"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  Plus,
  Pencil,
  Trash2,
  MessageSquare,
  Loader2,
  Sparkles,
  Hash,
} from "lucide-react";

import {
  QUICK_REPLY_CATEGORIES,
  getQuickReplyCategoryLabel,
} from "@/lib/services/instagram-dm/schema";

export default function QuickRepliesPage() {
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [quickReplies, setQuickReplies] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    content: "",
    shortcut: "",
    category: QUICK_REPLY_CATEGORIES.OTHER,
  });

  // Fetch quick replies
  const fetchQuickReplies = async () => {
    try {
      setLoading(true);
      const url = categoryFilter === "all"
        ? "/api/admin/instagram-dm/quick-replies"
        : `/api/admin/instagram-dm/quick-replies?category=${categoryFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setQuickReplies(data.data || []);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hazır yanıtlar yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save quick reply
  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Hata",
        description: "Başlık ve içerik zorunludur",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/instagram-dm/quick-replies/${editingId}`
        : "/api/admin/instagram-dm/quick-replies";
      
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: editingId ? "Hazır yanıt güncellendi" : "Hazır yanıt oluşturuldu",
        });
        setDialogOpen(false);
        resetForm();
        fetchQuickReplies();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Kaydedilemedi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete quick reply
  const handleDelete = async (id) => {
    if (!confirm("Bu hazır yanıtı silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/instagram-dm/quick-replies/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Silindi",
          description: "Hazır yanıt silindi",
        });
        fetchQuickReplies();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silinemedi",
        variant: "destructive",
      });
    }
  };

  // Seed defaults
  const handleSeedDefaults = async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Varsayılan yanıtlar eklendi",
        });
        fetchQuickReplies();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Varsayılan yanıtlar eklenemedi",
        variant: "destructive",
      });
    }
  };

  // Edit mode
  const handleEdit = (quickReply) => {
    setEditingId(quickReply.id);
    setForm({
      title: quickReply.title,
      content: quickReply.content,
      shortcut: quickReply.shortcut || "",
      category: quickReply.category,
    });
    setDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      content: "",
      shortcut: "",
      category: QUICK_REPLY_CATEGORIES.OTHER,
    });
  };

  useEffect(() => {
    fetchQuickReplies();
  }, [categoryFilter]);

  const getCategoryColor = (category) => {
    const colors = {
      [QUICK_REPLY_CATEGORIES.GREETING]: "bg-emerald-100 text-emerald-700",
      [QUICK_REPLY_CATEGORIES.PRICING]: "bg-blue-100 text-blue-700",
      [QUICK_REPLY_CATEGORIES.PRODUCT]: "bg-purple-100 text-purple-700",
      [QUICK_REPLY_CATEGORIES.SUPPORT]: "bg-amber-100 text-amber-700",
      [QUICK_REPLY_CATEGORIES.CLOSING]: "bg-gray-100 text-gray-700",
      [QUICK_REPLY_CATEGORIES.OTHER]: "bg-gray-100 text-gray-600",
    };
    return colors[category] || colors[QUICK_REPLY_CATEGORIES.OTHER];
  };

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Hazır Yanıtlar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sık kullanılan mesaj şablonlarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          {quickReplies.length === 0 && !loading && (
            <Button variant="outline" onClick={handleSeedDefaults}>
              <Sparkles className="h-4 w-4 mr-2" />
              Varsayılanları Ekle
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Yanıt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Yanıtı Düzenle" : "Yeni Hazır Yanıt"}
                </DialogTitle>
                <DialogDescription>
                  Hızlı erişim için mesaj şablonu oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    placeholder="Örn: Hoş Geldiniz"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>İçerik</Label>
                  <Textarea
                    placeholder="Mesaj içeriği..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kısayol</Label>
                    <Input
                      placeholder="/hosgeldin"
                      value={form.shortcut}
                      onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm({ ...form, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(QUICK_REPLY_CATEGORIES).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {getQuickReplyCategoryLabel(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? "Güncelle" : "Oluştur"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={categoryFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("all")}
        >
          Tümü
        </Button>
        {Object.values(QUICK_REPLY_CATEGORIES).map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(cat)}
          >
            {getQuickReplyCategoryLabel(cat)}
          </Button>
        ))}
      </div>

      {/* Quick Replies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quickReplies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Henüz hazır yanıt yok</p>
            <Button variant="outline" size="sm" onClick={handleSeedDefaults}>
              <Sparkles className="h-4 w-4 mr-2" />
              Varsayılanları Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickReplies.map((qr) => (
            <Card key={qr.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{qr.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn("text-xs", getCategoryColor(qr.category))}>
                        {getQuickReplyCategoryLabel(qr.category)}
                      </Badge>
                      {qr.shortcut && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {qr.shortcut}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(qr)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(qr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">
                  {qr.content}
                </p>
                {qr.usageCount > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {qr.usageCount} kez kullanıldı
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
