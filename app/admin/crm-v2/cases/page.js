"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  getPipelineCases,
  updateCase,
  getCaseStatistics,
} from "../../../../lib/services/crm-v2";
import { getCustomer } from "../../../../lib/services/crm-v2/customer-service";
import {
  CASE_STATUS,
  CASE_TYPE,
  PRIORITY,
  CASE_PIPELINE_ORDER,
  getCaseStatusLabel,
  getCaseStatusColor,
  getCaseTypeLabel,
  getPriorityLabel,
  getPriorityColor,
} from "../../../../lib/services/crm-v2/schema";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../lib/utils";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

// Icons
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Briefcase,
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  LayoutGrid,
  List,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Simple Case Card for Kanban
function CaseCard({ caseItem, onClick }) {
  return (
    <div
      id={`case-${caseItem.id}`}
      className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
      onClick={onClick}
    >
      <h4 className="font-medium text-sm text-slate-900 line-clamp-2">{caseItem.title}</h4>
      
      {caseItem.customer && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-500">
          <span className="font-medium">{caseItem.customer.name}</span>
          {caseItem.customer.companyName && (
            <span className="text-slate-400">• {caseItem.customer.companyName}</span>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
          {getCaseTypeLabel(caseItem.type)}
        </Badge>
        <Badge variant="outline" className={cn("text-xs", getPriorityColor(caseItem.priority))}>
          {getPriorityLabel(caseItem.priority)}
        </Badge>
      </div>

      {(caseItem.financials?.quotedValue || caseItem.financials?.estimatedValue) > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
          <DollarSign className="h-3 w-3" />
          <span className="font-medium">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: caseItem.financials?.currency || "TRY",
              minimumFractionDigits: 0,
            }).format(caseItem.financials?.quotedValue || caseItem.financials?.estimatedValue || 0)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
        <Clock className="h-3 w-3" />
        {caseItem.updatedAt && formatDistanceToNow(caseItem.updatedAt.toDate(), { addSuffix: true, locale: tr })}
      </div>
    </div>
  );
}

// Pipeline Column
function PipelineColumn({ status, cases, onCaseClick }) {
  const totalValue = cases.reduce(
    (sum, c) => sum + (c.financials?.quotedValue || c.financials?.estimatedValue || 0),
    0
  );

  return (
    <div className="flex-1 min-w-[260px] max-w-[300px] flex flex-col">
      {/* Column Header */}
      <div className="bg-white rounded-t-lg border border-slate-200 border-b-0 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2.5 h-2.5 rounded-full", getCaseStatusColor(status))} />
            <h3 className="font-semibold text-slate-900 text-sm">{getCaseStatusLabel(status)}</h3>
          </div>
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
            {cases.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-slate-500 mt-1.5">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
              minimumFractionDigits: 0,
            }).format(totalValue)}
          </p>
        )}
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-slate-50 rounded-b-lg border border-slate-200 border-t-0 p-2 overflow-y-auto max-h-[calc(100vh-320px)]">
        <div className="space-y-2">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} onClick={() => onCaseClick(caseItem)} />
          ))}
        </div>

        {cases.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Briefcase className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Talep yok</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Session storage key for scroll restoration
const STORAGE_KEY_LAST_CASE = 'cases_last_viewed';

export default function CasesPipelinePage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  
  // Refs for scroll restoration
  const isRestoredRef = useRef(false);

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pipeline, setPipeline] = useState({});
  const [allCases, setAllCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("board");

  // Data fetching
  const loadData = useCallback(async () => {
    try {
      const [pipelineData, statsData] = await Promise.all([
        getPipelineCases({
          type: typeFilter === "all" ? null : typeFilter,
          searchTerm,
          includeClosedStatuses: true,
        }),
        getCaseStatistics(),
      ]);

      // Fetch customer data for each case
      const casesWithCustomers = await Promise.all(
        pipelineData.all.map(async (caseItem) => {
          if (caseItem.customerId) {
            try {
              const customer = await getCustomer(caseItem.customerId);
              return { ...caseItem, customer };
            } catch (error) {
              console.error(`Error fetching customer ${caseItem.customerId}:`, error);
              return caseItem;
            }
          }
          return caseItem;
        })
      );

      // Rebuild pipeline with customer data
      const pipelineWithCustomers = {};
      Object.keys(pipelineData.pipeline).forEach((status) => {
        pipelineWithCustomers[status] = pipelineData.pipeline[status].map((caseItem) => {
          const caseWithCustomer = casesWithCustomers.find((c) => c.id === caseItem.id);
          return caseWithCustomer || caseItem;
        });
      });

      setPipeline(pipelineWithCustomers);
      setAllCases(casesWithCustomers);
      setStats(statsData);
      
      // Restore scroll to last viewed case
      if (!isRestoredRef.current) {
        isRestoredRef.current = true;
        const lastCaseId = sessionStorage.getItem(STORAGE_KEY_LAST_CASE);
        if (lastCaseId) {
          setTimeout(() => {
            const element = document.getElementById(`case-${lastCaseId}`);
            if (element) {
              element.scrollIntoView({ block: 'center', behavior: 'instant' });
              // Highlight briefly
              element.classList.add('ring-2', 'ring-blue-400');
              setTimeout(() => element.classList.remove('ring-2', 'ring-blue-400'), 1500);
            }
          }, 150);
        }
      }
    } catch (error) {
      console.error("Error loading pipeline:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, searchTerm, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCaseClick = (caseItem) => {
    sessionStorage.setItem(STORAGE_KEY_LAST_CASE, caseItem.id);
    router.push(`/admin/crm-v2/cases/${caseItem.id}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <Skeleton className="h-16 bg-slate-200" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-slate-200" />
          ))}
        </div>
        <Skeleton className="h-96 bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Talep ve iş süreçlerinizi yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("board")}
              className={cn(
                "h-8 px-3",
                viewMode === "board" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3",
                viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-slate-200">
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Yenile
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/admin/crm-v2/cases/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Talep
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Toplam Talep</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">{stats?.open || 0} açık talep</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pipeline Değeri</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.pipelineValue)}</div>
            <p className="text-xs text-slate-500 mt-1">Açık taleplerin toplam değeri</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Kazanılan</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.wonValue)}</div>
            <p className="text-xs text-slate-500 mt-1">{stats?.byStatus?.[CASE_STATUS.WON] || 0} talep kazanıldı</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Dönüşüm Oranı</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.conversionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-slate-500 mt-1">Başarılı kapanış oranı</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Talep ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 border-slate-200">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Türler</SelectItem>
            {Object.values(CASE_TYPE).map((type) => (
              <SelectItem key={type} value={type}>
                {getCaseTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board View */}
      {viewMode === "board" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {CASE_PIPELINE_ORDER.map((status) => (
              <PipelineColumn
                key={status}
                status={status}
                cases={pipeline[status] || []}
                onCaseClick={handleCaseClick}
              />
            ))}
            {/* On Hold Column */}
            <PipelineColumn
              status={CASE_STATUS.ON_HOLD}
              cases={pipeline[CASE_STATUS.ON_HOLD] || []}
              onCaseClick={handleCaseClick}
            />
          </div>
        </div>
      ) : (
        /* List View */
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-700 font-semibold">Talep</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Müşteri</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Tür</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Durum</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Öncelik</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Değer</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Güncelleme</TableHead>
                  <TableHead className="text-right text-slate-700 font-semibold">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Talep bulunamadı</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  allCases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id}
                      id={`case-${caseItem.id}`}
                      className="cursor-pointer hover:bg-slate-50 transition-colors border-slate-100"
                      onClick={() => handleCaseClick(caseItem)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{caseItem.title}</p>
                          {caseItem.caseNumber && (
                            <p className="text-xs text-slate-500">#{caseItem.caseNumber}</p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {caseItem.customer ? (
                          <div>
                            <p className="text-sm font-medium text-slate-900">{caseItem.customer.name}</p>
                            {caseItem.customer.companyName && (
                              <p className="text-xs text-slate-500">{caseItem.customer.companyName}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="border-slate-200 text-slate-600">
                          {getCaseTypeLabel(caseItem.type)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getCaseStatusColor(caseItem.status))} />
                          <span className="text-sm text-slate-700">{getCaseStatusLabel(caseItem.status)}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(caseItem.priority)}>
                          {getPriorityLabel(caseItem.priority)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {(caseItem.financials?.quotedValue || caseItem.financials?.estimatedValue) > 0 ? (
                          <span className="font-medium text-slate-900">
                            {formatCurrency(caseItem.financials?.quotedValue || caseItem.financials?.estimatedValue)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {caseItem.updatedAt ? (
                          <span className="text-sm text-slate-500">
                            {formatDistanceToNow(caseItem.updatedAt.toDate(), { addSuffix: true, locale: tr })}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/crm-v2/cases/${caseItem.id}`);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/crm-v2/cases/${caseItem.id}/edit`);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Closed Cases Summary */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-slate-600">Kazanılan:</span>
                <span className="font-semibold text-slate-900">{stats?.byStatus?.[CASE_STATUS.WON] || 0}</span>
                <span className="text-slate-500">({formatCurrency(stats?.wonValue)})</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-slate-600">Kaybedilen:</span>
                <span className="font-semibold text-slate-900">{stats?.byStatus?.[CASE_STATUS.LOST] || 0}</span>
                <span className="text-slate-500">({formatCurrency(stats?.lostValue)})</span>
              </div>
            </div>
            <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-700">
              Kapalı Talepleri Gör
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
