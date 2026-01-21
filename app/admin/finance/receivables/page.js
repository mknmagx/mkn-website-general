"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getReceivables,
  formatCurrency,
  formatDate,
  getReceivableStatusLabel,
  getReceivableStatusColor,
  RECEIVABLE_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function ReceivablesPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      
      const result = await getReceivables(filters);
      if (result.success) {
        setReceivables(result.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const filteredReceivables = receivables.filter((item) => {
    // Currency filter
    if (currencyFilter !== "all" && item.currency !== currencyFilter) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.customerName?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.relatedOrderId?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Özet hesaplamalar
  const calculateSummary = () => {
    const summary = {
      total: {},
      pending: {},
      overdue: {},
      count: {
        total: filteredReceivables.length,
        pending: 0,
        overdue: 0,
        collected: 0,
      },
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredReceivables.forEach((item) => {
      const curr = item.currency;
      const remaining = item.totalAmount - item.paidAmount;
      
      // Total
      if (!summary.total[curr]) summary.total[curr] = 0;
      summary.total[curr] += remaining;

      // Status based
      if (item.status === RECEIVABLE_STATUS.PENDING || item.status === RECEIVABLE_STATUS.PARTIAL) {
        if (!summary.pending[curr]) summary.pending[curr] = 0;
        summary.pending[curr] += remaining;
        summary.count.pending++;
        
        // Check overdue
        if (item.dueDate) {
          const dueDate = item.dueDate.toDate ? item.dueDate.toDate() : new Date(item.dueDate);
          if (dueDate < today) {
            if (!summary.overdue[curr]) summary.overdue[curr] = 0;
            summary.overdue[curr] += remaining;
            summary.count.overdue++;
          }
        }
      } else if (item.status === RECEIVABLE_STATUS.COLLECTED) {
        summary.count.collected++;
      }
    });

    return summary;
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alacaklar</h1>
          <p className="text-sm text-slate-500 mt-1">
            {receivables.length} alacak kaydı
          </p>
        </div>
        <Link href="/admin/finance/receivables/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Alacak
          </Button>
        </Link>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Alacak</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.total).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-slate-900">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.total).length === 0 && (
                    <p className="text-lg font-bold text-slate-400">-</p>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Bekleyen</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.pending).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-amber-800">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.pending).length === 0 && (
                    <p className="text-lg font-bold text-amber-400">-</p>
                  )}
                </div>
                <p className="text-xs text-amber-600 mt-1">{summary.count.pending} kayıt</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Vadesi Geçmiş</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.overdue).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-red-800">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.overdue).length === 0 && (
                    <p className="text-lg font-bold text-red-400">-</p>
                  )}
                </div>
                <p className="text-xs text-red-600 mt-1">{summary.count.overdue} kayıt</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Tahsil Edilen</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">
                  {summary.count.collected}
                </p>
                <p className="text-xs text-emerald-600 mt-1">tamamlanmış</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Müşteri veya açıklama ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.values(RECEIVABLE_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getReceivableStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Para Birimi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {Object.values(CURRENCY).map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-0">
          {filteredReceivables.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowUpRight className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Alacak Bulunamadı</h3>
              <p className="text-sm text-slate-500 mt-1">
                Henüz alacak kaydı yok veya arama kriterlerine uygun kayıt bulunamadı
              </p>
              <Link href="/admin/finance/receivables/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Alacağı Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Müşteri</TableHead>
                  <TableHead className="font-semibold">Açıklama</TableHead>
                  <TableHead className="font-semibold">Vade Tarihi</TableHead>
                  <TableHead className="font-semibold text-right">Toplam</TableHead>
                  <TableHead className="font-semibold text-right">Kalan</TableHead>
                  <TableHead className="font-semibold">İlerleme</TableHead>
                  <TableHead className="font-semibold">Durum</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.map((item) => {
                  const remaining = item.totalAmount - item.paidAmount;
                  const progress = item.totalAmount > 0 
                    ? Math.round((item.paidAmount / item.totalAmount) * 100) 
                    : 0;
                  
                  const isOverdue = item.dueDate && item.status !== RECEIVABLE_STATUS.COLLECTED && (() => {
                    const dueDate = item.dueDate.toDate ? item.dueDate.toDate() : new Date(item.dueDate);
                    return dueDate < new Date();
                  })();

                  return (
                    <TableRow key={item.id} className={cn("hover:bg-slate-50", isOverdue && "bg-red-50/50")}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{item.customerName}</div>
                        {item.relatedOrderId && (
                          <p className="text-xs text-slate-500">Sipariş: {item.relatedOrderId}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[200px]">
                        <p className="line-clamp-1">{item.description || "-"}</p>
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1", isOverdue && "text-red-600")}>
                          {isOverdue && <AlertTriangle className="w-4 h-4" />}
                          <span>{item.dueDate ? formatDate(item.dueDate) : "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalAmount, item.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("font-semibold", remaining > 0 ? "text-amber-600" : "text-emerald-600")}>
                          {formatCurrency(remaining, item.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-slate-500 text-right">{progress}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getReceivableStatusColor(item.status))}>
                          {getReceivableStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/finance/receivables/${item.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detay
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/finance/receivables/${item.id}/payment`)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Tahsilat Ekle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/finance/receivables/${item.id}/edit`)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
