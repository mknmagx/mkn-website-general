"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as socialMediaService from "@/lib/services/social-media-service";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  MoreHorizontal,
  Search,
  Clock,
  FileText,
  Eye,
  Edit2,
  Layers,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/components/admin-route-guard";

// X Icon
const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  facebook: { icon: Facebook, color: "bg-blue-600" },
  x: { icon: XIcon, color: "bg-slate-900" },
  linkedin: { icon: Linkedin, color: "bg-blue-700" },
};

// Stat Card
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// Calendar Set Card
function CalendarSetCard({ set, onOpen, onDelete, canEdit, canDelete }) {
  const platforms = Array.from(new Set(set.events?.map((e) => e.platform).filter(Boolean)));

  return (
    <div
      onClick={() => onOpen(set.id)}
      className="group bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{set.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {set.events?.length || 0} içerik planlandı
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(set.id); }}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Görüntüle
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(set.id); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Düzenle
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(set.id, set.name); }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {set.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{set.description}</p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">{set.events?.length || 0}</span> içerik
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {set.createdAt ? new Date(set.createdAt).toLocaleDateString("tr-TR") : "-"}
          </div>
        </div>

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="flex items-center gap-1.5">
            {platforms.slice(0, 4).map((platform) => {
              const config = PLATFORM_CONFIG[platform];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <div key={platform} className={cn("w-6 h-6 rounded-md flex items-center justify-center", config.color)}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
              );
            })}
            {platforms.length > 4 && (
              <span className="text-xs text-slate-500 ml-1">+{platforms.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600">
          Takvim Seti
        </Badge>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ searchTerm, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <CalendarIcon className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {searchTerm ? "Sonuç bulunamadı" : "Henüz takvim seti yok"}
      </h3>
      <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
        {searchTerm
          ? "Farklı anahtar kelimeler deneyebilirsiniz"
          : "İçerik planlamanızı organize etmek için yeni bir takvim seti oluşturun"}
      </p>
      {!searchTerm && (
        <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Takvim Seti
        </Button>
      )}
    </div>
  );
}

// Main Page
export default function CalendarViewPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [calendarSets, setCalendarSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCalendarSets();
  }, []);

  const fetchCalendarSets = async () => {
    try {
      const plans = await socialMediaService.getCalendarPlans();
      setCalendarSets(plans);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Takvim setleri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => router.push("/admin/social-media/calendar-view/create");
  const handleOpen = (id) => router.push(`/admin/social-media/calendar-view/${id}`);
  
  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" takvim setini silmek istediğinizden emin misiniz?`)) return;
    try {
      await socialMediaService.deleteCalendarPlan(id);
      setCalendarSets(calendarSets.filter((s) => s.id !== id));
      toast.success("Takvim seti silindi");
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredSets = calendarSets.filter((set) =>
    set.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEvents = calendarSets.reduce((acc, set) => acc + (set.events?.length || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İçerik Takvimi</h1>
          <p className="text-sm text-slate-500 mt-1">Sosyal medya içeriklerinizi planlayın</p>
        </div>
        {hasPermission("social_media.create") && (
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Takvim Seti
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Toplam Set" value={calendarSets.length} icon={Layers} color="bg-blue-500" />
        <StatCard label="Planlı İçerik" value={totalEvents} icon={FileText} color="bg-emerald-500" />
        <StatCard
          label="Ortalama İçerik"
          value={calendarSets.length > 0 ? Math.round(totalEvents / calendarSets.length) : 0}
          icon={CalendarIcon}
          color="bg-violet-500"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Takvim seti ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filteredSets.length === 0 ? (
        <EmptyState searchTerm={searchTerm} onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSets.map((set) => (
            <CalendarSetCard
              key={set.id}
              set={set}
              onOpen={handleOpen}
              onDelete={handleDelete}
              canEdit={hasPermission("social_media.edit")}
              canDelete={hasPermission("social_media.delete")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
