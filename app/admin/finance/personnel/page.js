"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getPersonnelList,
  formatCurrency,
  formatDate,
  getPersonnelStatusLabel,
  getPersonnelStatusColor,
  PERSONNEL_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Users,
  RefreshCw,
  Eye,
  Wallet,
  CreditCard,
  UserCircle,
  Phone,
  Mail,
  Building,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

export default function PersonnelPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (departmentFilter !== "all") filters.department = departmentFilter;
      
      const result = await getPersonnelList(filters);
      if (result.success) {
        setPersonnel(result.data);
      }
    } catch (error) {
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, departmentFilter]);

  // Departman listesi al
  const departments = [...new Set(personnel.map(p => p.department).filter(Boolean))];

  const filteredPersonnel = personnel.filter((item) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.firstName?.toLowerCase().includes(query) ||
        item.lastName?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.position?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Özet hesaplamalar
  const summary = {
    total: personnel.length,
    active: personnel.filter(p => p.status === PERSONNEL_STATUS.ACTIVE).length,
    onLeave: personnel.filter(p => p.status === PERSONNEL_STATUS.ON_LEAVE).length,
    terminated: personnel.filter(p => p.status === PERSONNEL_STATUS.TERMINATED).length,
    totalSalary: personnel
      .filter(p => p.status === PERSONNEL_STATUS.ACTIVE)
      .reduce((acc, p) => {
        if (!acc[p.salaryCurrency]) acc[p.salaryCurrency] = 0;
        acc[p.salaryCurrency] += p.baseSalary || 0;
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
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personel</h1>
          <p className="text-sm text-slate-500 mt-1">
            {personnel.length} personel kaydı
          </p>
        </div>
        <Link href="/admin/finance/personnel/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Personel
          </Button>
        </Link>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Personel</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {summary.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Aktif</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">
                  {summary.active}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">İzinli</p>
                <p className="text-2xl font-bold text-amber-800 mt-1">
                  {summary.onLeave}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Toplam Maaş</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.totalSalary).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-purple-800">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.totalSalary).length === 0 && (
                    <p className="text-lg font-bold text-purple-400">-</p>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
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
                placeholder="İsim, e-posta veya pozisyon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.values(PERSONNEL_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getPersonnelStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {departments.length > 0 && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Departman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Departmanlar</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      {filteredPersonnel.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Personel Bulunamadı</h3>
            <p className="text-sm text-slate-500 mt-1">
              Henüz personel kaydı yok veya arama kriterlerine uygun kayıt bulunamadı
            </p>
            <Link href="/admin/finance/personnel/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                İlk Personeli Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPersonnel.map((person) => (
            <Card key={person.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/admin/finance/personnel/${person.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                        {person.firstName?.[0]}{person.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 hover:text-blue-600 truncate">
                        {person.firstName} {person.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">{person.position || "-"}</p>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/finance/personnel/${person.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detay
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/finance/personnel/${person.id}/salary`)}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Maaş Öde
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/finance/personnel/${person.id}/advance`)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Avans Ver
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/finance/personnel/${person.id}/edit`)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Badge className={cn("text-xs mb-3", getPersonnelStatusColor(person.status))}>
                  {getPersonnelStatusLabel(person.status)}
                </Badge>

                <div className="space-y-2 text-sm">
                  {person.department && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{person.department}</span>
                    </div>
                  )}
                  {person.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Maaş</p>
                    <p className="font-semibold text-slate-900">
                      {person.baseSalary ? formatCurrency(person.baseSalary, person.salaryCurrency || CURRENCY.TRY) : "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Başlangıç</p>
                    <p className="text-sm text-slate-600">
                      {person.startDate ? formatDate(person.startDate) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
