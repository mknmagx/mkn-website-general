"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Phone,
  Mail,
  Users,
  Calendar,
  Award,
  Target,
  Activity,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react";
import {
  getDailyReport,
  getUpcomingTasks,
  COMMUNICATION_TYPES,
  getCommunicationTypeText,
} from "../lib/services/company-communications";
import { getAllCompanies } from "../lib/services/companies-service";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { tr } from "date-fns/locale";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export default function CompanyReportsDashboard() {
  const [dateRange, setDateRange] = useState("today");
  const [reportData, setReportData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verileri yükle
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Bugünkü rapor
      const today = new Date();
      const dailyReport = await getDailyReport(today);
      
      // Haftalık veri için son 7 günü al
      const weeklyReports = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        try {
          const report = await getDailyReport(date);
          weeklyReports.push({
            date: format(date, "dd/MM", { locale: tr }),
            fullDate: format(date, "yyyy-MM-dd"),
            contacts: report.totalContacts,
            companies: report.uniqueCompanies,
            proposals: report.proposalsSent,
            contracts: report.contractsSigned,
          });
        } catch (err) {
          console.warn(`Error loading data for ${date}:`, err);
          // Boş gün verisi ekle
          weeklyReports.push({
            date: format(date, "dd/MM", { locale: tr }),
            fullDate: format(date, "yyyy-MM-dd"),
            contacts: 0,
            companies: 0,
            proposals: 0,
            contracts: 0,
          });
        }
      }
      
      // Bekleyen görevler
      const tasks = await getUpcomingTasks(null, 14); // 14 günlük
      
      // Tüm firmalar
      const companiesData = await getAllCompanies();
      
      setReportData(dailyReport);
      setWeeklyData(weeklyReports);
      setUpcomingTasks(tasks || []);
      setCompanies(companiesData || []);
      
    } catch (error) {
      console.error("Error loading report data:", error);
      // Fallback veriler
      setReportData({
        totalContacts: 0,
        byType: {},
        uniqueCompanies: 0,
        proposalsSent: 0,
        contractsSigned: 0
      });
      setWeeklyData([]);
      setUpcomingTasks([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // İletişim türü verilerini hazırla
  const getCommunicationTypeData = () => {
    if (!reportData?.byType) return [];
    
    return Object.entries(reportData.byType).map(([type, count]) => ({
      name: getCommunicationTypeText(type),
      value: count,
      type: type,
    }));
  };

  // Firma durumlarını analiz et
  const getCompanyStatusData = () => {
    const statusCounts = {};
    companies.forEach(company => {
      const status = company.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusText(status),
      value: count,
    }));
  };

  const getStatusText = (status) => {
    const statusTexts = {
      lead: "Potansiyel",
      first_contact: "İlk İletişim",
      proposal_sent: "Teklif Gönderildi",
      negotiation: "Görüşme",
      contract_pending: "Sözleşme Bekliyor",
      active_client: "Aktif Müşteri",
      project_completed: "Proje Tamamlandı",
      follow_up: "Takip",
      lost: "Kaybedildi",
      paused: "Beklemede",
    };
    return statusTexts[status] || status;
  };

  // Önceliğe göre görevleri grupla
  const getTasksByPriority = () => {
    const priorityCounts = { urgent: 0, high: 0, medium: 0, low: 0 };
    upcomingTasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorityCounts[priority]++;
    });

    return [
      { name: "Acil", value: priorityCounts.urgent, color: "#ef4444" },
      { name: "Yüksek", value: priorityCounts.high, color: "#f97316" },
      { name: "Orta", value: priorityCounts.medium, color: "#eab308" },
      { name: "Düşük", value: priorityCounts.low, color: "#22c55e" },
    ];
  };

  // Excel export fonksiyonu
  const exportToExcel = () => {
    // Bu fonksiyon gerçek bir export kütüphanesi ile implement edilebilir
    const data = {
      dailyReport: reportData,
      weeklyData: weeklyData,
      upcomingTasks: upcomingTasks,
      companies: companies,
    };
    
    console.log("Excel export data:", data);
    // TODO: xlsx kütüphanesi ile gerçek export implementasyonu
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-600">Raporlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Günlük Rapor Dashboard</h2>
          <p className="text-gray-600">
            {format(new Date(), "dd MMMM yyyy", { locale: tr })} - Firma iletişim analizi
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Excel'e Aktar
          </Button>
        </div>
      </div>

      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bugünkü İletişim</p>
                <p className="text-3xl font-bold">{reportData?.totalContacts || 0}</p>
                <p className="text-sm text-green-600">+{reportData?.uniqueCompanies || 0} firma</p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gönderilen Teklifler</p>
                <p className="text-3xl font-bold">{reportData?.proposalsSent || 0}</p>
                <p className="text-sm text-blue-600">Bugün</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">İmzalanan Sözleşmeler</p>
                <p className="text-3xl font-bold">{reportData?.contractsSigned || 0}</p>
                <p className="text-sm text-green-600">Bugün</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen Görevler</p>
                <p className="text-3xl font-bold">{upcomingTasks.length}</p>
                <p className="text-sm text-orange-600">14 gün içinde</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Haftalık Aktivite */}
        <Card>
          <CardHeader>
            <CardTitle>Haftalık İletişim Trendi</CardTitle>
            <CardDescription>Son 7 günlük iletişim aktivitesi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="contacts" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="İletişim Sayısı"
                />
                <Line 
                  type="monotone" 
                  dataKey="companies" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Firma Sayısı"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* İletişim Türü Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Türü Dağılımı</CardTitle>
            <CardDescription>Bugünkü iletişimlerin türlere göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCommunicationTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCommunicationTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Firma Durumları */}
        <Card>
          <CardHeader>
            <CardTitle>Firma Durumları</CardTitle>
            <CardDescription>Tüm firmaların mevcut durumları</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCompanyStatusData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Görev Öncelikleri */}
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Görev Öncelikleri</CardTitle>
            <CardDescription>Öncelik düzeyine göre görev dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getTasksByPriority()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getTasksByPriority().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bekleyen Görevler Listesi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Yaklaşan Görevler
          </CardTitle>
          <CardDescription>
            Önümüzdeki 14 gün içinde tamamlanması gereken görevler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Bekleyen görev bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {task.type === COMMUNICATION_TYPES.PHONE_CALL && <Phone className="h-4 w-4" />}
                      {task.type === COMMUNICATION_TYPES.EMAIL && <Mail className="h-4 w-4" />}
                      {task.type === COMMUNICATION_TYPES.MEETING && <Users className="h-4 w-4" />}
                      {task.type === COMMUNICATION_TYPES.FOLLOW_UP && <Activity className="h-4 w-4" />}
                      <div>
                        <p className="font-medium">{task.subject}</p>
                        <p className="text-sm text-gray-600">{task.companyName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {task.scheduledDate && format(new Date(task.scheduledDate.toDate()), "dd MMM", { locale: tr })}
                    </Badge>
                    <Badge 
                      className={
                        task.priority === "urgent" ? "bg-red-100 text-red-800" :
                        task.priority === "high" ? "bg-orange-100 text-orange-800" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }
                    >
                      {task.priority === "urgent" ? "Acil" :
                       task.priority === "high" ? "Yüksek" :
                       task.priority === "medium" ? "Orta" : "Düşük"}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`/admin/companies/${task.companyId}?tab=communications`, '_blank')}
                    >
                      Tamamla
                    </Button>
                  </div>
                </div>
              ))}
              
              {upcomingTasks.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    +{upcomingTasks.length - 10} görev daha...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hızlı Aksiyon Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-900">Bugünkü Hedef</h3>
              <p className="text-sm text-blue-700 mt-1">
                10 firma ile iletişim kurmak
              </p>
              <div className="mt-2">
                <div className="bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((reportData?.totalContacts || 0) / 10 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {reportData?.totalContacts || 0}/10 tamamlandı
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900">Haftalık Trend</h3>
              <p className="text-sm text-green-700 mt-1">
                {weeklyData.length > 1 && weeklyData[weeklyData.length - 1].contacts > weeklyData[weeklyData.length - 2].contacts 
                  ? "📈 Artış eğiliminde" 
                  : "📊 Sabit seyir"}
              </p>
              <Button 
                size="sm" 
                className="mt-2 bg-green-600 hover:bg-green-700"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Yeni Görüşme
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-orange-900">Takip Gerekli</h3>
              <p className="text-sm text-orange-700 mt-1">
                {upcomingTasks.filter(task => 
                  new Date(task.scheduledDate?.toDate?.() || task.scheduledDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
                ).length} görev yarına kadar
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="mt-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
              >
                Görevleri Gör
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}