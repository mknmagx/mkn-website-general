"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import {
  formatCurrency,
  formatDate,
  getAdvanceStatusLabel,
  getAdvanceStatusColor,
  ADVANCE_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  Plus,
  Search,
  MoreHorizontal,
  CreditCard,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export default function AdvancesPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "finance_advances"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      let advanceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtreleme
      if (statusFilter !== "all") {
        advanceData = advanceData.filter(a => a.status === statusFilter);
      }

      setAdvances(advanceData);
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

  const filteredAdvances = advances.filter((item) => {
    // Currency filter
    if (currencyFilter !== "all" && item.currency !== currencyFilter) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.personnelName?.toLowerCase().includes(query) ||
        item.reason?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Özet hesaplamalar
  const summary = {
    total: filteredAdvances.length,
    pending: filteredAdvances.filter(a => a.status === ADVANCE_STATUS.PENDING).length,
    approved: filteredAdvances.filter(a => a.status === ADVANCE_STATUS.APPROVED).length,
    paid: filteredAdvances.filter(a => a.status === ADVANCE_STATUS.PAID).length,
    totalAmount: filteredAdvances.reduce((acc, a) => {
      if (!acc[a.currency]) acc[a.currency] = 0;
      acc[a.currency] += a.amount || 0;
      return acc;
    }, {}),
    outstandingAmount: filteredAdvances
      .filter(a => a.status === ADVANCE_STATUS.PAID && (a.remainingAmount || 0) > 0)
      .reduce((acc, a) => {
        if (!acc[a.currency]) acc[a.currency] = 0;
        acc[a.currency] += a.remainingAmount || 0;
        return acc;
      }, {}),
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Avanslar</h1>
          <p className="text-sm text-slate-500 mt-1">
            {advances.length} avans kaydı
          </p>
        </div>
        <Link href="/admin/finance/advances/new">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Avans
          </Button>
        </Link>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Avans</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.totalAmount).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-slate-900">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.totalAmount).length === 0 && (
                    <p className="text-lg font-bold text-slate-400">-</p>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Onay Bekleyen</p>
                <p className="text-2xl font-bold text-amber-800 mt-1">
                  {summary.pending}
                </p>
                <p className="text-xs text-amber-600 mt-1">talep</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Onaylanan</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {summary.approved}
                </p>
                <p className="text-xs text-blue-600 mt-1">ödeme bekliyor</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Kalan Bakiye</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.outstandingAmount).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-orange-800">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.outstandingAmount).length === 0 && (
                    <p className="text-lg font-bold text-orange-400">-</p>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
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
                placeholder="Personel veya açıklama ara..."
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
                {Object.values(ADVANCE_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getAdvanceStatusLabel(status)}
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
          {filteredAdvances.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Avans Kaydı Bulunamadı</h3>
              <p className="text-sm text-slate-500 mt-1">
                Henüz avans kaydı yok veya arama kriterlerine uygun kayıt bulunamadı
              </p>
              <Link href="/admin/finance/advances/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Avans Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Personel</TableHead>
                  <TableHead className="font-semibold">Talep Tarihi</TableHead>
                  <TableHead className="font-semibold">Sebep</TableHead>
                  <TableHead className="font-semibold text-right">Tutar</TableHead>
                  <TableHead className="font-semibold text-right">Kalan</TableHead>
                  <TableHead className="font-semibold">İade Durumu</TableHead>
                  <TableHead className="font-semibold">Durum</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.map((advance) => {
                  const remaining = advance.remainingAmount || advance.amount;
                  const repaidAmount = advance.amount - remaining;
                  const progress = advance.amount > 0 
                    ? Math.round((repaidAmount / advance.amount) * 100) 
                    : 0;

                  return (
                    <TableRow key={advance.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-600" />
                          </div>
                          <span className="font-medium text-slate-900">{advance.personnelName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {advance.requestDate ? formatDate(advance.requestDate) : formatDate(advance.createdAt)}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[200px]">
                        <p className="line-clamp-1">{advance.reason || "-"}</p>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(advance.amount, advance.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("font-semibold", remaining > 0 ? "text-orange-600" : "text-emerald-600")}>
                          {formatCurrency(remaining, advance.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {advance.status === ADVANCE_STATUS.PAID ? (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-slate-500 text-right">{progress}% iade edildi</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getAdvanceStatusColor(advance.status))}>
                          {getAdvanceStatusLabel(advance.status)}
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
                              onClick={() => router.push(`/admin/finance/advances/${advance.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detay
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
