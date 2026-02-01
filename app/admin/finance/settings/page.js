"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getFinanceStats,
  clearAllFinanceData,
  clearFinanceCollection,
  getFinanceCollections,
} from "@/lib/services/finance";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  FileText,
  Users,
  Wallet,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Banknote,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Koleksiyon bilgileri
const COLLECTION_INFO = {
  finance_accounts: {
    label: "Hesaplar",
    icon: Wallet,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  finance_transactions: {
    label: "İşlemler",
    icon: ArrowRightLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  finance_receivables: {
    label: "Alacaklar",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  finance_payables: {
    label: "Borçlar",
    icon: TrendingDown,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  finance_personnel: {
    label: "Personel",
    icon: Users,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  finance_salaries: {
    label: "Maaşlar",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  finance_advances: {
    label: "Avanslar",
    icon: Banknote,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  finance_exchange_rates: {
    label: "Döviz Kurları",
    icon: BarChart3,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  finance_exchange_cache: {
    label: "Kur Önbelleği",
    icon: Database,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
};

export default function FinanceSettingsPage() {
  const { user } = useAdminAuth();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [clearingCollection, setClearingCollection] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await getFinanceStats();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error("İstatistikler yüklenirken hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Tek koleksiyon temizle
  const handleClearCollection = async (collectionName) => {
    setClearingCollection(collectionName);
    try {
      const result = await clearFinanceCollection(collectionName);
      if (result.success) {
        toast.success(`${COLLECTION_INFO[collectionName]?.label || collectionName} temizlendi (${result.deleted} kayıt)`);
        await loadStats();
      } else {
        toast.error(result.error || "Temizleme başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setClearingCollection(null);
    }
  };

  // Tüm verileri temizle
  const handleClearAll = async () => {
    if (confirmText !== "TÜM VERİLERİ SİL") {
      toast.error("Lütfen onay metnini doğru girin");
      return;
    }

    setClearing(true);
    setDialogOpen(false);
    
    try {
      const result = await clearAllFinanceData();
      if (result.success) {
        toast.success(result.message || "Tüm finans verileri temizlendi");
        await loadStats();
      } else {
        toast.error(result.error || "Temizleme sırasında hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setClearing(false);
      setConfirmText("");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Finans Ayarları
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Finans modülü veri yönetimi ve bakım işlemleri
          </p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Toplam Koleksiyon</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.collectionCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Toplam Kayıt</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.totalDocuments?.toLocaleString('tr-TR') || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Durum</p>
                <p className="text-lg font-bold text-emerald-600">
                  Aktif
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Koleksiyon Detayları */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-600" />
            Koleksiyon Detayları
          </CardTitle>
          <CardDescription>Her koleksiyondaki kayıt sayısı ve yönetim</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Koleksiyon</TableHead>
                <TableHead className="text-right">Kayıt Sayısı</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.collections && Object.entries(stats.collections).map(([name, count]) => {
                const info = COLLECTION_INFO[name] || {
                  label: name,
                  icon: Database,
                  color: "text-slate-600",
                  bgColor: "bg-slate-100",
                };
                const Icon = info.icon;
                const isClearing = clearingCollection === name;

                return (
                  <TableRow key={name} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${info.bgColor} rounded-lg`}>
                          <Icon className={`w-4 h-4 ${info.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{info.label}</p>
                          <p className="text-xs text-slate-400">{name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={count > 0 ? "default" : "secondary"}>
                        {count.toLocaleString('tr-TR')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={count === 0 || isClearing || clearing}
                          >
                            {isClearing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                              Koleksiyonu Temizle
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{info.label}</strong> koleksiyonundaki tüm veriler ({count} kayıt) silinecek.
                              <br /><br />
                              <span className="text-red-600 font-medium">
                                Bu işlem geri alınamaz!
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleClearCollection(name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Temizle
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tehlikeli İşlemler */}
      <Card className="bg-white border-red-200 border-2">
        <CardHeader className="border-b border-red-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Tehlikeli İşlemler
          </CardTitle>
          <CardDescription className="text-red-600">
            Bu işlemler geri alınamaz. Dikkatli olun!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Tüm Finans Verilerini Sil</h3>
                <p className="text-sm text-red-700 mt-1">
                  Hesaplar, işlemler, alacaklar, borçlar, personel, maaşlar, avanslar ve döviz kurları dahil tüm finans verileri kalıcı olarak silinecektir.
                </p>
                <div className="mt-4">
                  <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={clearing || stats?.totalDocuments === 0}
                      >
                        {clearing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Siliniyor...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Tüm Verileri Temizle
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-6 h-6" />
                          TÜM VERİLER SİLİNECEK!
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-4">
                            <p>
                              Bu işlem <strong>{stats?.totalDocuments?.toLocaleString('tr-TR')}</strong> kayıt içeren <strong>{stats?.collectionCount}</strong> koleksiyonu tamamen temizleyecektir.
                            </p>
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-amber-800 text-sm font-medium">
                                ⚠️ Bu işlem geri alınamaz!
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm" className="text-slate-700">
                                Onaylamak için <strong className="text-red-600">TÜM VERİLERİ SİL</strong> yazın:
                              </Label>
                              <Input
                                id="confirm"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="TÜM VERİLERİ SİL"
                                className="border-red-300 focus:border-red-500"
                              />
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmText("")}>
                          İptal
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleClearAll}
                          disabled={confirmText !== "TÜM VERİLERİ SİL"}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Kalıcı Olarak Sil
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>

          {stats?.totalDocuments === 0 && (
            <div className="flex items-center gap-2 text-emerald-600 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Finans veritabanı boş, silinecek veri yok.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
