"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  getAllCompanies,
  deleteCompany,
  searchCompanies,
  getCompaniesByStatus,
  getCompaniesByBusinessLine,
} from "../../../lib/services/companies-service";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Package,
  Factory,
  ShoppingCart,
  Target,
  Briefcase,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import CompanyReportsDashboard from "../../../components/company-reports-dashboard";
import QuickCommunicationModal from "../../../components/quick-communication-modal";

export default function CompaniesPage() {
  const { user } = useAdminAuth();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBusinessLine, setFilterBusinessLine] = useState("all");
  const [loading, setLoading] = useState(true);

  // Firestore'dan firmaları yükle
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error loading companies:", error);
      // Toast mesajı ekleyebilirsiniz
    } finally {
      setLoading(false);
    }
  };

  // Firma sil
  const handleDeleteCompany = async (companyId) => {
    if (window.confirm("Bu firmayı silmek istediğinizden emin misiniz?")) {
      try {
        await deleteCompany(companyId);
        // Listeyi yenile
        await loadCompanies();
        // Toast mesajı ekleyebilirsiniz
      } catch (error) {
        console.error("Error deleting company:", error);
        // Error toast ekleyebilirsiniz
      }
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Arama ve filtreleme
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const searchResults = await searchCompanies(searchTerm);
        setCompanies(searchResults);
      } catch (error) {
        console.error("Error searching companies:", error);
      } finally {
        setLoading(false);
      }
    } else {
      loadCompanies();
    }
  };

  const handleStatusFilter = async (status) => {
    setFilterStatus(status);
    if (status === "all") {
      loadCompanies();
    } else {
      try {
        setLoading(true);
        const filteredData = await getCompaniesByStatus(status);
        setCompanies(filteredData);
      } catch (error) {
        console.error("Error filtering by status:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBusinessLineFilter = async (businessLine) => {
    setFilterBusinessLine(businessLine);
    if (businessLine === "all") {
      loadCompanies();
    } else {
      try {
        setLoading(true);
        const filteredData = await getCompaniesByBusinessLine(businessLine);
        setCompanies(filteredData);
      } catch (error) {
        console.error("Error filtering by business line:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Client-side filtreleme (eğer zaten filtrelenmiş data varsa)
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      !searchTerm ||
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === "all" || company.status === filterStatus;
    const matchesBusinessLineFilter =
      filterBusinessLine === "all" ||
      company.businessLine === filterBusinessLine;

    return matchesSearch && matchesStatusFilter && matchesBusinessLineFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "active-client":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "paused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBusinessLineColor = (businessLine) => {
    switch (businessLine) {
      case "ambalaj":
        return "bg-indigo-100 text-indigo-800";
      case "eticaret":
        return "bg-violet-100 text-violet-800";
      case "pazarlama":
        return "bg-pink-100 text-pink-800";
      case "fason-kozmetik":
        return "bg-emerald-100 text-emerald-800";
      case "fason-gida":
        return "bg-orange-100 text-orange-800";
      case "fason-temizlik":
        return "bg-cyan-100 text-cyan-800";
      case "tasarim":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "lead":
        return "Potansiyel";
      case "negotiation":
        return "Görüşme";
      case "active-client":
        return "Aktif Müşteri";
      case "completed":
        return "Tamamlandı";
      case "paused":
        return "Beklemede";
      default:
        return status;
    }
  };

  const getBusinessLineText = (businessLine) => {
    switch (businessLine) {
      case "ambalaj":
        return "Ambalaj";
      case "fason":
        return "Fason Üretim";
      case "ecommerce":
        return "E-ticaret";
      default:
        return businessLine;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Firmalar yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            İş Ortaklıkları Yönetimi
          </h1>
          <p className="text-gray-600 mt-2">
            Ambalaj, fason üretim ve e-ticaret iş kollarındaki firma
            ilişkilerinizi yönetin
          </p>
        </div>
        <Link href="/admin/companies/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Firma Ekle
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Firmalar
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Raporlar & Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          {/* İş Kolu Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Toplam Firma
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {companies.length}
                    </p>
                  </div>
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Ambalaj</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {
                        companies.filter((c) => c.businessLine === "ambalaj")
                          .length
                      }
                    </p>
                  </div>
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Fason Üretim
                    </p>
                    <p className="text-xl font-bold text-emerald-600">
                      {
                        companies.filter((c) =>
                          c.businessLine.startsWith("fason")
                        ).length
                      }
                    </p>
                  </div>
                  <Factory className="h-6 w-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      E-ticaret & Pazarlama
                    </p>
                    <p className="text-xl font-bold text-violet-600">
                      {
                        companies.filter(
                          (c) =>
                            c.businessLine === "eticaret" ||
                            c.businessLine === "pazarlama"
                        ).length
                      }
                    </p>
                  </div>
                  <ShoppingCart className="h-6 w-6 text-violet-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Aktif Müşteri
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {
                        companies.filter((c) => c.status === "active-client")
                          .length
                      }
                    </p>
                  </div>
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Firma adı, email, kişi adı veya açıklama ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterBusinessLine}
                  onChange={(e) => handleBusinessLineFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm İş Kolları</option>
                  <option value="ambalaj">Ambalaj Üretimi</option>
                  <option value="eticaret">E-ticaret Yönetimi</option>
                  <option value="pazarlama">Pazarlama Hizmetleri</option>
                  <option value="fason-kozmetik">Fason - Kozmetik</option>
                  <option value="fason-gida">Fason - Gıda Takviyesi</option>
                  <option value="fason-temizlik">
                    Fason - Temizlik Ürünleri
                  </option>
                  <option value="tasarim">Tasarım Hizmetleri</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="lead">Potansiyel</option>
                  <option value="negotiation">Görüşme</option>
                  <option value="active-client">Aktif Müşteri</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="paused">Beklemede</option>
                </select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {company.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mb-2">
                        {company.industry || "Sektör belirtilmemiş"} •{" "}
                        {company.businessStage || "Aşama belirtilmemiş"}
                      </CardDescription>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={getBusinessLineColor(company.businessLine)}
                          variant="secondary"
                        >
                          {company.businessLine === "ambalaj"
                            ? "Ambalaj"
                            : company.businessLine === "eticaret"
                            ? "E-ticaret"
                            : company.businessLine === "pazarlama"
                            ? "Pazarlama"
                            : company.businessLine === "fason-kozmetik"
                            ? "Fason-Kozmetik"
                            : company.businessLine === "fason-gida"
                            ? "Fason-Gıda"
                            : company.businessLine === "fason-temizlik"
                            ? "Fason-Temizlik"
                            : company.businessLine === "tasarim"
                            ? "Tasarım"
                            : "Diğer"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(company.status)}>
                        {getStatusText(company.status)}
                      </Badge>
                      <Badge className={getPriorityColor(company.priority)}>
                        {company.priority === "high"
                          ? "Yüksek"
                          : company.priority === "medium"
                          ? "Orta"
                          : "Düşük"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {company.contactPerson || "Kişi belirtilmemiş"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {company.phone || "Telefon belirtilmemiş"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {company.email || "Email belirtilmemiş"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {company.address || "Adres belirtilmemiş"}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Proje Detayı:
                      </p>
                      <p
                        className="text-xs text-gray-800 font-medium"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {typeof company.projectDetails === "object" &&
                        company.projectDetails !== null
                          ? company.projectDetails.projectDescription ||
                            "Proje detayı bulunmuyor"
                          : company.projectDetails || "Proje detayı bulunmuyor"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Aylık Hacim:</span>
                        <p className="font-medium text-gray-800">
                          {typeof company.monthlyOrderVolume === "object" &&
                          company.monthlyOrderVolume !== null
                            ? company.monthlyOrderVolume.monthlyVolume ||
                              "Belirtilmemiş"
                            : company.monthlyOrderVolume || "Belirtilmemiş"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Beklenen Değer:</span>
                        <p className="font-medium text-green-600">
                          {typeof company.expectedOrderValue === "object" &&
                          company.expectedOrderValue !== null
                            ? company.expectedOrderValue.expectedMonthlyValue ||
                              "Belirtilmemiş"
                            : company.expectedOrderValue || "Belirtilmemiş"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-50">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Son İletişim:</span>
                        <span className="font-medium">
                          {typeof company.lastContact === "object" &&
                          company.lastContact !== null
                            ? new Date(
                                company.lastContact.seconds * 1000
                              ).toLocaleDateString("tr-TR")
                            : company.lastContact || "Belirtilmemiş"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {(company.tags || []).slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {(company.tags || []).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(company.tags || []).length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/admin/companies/${company.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-xs">
                        Detay Görüntüle
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/companies/${company.id}?tab=communications`}
                      className="flex-1"
                    >
                      <Button
                        variant="default"
                        className="w-full text-xs bg-green-600 hover:bg-green-700"
                      >
                        Görüşme Ekle
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/companies/${company.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="secondary" className="w-full text-xs">
                        Düzenle
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Arama kriterlerinize uygun firma bulunamadı.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Farklı arama terimleri deneyin veya yeni bir firma ekleyin.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <CompanyReportsDashboard />
        </TabsContent>
      </Tabs>

      {/* Global Hızlı Görüşme Modal */}
      <QuickCommunicationModal />
    </div>
  );
}
