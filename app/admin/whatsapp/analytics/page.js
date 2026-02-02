"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachHourOfInterval,
  startOfHour,
  isWithinInterval,
} from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Send,
  CheckCheck,
  Clock,
  XCircle,
  Users,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  Activity,
  MessageSquare,
} from "lucide-react";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Simple bar chart component
const SimpleBarChart = ({ data, maxValue, label }) => {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12 text-right shrink-0">
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 rounded transition-all duration-300"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function WhatsAppAnalyticsPage() {
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("7d");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  // Fetch data
  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch conversations
      const convResponse = await fetch("/api/admin/whatsapp/conversations?limit=1000");
      const convData = await convResponse.json();
      if (convData.success) {
        setConversations(convData.data || []);
      }

      // Fetch messages
      const msgResponse = await fetch("/api/admin/whatsapp/messages?limit=1000");
      const msgData = await msgResponse.json();
      if (msgData.success) {
        setMessages(msgData.data || []);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate date range
  const dateRangeConfig = useMemo(() => {
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    return {
      start: startOfDay(subDays(now, days - 1)),
      end: endOfDay(now),
      days,
    };
  }, [dateRange]);

  // Filter data by date range
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const msgDate = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
      return isWithinInterval(msgDate, dateRangeConfig);
    });
  }, [messages, dateRangeConfig]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const convDate = conv.lastMessageAt?.toDate?.() || new Date(conv.lastMessageAt);
      return isWithinInterval(convDate, dateRangeConfig);
    });
  }, [conversations, dateRangeConfig]);

  // Calculate stats
  const stats = useMemo(() => {
    const inbound = filteredMessages.filter((m) => m.direction === "inbound").length;
    const outbound = filteredMessages.filter((m) => m.direction === "outbound").length;
    const delivered = filteredMessages.filter((m) => m.status === "delivered").length;
    const read = filteredMessages.filter((m) => m.status === "read").length;
    const failed = filteredMessages.filter((m) => m.status === "failed").length;
    const uniqueCustomers = new Set(filteredConversations.map((c) => c.customerId)).size;

    // Previous period comparison
    const prevStart = subDays(dateRangeConfig.start, dateRangeConfig.days);
    const prevEnd = subDays(dateRangeConfig.end, dateRangeConfig.days);
    const prevMessages = messages.filter((msg) => {
      const msgDate = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
      return isWithinInterval(msgDate, { start: prevStart, end: prevEnd });
    });
    const prevInbound = prevMessages.filter((m) => m.direction === "inbound").length;

    const inboundChange = prevInbound > 0 ? ((inbound - prevInbound) / prevInbound) * 100 : 0;

    return {
      total: filteredMessages.length,
      inbound,
      outbound,
      delivered,
      read,
      failed,
      uniqueCustomers,
      activeConversations: filteredConversations.filter((c) => c.status === "active").length,
      deliveryRate: outbound > 0 ? ((delivered + read) / outbound) * 100 : 0,
      readRate: delivered > 0 ? (read / (delivered + read)) * 100 : 0,
      inboundChange,
    };
  }, [filteredMessages, filteredConversations, messages, dateRangeConfig]);

  // Daily message chart data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval(dateRangeConfig);
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayMessages = filteredMessages.filter((msg) => {
        const msgDate = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
        return isWithinInterval(msgDate, { start: dayStart, end: dayEnd });
      });

      return {
        label: format(day, "dd MMM", { locale: tr }),
        date: day,
        inbound: dayMessages.filter((m) => m.direction === "inbound").length,
        outbound: dayMessages.filter((m) => m.direction === "outbound").length,
        value: dayMessages.length,
      };
    });
  }, [filteredMessages, dateRangeConfig]);

  // Hourly distribution (last 24 hours)
  const hourlyData = useMemo(() => {
    const now = new Date();
    const hours = eachHourOfInterval({
      start: subDays(now, 1),
      end: now,
    });

    return hours.slice(-12).map((hour) => {
      const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000);
      const hourMessages = messages.filter((msg) => {
        const msgDate = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
        return isWithinInterval(msgDate, { start: hour, end: hourEnd });
      });

      return {
        label: format(hour, "HH:mm"),
        value: hourMessages.length,
      };
    });
  }, [messages]);

  // Message type distribution
  const messageTypeData = useMemo(() => {
    const types = {};
    filteredMessages.forEach((msg) => {
      const type = msg.type || "text";
      types[type] = (types[type] || 0) + 1;
    });

    const typeLabels = {
      text: "Metin",
      image: "Resim",
      video: "Video",
      audio: "Ses",
      document: "Doküman",
      template: "Şablon",
      interactive: "Etkileşimli",
    };

    return Object.entries(types)
      .map(([type, count]) => ({
        label: typeLabels[type] || type,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-6 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">WhatsApp Analitik</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Mesaj istatistikleri ve performans metrikleri
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Son 7 Gün</SelectItem>
                <SelectItem value="30d">Son 30 Gün</SelectItem>
                <SelectItem value="90d">Son 90 Gün</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchData(true)} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Messages */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Toplam Mesaj</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    stats.inboundChange >= 0
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {stats.inboundChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.inboundChange).toFixed(1)}%
                </Badge>
                <span className="text-xs text-gray-500">önceki döneme göre</span>
              </div>
            </CardContent>
          </Card>

          {/* Inbound vs Outbound */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gelen / Giden</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.inbound} / {stats.outbound}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.inbound / stats.total) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.outbound / stats.total) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Rate */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Teslim Oranı</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.deliveryRate.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCheck className="h-3 w-3 text-green-600" />
                  Okunma: {stats.readRate.toFixed(0)}%
                </span>
                {stats.failed > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3 w-3" />
                    Hatalı: {stats.failed}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Conversations */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aktif Sohbet</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.activeConversations}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>Toplam müşteri: {stats.uniqueCustomers}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Messages Chart */}
          <Card className="bg-white border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                Günlük Mesaj Trendi
              </CardTitle>
              <CardDescription>
                {format(dateRangeConfig.start, "dd MMM", { locale: tr })} -{" "}
                {format(dateRangeConfig.end, "dd MMM yyyy", { locale: tr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {/* Simple Chart */}
                <div className="h-full flex items-end gap-1">
                  {dailyData.slice(-14).map((day, i) => {
                    const maxVal = Math.max(...dailyData.map((d) => d.value), 1);
                    const heightPercent = (day.value / maxVal) * 100;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div className="flex-1 w-full flex flex-col justify-end">
                          <div
                            className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            title={`${day.label}: ${day.value} mesaj`}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">
                          {day.label.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-sm text-gray-600">Toplam Mesaj</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Types */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                Mesaj Türleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messageTypeData.length > 0 ? (
                <SimpleBarChart data={messageTypeData.slice(0, 6)} />
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                  Henüz veri yok
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hourly Distribution */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Saatlik Dağılım (Son 12 Saat)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={hourlyData} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <WhatsAppIcon className="h-5 w-5 text-green-600" />
                Özet İstatistikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-blue-600 rotate-180" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gelen Mesajlar</p>
                      <p className="text-xs text-gray-500">Müşterilerden</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{stats.inbound}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Giden Mesajlar</p>
                      <p className="text-xs text-gray-500">Gönderilen</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{stats.outbound}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckCheck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Okunan Mesajlar</p>
                      <p className="text-xs text-gray-500">Teslim edildi & okundu</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{stats.read}</span>
                </div>

                {stats.failed > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Hatalı Mesajlar</p>
                        <p className="text-xs text-red-600">Gönderilemedi</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-red-700">{stats.failed}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
