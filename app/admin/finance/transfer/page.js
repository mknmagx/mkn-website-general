"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAccounts,
  getTransactions,
  createCrossTransferTransaction,
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
  ArrowLeftRight,
  ArrowRight,
  RefreshCw,
  Info,
  Wallet,
  History,
  CheckCircle2,
  Globe,
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

export default function TransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [rateSource, setRateSource] = useState(null);
  
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    fromCurrency: CURRENCY.TRY,
    toCurrency: CURRENCY.TRY,
    amount: "",
    toAmount: "",
    exchangeRate: "1",
    description: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [accResult, txResult] = await Promise.all([
        getAccounts({ isActive: true }),
        getTransactions({ type: TRANSACTION_TYPE.TRANSFER, limit: 10 }),
      ]);
      
      if (accResult.success) {
        setAccounts(accResult.data);
        
        // URL'den fromAccountId varsa seç
        const urlFromAccountId = searchParams.get("fromAccountId");
        if (urlFromAccountId && accResult.data.find(a => a.id === urlFromAccountId)) {
          setFormData(prev => ({ ...prev, fromAccountId: urlFromAccountId }));
        }
      }
      if (txResult.success) setRecentTransfers(txResult.data);
    } catch (error) {
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);

  const fromCurrencyOptions = fromAccount?.mode === ACCOUNT_MODE.MULTI 
    ? (fromAccount.supportedCurrencies || ALL_CURRENCIES)
    : fromAccount?.currency ? [fromAccount.currency] : ALL_CURRENCIES;

  const toCurrencyOptions = toAccount?.mode === ACCOUNT_MODE.MULTI
    ? (toAccount.supportedCurrencies || ALL_CURRENCIES)
    : toAccount?.currency ? [toAccount.currency] : ALL_CURRENCIES;

  const getAccountBalance = (account, currency) => {
    if (!account) return 0;
    if (account.mode === ACCOUNT_MODE.MULTI) {
      return account.balances?.[currency] || 0;
    }
    return account.currency === currency ? (account.currentBalance || 0) : 0;
  };

  const handleFetchRate = async () => {
    if (formData.fromCurrency === formData.toCurrency) {
      setFormData(prev => ({ ...prev, exchangeRate: "1" }));
      setRateSource({ source: "same" });
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

  useEffect(() => {
    if (formData.amount && formData.exchangeRate) {
      const amount = parseFloat(formData.amount) || 0;
      const rate = parseFloat(formData.exchangeRate) || 1;
      setFormData(prev => ({ ...prev, toAmount: (amount * rate).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, toAmount: "" }));
    }
  }, [formData.amount, formData.exchangeRate]);

  useEffect(() => {
    if (fromAccount) {
      if (fromAccount.mode !== ACCOUNT_MODE.MULTI) {
        setFormData(prev => ({ ...prev, fromCurrency: fromAccount.currency }));
      } else if (!fromAccount.supportedCurrencies?.includes(formData.fromCurrency)) {
        setFormData(prev => ({ 
          ...prev, 
          fromCurrency: fromAccount.supportedCurrencies?.[0] || CURRENCY.TRY 
        }));
      }
    }
  }, [formData.fromAccountId, fromAccount]);

  useEffect(() => {
    if (toAccount) {
      if (toAccount.mode !== ACCOUNT_MODE.MULTI) {
        setFormData(prev => ({ ...prev, toCurrency: toAccount.currency }));
      } else if (!toAccount.supportedCurrencies?.includes(formData.toCurrency)) {
        setFormData(prev => ({ 
          ...prev, 
          toCurrency: toAccount.supportedCurrencies?.[0] || CURRENCY.TRY 
        }));
      }
    }
  }, [formData.toAccountId, toAccount]);

  useEffect(() => {
    if (formData.fromCurrency && formData.toCurrency && formData.fromAccountId && formData.toAccountId) {
      if (formData.fromCurrency !== formData.toCurrency) {
        handleFetchRate();
      } else {
        setFormData(prev => ({ ...prev, exchangeRate: "1" }));
        setRateSource({ source: "same" });
      }
    }
  }, [formData.fromCurrency, formData.toCurrency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fromAccountId || !formData.toAccountId) {
      toast.error("Lütfen her iki hesabı da seçin");
      return;
    }

    if (formData.fromAccountId === formData.toAccountId && formData.fromCurrency === formData.toCurrency) {
      toast.error("Aynı hesap ve aynı döviz cinsinde transfer yapılamaz");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error("Geçerli bir tutar girin");
      return;
    }

    const fromBalance = getAccountBalance(fromAccount, formData.fromCurrency);
    if (amount > fromBalance) {
      toast.error(`Yetersiz bakiye. Mevcut: ${formatCurrency(fromBalance, formData.fromCurrency)}`);
      return;
    }

    setSubmitting(true);
    try {
      const transferData = {
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        fromAmount: amount,
        toAmount: parseFloat(formData.toAmount) || amount,
        exchangeRate: parseFloat(formData.exchangeRate) || 1,
        description: formData.description || `${fromAccount?.name} → ${toAccount?.name} Transfer`,
      };

      const result = await createCrossTransferTransaction(transferData, user?.uid);
      
      if (result.success) {
        toast.success("Transfer başarıyla gerçekleştirildi");
        setFormData({
          fromAccountId: "",
          toAccountId: "",
          fromCurrency: CURRENCY.TRY,
          toCurrency: CURRENCY.TRY,
          amount: "",
          toAmount: "",
          exchangeRate: "1",
          description: "",
        });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Transfer sırasında hata oluştu");
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

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hesaplar Arası Transfer</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hesaplar arasında para transferi yapın
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Formu */}
        <Card className="bg-white border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              Yeni Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hesap Seçimi */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                {/* Kaynak Hesap */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Kaynak Hesap</Label>
                    <Select
                      value={formData.fromAccountId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, fromAccountId: value }))}
                    >
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Hesap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem 
                            key={acc.id} 
                            value={acc.id}
                            disabled={acc.id === formData.toAccountId}
                          >
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-slate-400" />
                              <span>{acc.name}</span>
                              {acc.mode === ACCOUNT_MODE.MULTI && (
                                <Badge variant="outline" className="text-xs">Çoklu</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {fromAccount && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Döviz</Label>
                        <Select
                          value={formData.fromCurrency}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, fromCurrency: value }))}
                          disabled={fromAccount.mode !== ACCOUNT_MODE.MULTI}
                        >
                          <SelectTrigger className="bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fromCurrencyOptions.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {getCurrencySymbol(curr)} {getCurrencyLabel(curr)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Mevcut Bakiye</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(getAccountBalance(fromAccount, formData.fromCurrency), formData.fromCurrency)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Transfer Oku */}
                <div className="hidden md:flex items-center justify-center pt-8">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Hedef Hesap */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Hedef Hesap</Label>
                    <Select
                      value={formData.toAccountId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, toAccountId: value }))}
                    >
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Hesap seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem 
                            key={acc.id} 
                            value={acc.id}
                            disabled={acc.id === formData.fromAccountId}
                          >
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-slate-400" />
                              <span>{acc.name}</span>
                              {acc.mode === ACCOUNT_MODE.MULTI && (
                                <Badge variant="outline" className="text-xs">Çoklu</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {toAccount && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Döviz</Label>
                        <Select
                          value={formData.toCurrency}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, toCurrency: value }))}
                          disabled={toAccount.mode !== ACCOUNT_MODE.MULTI}
                        >
                          <SelectTrigger className="bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {toCurrencyOptions.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {getCurrencySymbol(curr)} {getCurrencyLabel(curr)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Mevcut Bakiye</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(getAccountBalance(toAccount, formData.toCurrency), formData.toCurrency)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tutar ve Kur */}
              <div className="border-t border-slate-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Gönderilecek Tutar</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        {getCurrencySymbol(formData.fromCurrency)}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="pl-10 bg-white border-slate-300"
                      />
                    </div>
                  </div>

                  {formData.fromCurrency !== formData.toCurrency && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        Döviz Kuru
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                      {rateSource?.source === "api" && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Güncel kur ({rateSource.date})
                        </p>
                      )}
                      {rateSource?.source === "manual" && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Manuel kur
                        </p>
                      )}
                    </div>
                  )}

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
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Açıklama (Opsiyonel)</Label>
                <Textarea
                  placeholder="Transfer açıklaması..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border-slate-300 resize-none"
                  rows={2}
                />
              </div>

              {/* Transfer Özeti */}
              {formData.fromAccountId && formData.toAccountId && formData.amount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Transfer Özeti</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700">Kaynak:</span>
                      <span className="font-medium text-blue-900 ml-2">{fromAccount?.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Hedef:</span>
                      <span className="font-medium text-blue-900 ml-2">{toAccount?.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Gönderilecek:</span>
                      <span className="font-semibold text-red-600 ml-2">
                        -{formatCurrency(parseFloat(formData.amount) || 0, formData.fromCurrency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Alınacak:</span>
                      <span className="font-semibold text-green-600 ml-2">
                        +{formatCurrency(parseFloat(formData.toAmount) || 0, formData.toCurrency)}
                      </span>
                    </div>
                    {formData.fromCurrency !== formData.toCurrency && (
                      <div className="col-span-2 pt-2 border-t border-blue-200">
                        <span className="text-blue-700">Kur:</span>
                        <span className="font-medium text-blue-900 ml-2">
                          1 {formData.fromCurrency} = {formData.exchangeRate} {formData.toCurrency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    fromAccountId: "",
                    toAccountId: "",
                    fromCurrency: CURRENCY.TRY,
                    toCurrency: CURRENCY.TRY,
                    amount: "",
                    toAmount: "",
                    exchangeRate: "1",
                    description: "",
                  })}
                  className="border-slate-300"
                >
                  Temizle
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={submitting || !formData.fromAccountId || !formData.toAccountId || !formData.amount}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Transfer Yapılıyor...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Transfer Yap
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Son Transferler */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Son Transferler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransfers.length === 0 ? (
              <div className="p-8 text-center">
                <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Henüz transfer yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransfers.slice(0, 8).map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/admin/finance/transactions/${tx.id}`}
                    className="block p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-blue-600">{tx.transactionNumber}</p>
                        <p className="text-sm text-slate-900 truncate mt-1">
                          {tx.description || "Transfer"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(tx.transactionDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                        {tx.fromCurrency !== tx.toCurrency && tx.toAmount && (
                          <p className="text-xs text-slate-500">
                            → {formatCurrency(tx.toAmount, tx.toCurrency)}
                          </p>
                        )}
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
