"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as socialMediaService from "@/lib/services/social-media-service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Calendar,
  Folder,
  FileText,
  Trash2,
  Edit2,
  MoreHorizontal,
  Instagram,
  Facebook,
  Linkedin,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Stat Card Component
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

// Dataset Card Component
function DatasetCard({ dataset, onOpen, onDelete, canEdit, canDelete }) {
  const platforms = dataset.platforms || [];
  const categories = dataset.categories || [];

  return (
    <div
      onClick={() => onOpen(dataset.id)}
      className="group bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Folder className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{dataset.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {dataset.titleCount || 0} başlık
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(dataset.id); }}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Görüntüle
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(dataset.id); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Düzenle
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(dataset.id, dataset.name); }}
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
        {dataset.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{dataset.description}</p>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
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

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.slice(0, 3).map((cat, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600">
                {cat}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">+{categories.length - 3}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          {dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString("tr-TR") : "-"}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ searchTerm, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <Folder className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {searchTerm ? "Sonuç bulunamadı" : "Henüz dataset yok"}
      </h3>
      <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
        {searchTerm
          ? "Farklı anahtar kelimeler deneyebilirsiniz"
          : "Başlık kütüphanenizi oluşturmak için yeni bir dataset ekleyin"}
      </p>
      {!searchTerm && (
        <Button onClick={onCreate} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Dataset
        </Button>
      )}
    </div>
  );
}

// Main Page Component
export default function TitleLibraryPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await socialMediaService.getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Datasetler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => router.push("/admin/social-media/title-library/create");
  const handleOpen = (id) => router.push(`/admin/social-media/title-library/${id}`);
  
  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" dataset'ini silmek istediğinizden emin misiniz?`)) return;
    try {
      await socialMediaService.deleteDataset(id);
      setDatasets(datasets.filter((d) => d.id !== id));
      toast.success("Dataset silindi");
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredDatasets = datasets.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTitles = datasets.reduce((acc, d) => acc + (d.titleCount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Başlık Kütüphanesi</h1>
          <p className="text-sm text-slate-500 mt-1">Dataset'lerinizi yönetin ve düzenleyin</p>
        </div>
        {hasPermission("social_media.create") && (
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Dataset
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Toplam Dataset" value={datasets.length} icon={Folder} color="bg-violet-500" />
        <StatCard label="Toplam Başlık" value={totalTitles} icon={FileText} color="bg-blue-500" />
        <StatCard
          label="Ortalama Başlık"
          value={datasets.length > 0 ? Math.round(totalTitles / datasets.length) : 0}
          icon={Calendar}
          color="bg-emerald-500"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Dataset ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-10 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredDatasets.length === 0 ? (
        <EmptyState searchTerm={searchTerm} onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
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
