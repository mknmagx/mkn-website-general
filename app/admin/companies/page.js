"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import {
  getAllCompanies,
  deleteCompany,
  searchCompanies,
} from "../../../lib/services/companies-service";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  Globe,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../hooks/use-toast";

export default function CompaniesPage() {
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBusinessLine, setFilterBusinessLine] = useState("all");
  const [loading, setLoading] = useState(true);

  // Permission checks
  const canView = hasPermission("companies.view");
  const canCreate = hasPermission("companies.create");
  const canEdit = hasPermission("companies.edit");
  const canDelete = hasPermission("companies.delete");

  // Load companies
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast({
        title: "Hata",
        description: "Firmalar yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete company
  const handleDeleteCompany = async (companyId, companyName) => {
    if (window.confirm(`"${companyName}" firmasını silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteCompany(companyId);
        await loadCompanies();
        toast({
          title: "Başarılı",
          description: "Firma başarıyla silindi",
        });
      } catch (error) {
        console.error("Error deleting company:", error);
        toast({
          title: "Hata",
          description: "Firma silinirken bir hata oluştu",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Client-side filtering
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      !searchTerm ||
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || company.status === filterStatus;
      
    const matchesBusinessLine =
      filterBusinessLine === "all" || company.businessLine === filterBusinessLine;

    return matchesSearch && matchesStatus && matchesBusinessLine;
  });

  const getStatusColor = (status) => {
    const colors = {
      "lead": "bg-blue-100 text-blue-700 border-blue-200",
      "negotiation": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "active-client": "bg-green-100 text-green-700 border-green-200",
      "completed": "bg-purple-100 text-purple-700 border-purple-200",
      "paused": "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      "lead": "Potansiyel",
      "negotiation": "Görüşme",
      "active-client": "Aktif Müşteri",
      "completed": "Tamamlandı",
      "paused": "Beklemede",
    };
    return labels[status] || status;
  };

  const getBusinessLineColor = (businessLine) => {
    const colors = {
      "ambalaj": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "eticaret": "bg-violet-50 text-violet-700 border-violet-200",
      "pazarlama": "bg-pink-50 text-pink-700 border-pink-200",
      "fason-kozmetik": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "fason-gida": "bg-orange-50 text-orange-700 border-orange-200",
      "fason-temizlik": "bg-cyan-50 text-cyan-700 border-cyan-200",
      "tasarim": "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[businessLine] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getBusinessLineLabel = (businessLine) => {
    const labels = {
      "ambalaj": "Ambalaj",
      "eticaret": "E-ticaret",
      "pazarlama": "Pazarlama",
      "fason-kozmetik": "Kozmetik",
      "fason-gida": "Gıda",
      "fason-temizlik": "Temizlik",
      "tasarim": "Tasarım",
    };
    return labels[businessLine] || businessLine;
  };

  if (loading) {
    return (
      <PermissionGuard requiredPermission="companies.view">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Firmalar yükleniyor...</p>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="companies.view">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                Firmalar
              </h1>
              <p className="text-gray-600">Tüm iş ortaklarınızı yönetin</p>
            </div>
            {canCreate && (
              <Link href="/admin/companies/new">
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Firma
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 rounded-xl p-3">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Toplam</Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">{companies.length}</h3>
              <p className="text-white/80 text-sm">Toplam Firma</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 rounded-xl p-3">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Aktif</Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {companies.filter(c => c.status === "active-client").length}
              </h3>
              <p className="text-white/80 text-sm">Aktif Müşteri</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 rounded-xl p-3">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Görüşme</Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {companies.filter(c => c.status === "negotiation").length}
              </h3>
              <p className="text-white/80 text-sm">Görüşme Aşamasında</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 rounded-xl p-3">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Potansiyel</Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {companies.filter(c => c.status === "lead").length}
              </h3>
              <p className="text-white/80 text-sm">Potansiyel Müşteri</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md rounded-2xl mb-6 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Firma adı, email, kişi veya telefon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="lead">Potansiyel</option>
                <option value="negotiation">Görüşme</option>
                <option value="active-client">Aktif Müşteri</option>
                <option value="completed">Tamamlandı</option>
                <option value="paused">Beklemede</option>
              </select>

              {/* Business Line Filter */}
              <select
                value={filterBusinessLine}
                onChange={(e) => setFilterBusinessLine(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Tüm İş Kolları</option>
                <option value="ambalaj">Ambalaj</option>
                <option value="eticaret">E-ticaret</option>
                <option value="pazarlama">Pazarlama</option>
                <option value="fason-kozmetik">Kozmetik</option>
                <option value="fason-gida">Gıda</option>
                <option value="fason-temizlik">Temizlik</option>
                <option value="tasarim">Tasarım</option>
              </select>

              {/* Clear Filters */}
              {(searchTerm || filterStatus !== "all" || filterBusinessLine !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterBusinessLine("all");
                  }}
                  className="border-gray-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Temizle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-md rounded-2xl bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="h-5 w-5 text-blue-600" />
              Firma Listesi ({filteredCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 w-[22%]">Firma Adı</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[21%]">İletişim</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[12%]">İş Kolu</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[12%]">Durum</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[22%]">İletişim Kişisi</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 w-[11%]">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company, index) => (
                    <TableRow 
                      key={company.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Company Name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 font-semibold text-sm">
                              {company.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {company.name}
                            </div>
                            {company.website && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Globe className="h-3 w-3" />
                                {company.website}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <div className="space-y-1">
                          {company.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              {company.phone}
                            </div>
                          )}
                          {company.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              {company.email}
                            </div>
                          )}
                          {!company.phone && !company.email && (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Business Line */}
                      <TableCell>
                        <Badge className={`${getBusinessLineColor(company.businessLine)} border`}>
                          {getBusinessLineLabel(company.businessLine)}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge className={`${getStatusColor(company.status)} border`}>
                          {getStatusLabel(company.status)}
                        </Badge>
                      </TableCell>

                      {/* Contact Person */}
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {company.contactPerson || "-"}
                        </div>
                        {company.contactPosition && (
                          <div className="text-xs text-gray-500">
                            {company.contactPosition}
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/companies/${company.id}`}>
                            <Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCompany(company.id, company.name)}
                              className="hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            {/* Empty State */}
            {filteredCompanies.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterStatus !== "all" || filterBusinessLine !== "all"
                    ? "Firma bulunamadı"
                    : "Henüz firma yok"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== "all" || filterBusinessLine !== "all"
                    ? "Arama kriterlerinizi değiştirip tekrar deneyin"
                    : "İlk firmayı ekleyerek başlayın"}
                </p>
                {canCreate && !(searchTerm || filterStatus !== "all" || filterBusinessLine !== "all") && (
                  <Link href="/admin/companies/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Firma Ekle
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
