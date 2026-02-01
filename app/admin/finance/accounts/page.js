"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAccounts,
  deleteAccount,
  formatCurrency,
  getAccountTypeLabel,
  getAccountTypeIcon,
  getAccountTypeColor,
  getCurrencyLabel,
  getCurrencySymbol,
  ACCOUNT_TYPE,
  ACCOUNT_MODE,
  CURRENCY,
} from "@/lib/services/finance";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wallet,
  Building2,
  CreditCard,
  Smartphone,
  FileText,
  ScrollText,
  Globe,
  Star,
  RefreshCw,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const iconMap = {
  Wallet,
  Building2,
  CreditCard,
  Smartphone,
  FileText,
  ScrollText,
  Globe,
};

export default function AccountsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (typeFilter !== "all") filters.type = typeFilter;
      if (currencyFilter !== "all") filters.currency = currencyFilter;
      
      const result = await getAccounts(filters);
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error) {
      toast.error("Hesaplar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [typeFilter, currencyFilter]);

  const handleDelete = async () => {
    if (!deleteDialog.account) return;
    
    try {
      const result = await deleteAccount(deleteDialog.account.id, user?.uid);
      if (result.success) {
        toast.success("Hesap silindi");
        loadAccounts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteDialog({ open: false, account: null });
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        account.name?.toLowerCase().includes(query) ||
        account.bankName?.toLowerCase().includes(query) ||
        account.iban?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalBalances = filteredAccounts.reduce((acc, account) => {
    // Multi-currency hesapları için balances objesini kullan
    if (account.balances) {
      Object.entries(account.balances).forEach(([currency, balance]) => {
        if (balance) {
          if (!acc[currency]) acc[currency] = 0;
          acc[currency] += balance;
        }
      });
    } else {
      // Eski tek dövizli hesaplar için currentBalance kullan
      const currency = account.currency || CURRENCY.TRY;
      if (!acc[currency]) acc[currency] = 0;
      acc[currency] += account.currentBalance || 0;
    }
    return acc;
  }, {});

  // Sıfır bakiyeleri temizle
  Object.keys(totalBalances).forEach(key => {
    if (totalBalances[key] === 0) delete totalBalances[key];
  });

  const AccountIcon = ({ type }) => {
    const iconName = getAccountTypeIcon(type);
    const Icon = iconMap[iconName] || Wallet;
    return <Icon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hesaplar</h1>
          <p className="text-sm text-slate-500 mt-1">
            {accounts.length} hesap tanımlı
          </p>
        </div>
        <Link href="/admin/finance/accounts/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Hesap
          </Button>
        </Link>
      </div>

      {/* Toplam Bakiyeler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(totalBalances).map(([currency, balance]) => (
          <Card key={currency} className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{getCurrencyLabel(currency)}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(balance, currency)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtreler */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Hesap ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hesap Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {Object.values(ACCOUNT_TYPE).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getAccountTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Para Birimi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Para Birimleri</SelectItem>
                {Object.values(CURRENCY).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {getCurrencyLabel(currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAccounts}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hesap Listesi */}
      {filteredAccounts.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Hesap Bulunamadı</h3>
            <p className="text-sm text-slate-500 mt-1">
              Henüz hesap tanımlanmamış veya arama kriterlerine uygun hesap yok
            </p>
            <Link href="/admin/finance/accounts/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                İlk Hesabı Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAccounts.map((account) => (
            <Card 
              key={account.id} 
              className="bg-white border-slate-200 hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Link href={`/admin/finance/accounts/${account.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      getAccountTypeColor(account.type)
                    )}>
                      <AccountIcon type={account.type} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 hover:text-blue-600 truncate">{account.name}</h3>
                        {account.isDefault && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">
                          {getAccountTypeLabel(account.type)}
                        </p>
                        {account.mode === ACCOUNT_MODE.MULTI && (
                          <Badge variant="outline" className="text-xs py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">
                            <Globe className="w-3 h-3 mr-1" />
                            Çoklu Döviz
                          </Badge>
                        )}
                      </div>
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
                        onClick={() => router.push(`/admin/finance/accounts/${account.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Detay
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/finance/accounts/${account.id}/edit`)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteDialog({ open: true, account })}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {/* Multi-currency hesaplar için tüm bakiyeleri göster */}
                  {account.mode === ACCOUNT_MODE.MULTI && account.balances ? (
                    <div className="space-y-2">
                      {Object.entries(account.balances)
                        .filter(([_, balance]) => balance !== 0)
                        .map(([currency, balance]) => (
                          <div key={currency} className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{getCurrencyLabel(currency)}</span>
                            <span className={cn(
                              "text-sm font-semibold",
                              balance >= 0 ? "text-slate-900" : "text-red-600"
                            )}>
                              {formatCurrency(balance, currency)}
                            </span>
                          </div>
                        ))}
                      {Object.values(account.balances).every(b => b === 0) && (
                        <p className="text-sm text-slate-400">Bakiye yok</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(account.currentBalance, account.currency)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Güncel Bakiye
                      </p>
                    </>
                  )}
                </div>

                {account.bankName && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600">{account.bankName}</p>
                    {account.iban && (
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {account.iban}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getCurrencyLabel(account.currency)}
                  </Badge>
                  {account.mode === ACCOUNT_MODE.MULTI && account.supportedCurrencies?.length > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      +{account.supportedCurrencies.length - 1} döviz
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Silme Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteDialog.account?.name}</strong> hesabını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
