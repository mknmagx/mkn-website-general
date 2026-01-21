"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  getAllCustomers,
  getCustomerStatistics,
  deleteCustomer,
  updateCustomerTags,
} from "../../../../lib/services/crm-v2";
import {
  CUSTOMER_TYPE,
  PRIORITY,
  getCustomerTypeLabel,
  getCustomerTypeColor,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

// Icons
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Users,
  Building2,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  MessageSquare,
  UserPlus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Session storage key for scroll restoration
const STORAGE_KEY_LAST_CUSTOMER = 'customers_last_viewed';

export default function CustomersPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  
  // Refs for scroll restoration
  const isRestoredRef = useRef(false);

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]); // All customers for filtering
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Data fetching - Fetch ALL customers once
  const loadData = useCallback(async () => {
    try {
      const [customersData, statsData] = await Promise.all([
        getAllCustomers({
          sortBy: 'createdAt',
          sortDirection: 'desc',
          limitCount: 0, // Get all customers
        }),
        getCustomerStatistics(),
      ]);

      setAllCustomers(customersData);
      setStats(statsData);
      
      // Restore scroll to last viewed customer
      if (!isRestoredRef.current) {
        isRestoredRef.current = true;
        const lastCustomerId = sessionStorage.getItem(STORAGE_KEY_LAST_CUSTOMER);
        if (lastCustomerId) {
          // Find the page containing this customer
          const customerIndex = customersData.findIndex(c => c.id === lastCustomerId);
          if (customerIndex !== -1) {
            const targetPage = Math.floor(customerIndex / itemsPerPage) + 1;
            setCurrentPage(targetPage);
          }
          setTimeout(() => {
            const element = document.getElementById(`customer-${lastCustomerId}`);
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
      console.error("Error loading customers:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [itemsPerPage, toast]);

  // Client-side filtering and pagination
  const filteredCustomers = useCallback(() => {
    let result = [...allCustomers];
    
    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(c => c.type === typeFilter);
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.company?.name?.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [allCustomers, typeFilter, searchTerm]);

  // Get paginated customers
  const paginatedCustomers = useCallback(() => {
    const filtered = filteredCustomers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredCustomers().length / itemsPerPage);
  const totalFiltered = filteredCustomers().length;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchTerm]);

  // Update displayed customers when pagination or filters change
  useEffect(() => {
    setCustomers(paginatedCustomers());
  }, [paginatedCustomers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteDialog.customer) return;

    try {
      await deleteCustomer(deleteDialog.customer.id);
      toast({ title: "Başarılı", description: "Müşteri silindi." });
      setDeleteDialog({ open: false, customer: null });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Müşteri silinemedi.",
        variant: "destructive",
      });
    }
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
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-muted-foreground">
            Tüm müşteri profilleri ve etkileşim geçmişi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Yenile
          </Button>
          <Button asChild>
            <Link href="/admin/crm-v2/customers/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Yeni Müşteri
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Toplam
                </CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats?.total || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Aktif Müşteri
                </CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stats?.byType?.[CUSTOMER_TYPE.CUSTOMER] || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Potansiyel
                </CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {(stats?.byType?.[CUSTOMER_TYPE.LEAD] || 0) +
                    (stats?.byType?.[CUSTOMER_TYPE.PROSPECT] || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Toplam Değer
                </CardTitle>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalValue)}</div>
              </CardContent>
            </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="İsim, e-posta veya şirket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 border-slate-300">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {Object.values(CUSTOMER_TYPE).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getCustomerTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="text-slate-700 font-semibold">Müşteri</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Şirket</TableHead>
                    <TableHead className="text-slate-700 font-semibold">İletişim</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Tür</TableHead>
                    <TableHead className="text-slate-700 font-semibold">İstatistikler</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Son Aktivite</TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Müşteri bulunamadı</p>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    id={`customer-${customer.id}`}
                    className="cursor-pointer hover:bg-slate-50 transition-colors border-slate-100"
                    onClick={() => {
                      sessionStorage.setItem(STORAGE_KEY_LAST_CUSTOMER, customer.id);
                      router.push(`/admin/crm-v2/customers/${customer.id}`);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {(customer.name || "?").substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{customer.name || "İsimsiz"}</p>
                          {customer.tags?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {customer.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-slate-300 text-slate-600">
                                  {tag}
                                </Badge>
                              ))}
                              {customer.tags.length > 2 && (
                                <span className="text-xs text-slate-500">
                                  +{customer.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {customer.company?.name ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>{customer.company.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[180px]">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {!customer.email && !customer.phone && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={cn("border-slate-300", getCustomerTypeColor(customer.type))}>
                        {getCustomerTypeLabel(customer.type)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-slate-400" />
                          <span className="font-medium text-slate-900">{customer.stats?.totalConversations || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-slate-400" />
                          <span className="font-medium text-slate-900">{customer.stats?.totalCases || 0}</span>
                        </span>
                        {customer.stats?.totalValue > 0 && (
                          <span className="font-medium text-green-600">
                            {formatCurrency(customer.stats.totalValue)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {customer.stats?.lastContactAt ? (
                        <span className="text-sm text-slate-500">
                          {formatDistanceToNow(customer.stats.lastContactAt.toDate(), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
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
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/crm-v2/customers/${customer.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/crm-v2/customers/${customer.id}/edit`);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, customer });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
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

      {/* Pagination */}
      {totalFiltered > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600">
              Toplam <span className="font-semibold">{totalFiltered}</span> müşteri
              {allCustomers.length !== totalFiltered && (
                <span className="text-slate-400"> (tümü: {allCustomers.length})</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sayfa başına:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">
              Sayfa <span className="font-semibold">{currentPage}</span> / {totalPages}
            </p>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      currentPage === pageNum
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border-slate-300"
                    )}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-300"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              {deleteDialog.customer?.name || "Bu müşteri"} silinecek. Bu işlem
              geri alınamaz. Müşteriye ait konuşmalar ve talepler varsa silme
              işlemi başarısız olacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-slate-700 hover:bg-slate-50">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
