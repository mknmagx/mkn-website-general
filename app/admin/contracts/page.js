'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard, usePermissions } from '../../../components/admin-route-guard';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Building2,
  Clock
} from 'lucide-react';
import { ContractService } from '../../../lib/services/contract-service';
import { getContractTypeLabel } from '../../../lib/contract-templates';
import ContractPDFExport from '../../../components/contract-pdf-export';
import { useToast } from '../../../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

export default function ContractsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);

  // Permission checks
  const canView = hasPermission('contracts.view');
  const canCreate = hasPermission('contracts.create');
  const canEdit = hasPermission('contracts.edit');
  const canDelete = hasPermission('contracts.delete');

  useEffect(() => {
    loadContracts();
    loadStats();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const result = await ContractService.getContracts({
        limitCount: 100
      });

      if (result.success) {
        setContracts(result.contracts);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sözleşmeler yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await ContractService.getContractStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      // Stats yüklenemezse sessizce devam et
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadContracts();
      return;
    }

    setLoading(true);
    try {
      const result = await ContractService.searchContracts(searchTerm);
      if (result.success) {
        setContracts(result.contracts);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Arama sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setContractToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contractToDelete) return;

    try {
      const result = await ContractService.deleteContract(contractToDelete);
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Sözleşme başarıyla silindi",
        });
        loadContracts();
        loadStats();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Sözleşme silinemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sözleşme silinirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      active: { label: 'Aktif', color: 'bg-green-100 text-green-700 border-green-300' },
      completed: { label: 'Tamamlandı', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700 border-red-300' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredContracts = contracts.filter(contract => {
    if (filterStatus && contract.status !== filterStatus) return false;
    if (filterType && contract.contractType !== filterType) return false;
    return true;
  });

  return (
    <PermissionGuard requiredPermission="contracts.view">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                Sözleşmeler
              </h1>
              <p className="text-gray-600 mt-2">Müşteri sözleşmelerini yönetin</p>
            </div>
            {canCreate && (
            <button
              onClick={() => router.push('/admin/contracts/new')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Yeni Sözleşme
            </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-600">Toplam</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-600">Taslak</div>
            <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-green-600">Aktif</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-blue-600">Tamamlandı</div>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-red-600">İptal</div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sözleşme no, firma adı ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Tüm Tipler</option>
                <option value="fason_uretim">Fason Üretim (Genel)</option>
                <option value="fason_kozmetik">Fason Kozmetik</option>
                <option value="fason_gida">Fason Gıda</option>
                <option value="fason_temizlik">Fason Temizlik</option>
                <option value="fulfillment">Fulfillment</option>
                <option value="ambalaj">Ambalaj</option>
                <option value="lojistik">Lojistik</option>
                <option value="genel">Genel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
              Yükleniyor...
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Sözleşme bulunamadı</p>
              <button
                onClick={() => router.push('/admin/contracts/new')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                İlk sözleşmeyi oluştur
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sözleşme No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Firma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {contract.contractNumber || 'TASLAK'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {contract.companyInfo?.companyName || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {getContractTypeLabel(contract.contractType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contract.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(contract.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                          <button
                            onClick={() => router.push(`/admin/contracts/${contract.id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                            title="Düzenle"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          )}
                          <ContractPDFExport 
                            contract={contract}
                            onLoadingStart={() => toast({ title: "PDF Hazırlanıyor", description: "Sözleşme PDF'i oluşturuluyor..." })}
                            onLoadingEnd={() => toast({ title: "Başarılı", description: "PDF başarıyla indirildi" })}
                          >
                            <button
                              className="text-purple-600 hover:text-purple-900"
                              title="PDF İndir"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </ContractPDFExport>
                          {canDelete && (
                          <button
                            onClick={() => handleDelete(contract.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Sözleşmeyi Sil
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu sözleşmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PermissionGuard>
  );
}
