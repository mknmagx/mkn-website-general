"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAccounts,
  getTransactions,
  createExchangeTransaction,
  formatCurrency,
  formatDate,
  CURRENCY,
  ALL_CURRENCIES,
  getCurrencyLabel,
  getCurrencySymbol,
  ACCOUNT_MODE,
  TRANSACTION_TYPE,
} from "@/lib/services/finance";
import {
  RefreshCcw,
  RefreshCw,
  Info,
  Wallet,
  History,
  CheckCircle2,
  Globe,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Döviz kuru API'den çek
const fetchExchangeRate = async (from, to) => {
  try {
    if (from === to) return { rate: 1, source: "same" };
    
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    );
    
    if (!response.ok) throw new Error("Kur alınamadı");
    
    const data = await response.json();
    const rate = data.rates[to];
    
    if (!rate) throw new Error("Kur bulunamadı");
    
    return { rate, source: "api", date: data.date };
  } catch (error) {
    return { rate: null, source: "error", error: error.message };
  }
};

export default function ExchangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [recentExchanges, setRecentExchanges] = useState([]);
  const [rateSource, setRateSource] = useState(null);
  
  const [formData, setFormData] = useState({
    accountId: "",
    fromCurrency: CURRENCY.USD,
    toCurrency: CURRENCY.TRY,
    fromAmount: "",
    toAmount: "",
    exchangeRate: "",
    description: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [accResult, txResult] = await Promise.all([
        getAccounts({ isActive: true }),
        getTransactions({ type: TRANSACTION_TYPE.EXCHANGE, limit: 10 }),
      ]);
      
      if (accResult.success) {
        // Sadece multi-currency hesapları filtrele
        const multiAccounts = accResult.data.filter(a => a.mode === ACCOUNT_MODE.MULTI);
        setAccounts(multiAccounts);
        
        // URL'den accountId varsa seç
        const urlAccountId = searchParams.get("accountId");
        if (urlAccountId && multiAccounts.find(a => a.id === urlAccountId)) {
          setFormData(prev => ({ ...prev, accountId: urlAccountId }));
        } else if (multiAccounts.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: multiAccounts[0].id }));
        }
      }
      if (txResult.success) setRecentExchanges(txResult.data);
    } catch (error) {
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedAccount = accounts.find(a => a.id === formData.accountId);
  const supportedCurrencies = selectedAccount?.supportedCurrencies || ALL_CURRENCIES;

  // Hesap bakiyeleri
  const getBalance = (currency) => {
    if (!selectedAccount) return 0;
    return selectedAccount.balances?.[currency] || 0;
  };

  const handleFetchRate = async () => {
    if (formData.fromCurrency === formData.toCurrency) {
      toast.error("Kaynak ve hedef döviz aynı olamaz");
      return;
    }
    
    setFetchingRate(true);
    const result = await fetchExchangeRate(formData.fromCurrency, formData.toCurrency);
    setFetchingRate(false);
    
    if (result.rate) {
      setFormData(prev => ({ ...prev, exchangeRate: result.rate.toFixed(4) }));
      setRateSource(result);
      toast.success(`Güncel kur: 1 ${formData.fromCurrency} = ${result.rate.toFixed(4)} ${formData.toCurrency}`);
    } else {
      toast.error("Kur alınamadı. Manuel girin.");
    }
  };

  // Döviz değiştiğinde kur çek
  useEffect(() => {
    if (formData.fromCurrency && formData.toCurrency && formData.fromCurrency !== formData.toCurrency) {
      handleFetchRate();
    }
  }, [formData.fromCurrency, formData.toCurrency]);

  // Hedef tutarı hesapla
  useEffect(() => {
    if (formData.fromAmount && formData.exchangeRate) {
      const amount = parseFloat(formData.fromAmount) || 0;
      const rate = parseFloat(formData.exchangeRate) || 0;
      setFormData(prev => ({ ...prev, toAmount: (amount * rate).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, toAmount: "" }));
    }
  }, [formData.fromAmount, formData.exchangeRate]);

  // Dövizleri değiştir
  const swapCurrencies = () => {
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      exchangeRate: prev.exchangeRate ? (1 / parseFloat(prev.exchangeRate)).toFixed(4) : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      toast.error("Lütfen hesap seçin");
      return;
    }

    if (formData.fromCurrency === formData.toCurrency) {
      toast.error("Kaynak ve hedef döviz aynı olamaz");
      return;
    }

    const fromAmount = parseFloat(formData.fromAmount);
    const toAmount = parseFloat(formData.toAmount);
    const exchangeRate = parseFloat(formData.exchangeRate);

    if (!fromAmount || fromAmount <= 0) {
      toast.error("Geçerli bir tutar girin");
      return;
    }

    if (!exchangeRate || exchangeRate <= 0) {
      toast.error("Geçerli bir döviz kuru girin");
      return;
    }

    const fromBalance = getBalance(formData.fromCurrency);
    if (fromAmount > fromBalance) {
      toast.error(`Yetersiz ${formData.fromCurrency} bakiyesi. Mevcut: ${formatCurrency(fromBalance, formData.fromCurrency)}`);
      return;
    }

    setSubmitting(true);
    try {
      const exchangeData = {
        accountId: formData.accountId,
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        fromAmount,
        toAmount,
        exchangeRate,
        description: formData.description || `${fromAmount} ${formData.fromCurrency} → ${toAmount.toFixed(2)} ${formData.toCurrency}`,
      };

      const result = await createExchangeTransaction(exchangeData, user?.uid);
      
      if (result.success) {
        toast.success("Döviz çevirme işlemi başarıyla gerçekleştirildi");
        setFormData(prev => ({
          ...prev,
          fromAmount: "",
          toAmount: "",
          description: "",
        }));
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Döviz çevirme sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] lg:col-span-2" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Döviz Çevirme</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hesap içinde döviz çevirme işlemi yapın
          </p>
        </div>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Çoklu Döviz Hesabı Bulunamadı</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Döviz çevirme işlemi yapabilmek için çoklu döviz destekleyen bir hesabınız olmalıdır.
            </p>
            <Link href="/admin/finance/accounts/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Wallet className="w-4 h-4 mr-2" />
                Çoklu Döviz Hesabı Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Döviz Çevirme</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hesap içinde döviz çevirme işlemi yapın
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exchange Formu */}
        <Card className="bg-white border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-purple-600" />
              Yeni Döviz Çevirme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hesap Seçimi */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Hesap</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
                >
                  <SelectTrigger className="bg-white border-slate-300">
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-slate-400" />
                          <span>{acc.name}</span>
                          <Badge variant="outline" className="text-xs">Çoklu Döviz</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bakiyeler */}
              {selectedAccount && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {supportedCurrencies.map((curr) => {
                    const balance = getBalance(curr);
                    return (
                      <div 
                        key={curr} 
                        className={cn(
                          "bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-pointer transition-colors",
                          formData.fromCurrency === curr && "bg-red-50 border-red-200",
                          formData.toCurrency === curr && "bg-green-50 border-green-200"
                        )}
                        onClick={() => {
                          if (formData.toCurrency === curr) {
                            setFormData(prev => ({ ...prev, fromCurrency: curr }));
                          } else if (formData.fromCurrency !== curr) {
                            setFormData(prev => ({ ...prev, toCurrency: curr }));
                          }
                        }}
                      >
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {getCurrencySymbol(curr)} {getCurrencyLabel(curr)}
                          {formData.fromCurrency === curr && (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          {formData.toCurrency === curr && (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                        </p>
                        <p className="text-base font-semibold text-slate-900 mt-1">
                          {formatCurrency(balance, curr)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Döviz Seçimi */}
              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Kaynak Döviz</Label>
                  <Select
                    value={formData.fromCurrency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fromCurrency: value }))}
                  >
                    <SelectTrigger className="bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.filter(c => c !== formData.toCurrency).map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getCurrencySymbol(curr)}</span>
                            <span>{getCurrencyLabel(curr)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full border-slate-300 hover:bg-purple-50 hover:border-purple-300"
                    onClick={swapCurrencies}
                  >
                    <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  </Button>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Hedef Döviz</Label>
                  <Select
                    value={formData.toCurrency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, toCurrency: value }))}
                  >
                    <SelectTrigger className="bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.filter(c => c !== formData.fromCurrency).map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getCurrencySymbol(curr)}</span>
                            <span>{getCurrencyLabel(curr)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tutar ve Kur */}
              <div className="border-t border-slate-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Çevrilecek Tutar</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        {getCurrencySymbol(formData.fromCurrency)}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.fromAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromAmount: e.target.value }))}
                        className="pl-10 bg-white border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Mevcut: {formatCurrency(getBalance(formData.fromCurrency), formData.fromCurrency)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      Döviz Kuru
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={handleFetchRate}
                        disabled={fetchingRate}
                      >
                        {fetchingRate ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Globe className="w-3 h-3" />
                        )}
                        <span className="text-xs ml-1">Güncelle</span>
                      </Button>
                    </Label>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      value={formData.exchangeRate}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, exchangeRate: e.target.value }));
                        setRateSource({ source: "manual" });
                      }}
                      className="bg-white border-slate-300"
                    />
                    <div className="text-xs">
                      {rateSource?.source === "api" && (
                        <p className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Güncel kur ({rateSource.date})
                        </p>
                      )}
                      {rateSource?.source === "manual" && (
                        <p className="text-amber-600 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Manuel kur girişi
                        </p>
                      )}
                      <p className="text-slate-500 mt-1">
                        1 {formData.fromCurrency} = {formData.exchangeRate || "?"} {formData.toCurrency}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Alınacak Tutar</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        {getCurrencySymbol(formData.toCurrency)}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.toAmount}
                        readOnly
                        className="pl-10 bg-slate-50 border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Mevcut: {formatCurrency(getBalance(formData.toCurrency), formData.toCurrency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Açıklama (Opsiyonel)</Label>
                <Textarea
                  placeholder="Döviz çevirme açıklaması..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border-slate-300 resize-none"
                  rows={2}
                />
              </div>

              {/* Özet */}
              {formData.fromAmount && formData.toAmount && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3">İşlem Özeti</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-purple-700">Hesap:</span>
                      <span className="font-medium text-purple-900 ml-2">{selectedAccount?.name}</span>
                    </div>
                    <div>
                      <span className="text-purple-700">Kur:</span>
                      <span className="font-medium text-purple-900 ml-2">
                        1 {formData.fromCurrency} = {formData.exchangeRate} {formData.toCurrency}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Çevrilecek:</span>
                      <span className="font-semibold text-red-600 ml-2">
                        -{formatCurrency(parseFloat(formData.fromAmount) || 0, formData.fromCurrency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-700">Alınacak:</span>
                      <span className="font-semibold text-green-600 ml-2">
                        +{formatCurrency(parseFloat(formData.toAmount) || 0, formData.toCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    fromAmount: "",
                    toAmount: "",
                    description: "",
                  }))}
                >
                  Temizle
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={submitting || !formData.accountId || !formData.fromAmount || !formData.exchangeRate}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Çeviriliyor...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Döviz Çevir
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Son İşlemler */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Son Döviz İşlemleri
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentExchanges.length === 0 ? (
              <div className="p-8 text-center">
                <RefreshCcw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Henüz döviz işlemi yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentExchanges.slice(0, 8).map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/admin/finance/transactions/${tx.id}`}
                    className="block p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-purple-600">{tx.transactionNumber}</p>
                        <p className="text-sm text-slate-900 truncate mt-1">
                          {tx.fromCurrency} → {tx.toCurrency}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(tx.transactionDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-red-600">
                          -{formatCurrency(tx.fromAmount || tx.amount, tx.fromCurrency || tx.currency)}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          +{formatCurrency(tx.toAmount, tx.toCurrency)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
