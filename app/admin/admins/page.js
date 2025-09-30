"use client";

import { useState, useEffect } from "react";
import { RoleGuard, usePermissions } from "../../../components/admin-route-guard";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { 
  getAdminUsers, 
  updateUserRole, 
  toggleUserStatus, 
  createAdminUser,
  getUserStats,
  USER_ROLES 
} from "../../../lib/services/admin-user-service";
import { 
  Shield, 
  UserPlus, 
  Settings, 
  Crown, 
  AlertTriangle,
  Users,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter
} from "lucide-react";

export default function AdminManagementPage() {
  const { user, permissions, userRole } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load admin users
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const result = await getAdminUsers(permissions);
      if (result.success) {
        setAdmins(result.users);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Admin kullanıcıları yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const result = await updateUserRole(userId, newRole, permissions, userRole);
      if (result.success) {
        setSuccess(result.message);
        loadAdmins();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Rol güncellenirken hata oluştu.");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const result = await toggleUserStatus(userId, !currentStatus, permissions);
      if (result.success) {
        setSuccess(result.message);
        loadAdmins();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Durum güncellenirken hata oluştu.");
    }
  };

  // Filter admins based on search and filters
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && admin.isActive !== false) ||
                         (statusFilter === "inactive" && admin.isActive === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case USER_ROLES.ADMIN:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case USER_ROLES.MODERATOR:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return "Süper Admin";
      case USER_ROLES.ADMIN:
        return "Admin";
      case USER_ROLES.MODERATOR:
        return "Moderatör";
      default:
        return "Kullanıcı";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return <Crown className="w-4 h-4" />;
      case USER_ROLES.ADMIN:
        return <Shield className="w-4 h-4" />;
      case USER_ROLES.MODERATOR:
        return <Settings className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[USER_ROLES.SUPER_ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Crown className="w-8 h-8 text-purple-600 mr-3" />
              Admin Yönetimi
            </h1>
            <p className="text-gray-600">Sadece süper admin erişimi - Admin kullanıcılarını yönetin</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Yeni Admin Ekle
          </button>
        </div>

        {/* Warning Card */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Dikkat:</strong> Bu bölüm sadece süper admin kullanıcıları tarafından erişilebilir. 
                Admin rollerini değiştirirken dikkatli olun.
              </p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Süper Adminler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.role === USER_ROLES.SUPER_ADMIN).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Adminler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.role === USER_ROLES.ADMIN).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Moderatörler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.role === USER_ROLES.MODERATOR).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Admin ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Tüm Roller</option>
              <option value={USER_ROLES.SUPER_ADMIN}>Süper Admin</option>
              <option value={USER_ROLES.ADMIN}>Admin</option>
              <option value={USER_ROLES.MODERATOR}>Moderatör</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Kullanıcısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {admin.displayName?.charAt(0)?.toUpperCase() ||
                             admin.email?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.displayName || "İsimsiz Admin"}
                          </div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(admin.role)}`}>
                        {getRoleIcon(admin.role)}
                        <span className="ml-1">{getRoleDisplayName(admin.role)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {admin.isActive !== false ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.lastLoginAt?.toDate?.()?.toLocaleDateString("tr-TR") || "Hiç giriş yapmamış"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Role Change */}
                        <select
                          value={admin.role}
                          onChange={(e) => handleRoleUpdate(admin.id, e.target.value)}
                          disabled={admin.id === user?.uid}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                        >
                          <option value={USER_ROLES.MODERATOR}>Moderatör</option>
                          <option value={USER_ROLES.ADMIN}>Admin</option>
                          <option value={USER_ROLES.SUPER_ADMIN}>Süper Admin</option>
                        </select>

                        {/* Status Toggle */}
                        <button
                          onClick={() => handleStatusToggle(admin.id, admin.isActive !== false)}
                          disabled={admin.id === user?.uid}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title={admin.isActive !== false ? "Pasif Yap" : "Aktif Yap"}
                        >
                          {admin.isActive !== false ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAdmins.length === 0 && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Admin bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Arama kriterlerinize uygun admin kullanıcısı bulunamadı.
              </p>
            </div>
          )}
        </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
          <CreateAdminModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadAdmins();
              setSuccess("Admin kullanıcısı başarıyla oluşturuldu.");
            }}
            permissions={permissions}
            currentUserRole={userRole}
          />
        )}
      </div>
    </RoleGuard>
  );
}

// Create Admin Modal Component (Same as before but with purple theme)
function CreateAdminModal({ onClose, onSuccess, permissions, currentUserRole }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    role: USER_ROLES.MODERATOR,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createAdminUser(formData, permissions, currentUserRole);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Admin kullanıcısı oluşturulurken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Crown className="w-5 h-5 text-purple-600 mr-2" />
          Yeni Admin Kullanıcısı
        </h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Görünen İsim
            </label>
            <input
              type="text"
              id="displayName"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Admin Rolü
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={USER_ROLES.MODERATOR}>Moderatör</option>
              <option value={USER_ROLES.ADMIN}>Admin</option>
              <option value={USER_ROLES.SUPER_ADMIN}>Süper Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}