"use client";

import { useState, useEffect } from "react";
import AdminProtectedWrapper from "../../../components/admin-protected-wrapper";
import {
  getAllUsers,
  getUserStats,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  createUser,
  USER_ROLES,
  ROLE_LEVELS,
} from "../../../lib/services/admin-user-service";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Settings,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Crown,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {},
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { user: currentUser } = useAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStats(),
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı verileri yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole, currentUser?.role);
      await loadData();
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü güncellendi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, !currentStatus, currentUser?.role);
      await loadData();
      toast({
        title: "Başarılı",
        description: `Kullanıcı ${
          !currentStatus ? "aktifleştirildi" : "devre dışı bırakıldı"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteUser(userId, currentUser?.role);
      await loadData();
      toast({
        title: "Başarılı",
        description: "Kullanıcı silindi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData, currentUser?.role);
      await loadData();
      setShowCreateModal(false);
      toast({
        title: "Başarılı",
        description: "Yeni kullanıcı oluşturuldu.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filtreleme ve sıralama
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "active" && user.isActive !== false) ||
        (selectedStatus === "inactive" && user.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "lastLoginAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [USER_ROLES.SUPER_ADMIN]: "Süper Admin",
      [USER_ROLES.ADMIN]: "Admin",
      [USER_ROLES.MODERATOR]: "Moderatör",
      [USER_ROLES.USER]: "Kullanıcı",
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.SUPER_ADMIN]: "text-purple-600 bg-purple-100",
      [USER_ROLES.ADMIN]: "text-red-600 bg-red-100",
      [USER_ROLES.MODERATOR]: "text-orange-600 bg-orange-100",
      [USER_ROLES.USER]: "text-gray-600 bg-gray-100",
    };
    return colors[role] || "text-gray-600 bg-gray-100";
  };

  const canEditUser = (targetUser) => {
    if (!currentUser?.role) return false;
    return ROLE_LEVELS[currentUser.role] > ROLE_LEVELS[targetUser.role];
  };

  const canDeleteUser = (targetUser) => {
    if (!currentUser?.role) return false;
    if (targetUser.role === USER_ROLES.SUPER_ADMIN) return false;
    return ROLE_LEVELS[currentUser.role] > ROLE_LEVELS[targetUser.role];
  };

  if (loading) {
    return (
      <AdminProtectedWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminProtectedWrapper>
    );
  }

  return (
    <AdminProtectedWrapper title="Kullanıcı Yönetimi">
      <div className="p-6">
        {/* Başlık */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Kullanıcı Yönetimi
              </h1>
              <p className="text-gray-600">
                Kullanıcıları listeleyin, rollerini düzenleyin ve kullanıcı
                hesaplarını yönetin.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Rol: {currentUser?.role === "super_admin" && "Süper Admin"}
              {currentUser?.role === "admin" && "Admin"}
              {currentUser?.role === "moderator" && "Moderatör"}
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Aktif Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Devre Dışı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.byRole[USER_ROLES.SUPER_ADMIN] || 0) +
                    (stats.byRole[USER_ROLES.ADMIN] || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Arama */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Email veya isim ile ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Rol Filtresi */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Tüm Roller</option>
                <option value={USER_ROLES.SUPER_ADMIN}>Süper Admin</option>
                <option value={USER_ROLES.ADMIN}>Admin</option>
                <option value={USER_ROLES.MODERATOR}>Moderatör</option>
                <option value={USER_ROLES.USER}>Kullanıcı</option>
              </select>

              {/* Durum Filtresi */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Devre Dışı</option>
              </select>

              {/* Yeni Kullanıcı Ekle */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Yeni Kullanıcı
              </button>
            </div>
          </div>

          {/* Kullanıcı Listesi */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {user.displayName || "İsimsiz Kullanıcı"}
                            {user.role === USER_ROLES.SUPER_ADMIN && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive !== false
                            ? "text-green-800 bg-green-100"
                            : "text-red-800 bg-red-100"
                        }`}
                      >
                        {user.isActive !== false ? "Aktif" : "Devre Dışı"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt
                        ? user.createdAt.toLocaleDateString("tr-TR")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt
                        ? user.lastLoginAt.toLocaleDateString("tr-TR")
                        : "Hiç"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {canEditUser(user) && (
                          <>
                            {/* Rol Değiştir */}
                            <select
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                            >
                              {Object.entries(USER_ROLES).map(
                                ([key, value]) => {
                                  // Sadece yetkili oluğu rolleri göster
                                  if (
                                    ROLE_LEVELS[currentUser?.role] >
                                    ROLE_LEVELS[value]
                                  ) {
                                    return (
                                      <option key={value} value={value}>
                                        {getRoleDisplayName(value)}
                                      </option>
                                    );
                                  }
                                  return null;
                                }
                              )}
                            </select>

                            {/* Durum Değiştir */}
                            <button
                              onClick={() =>
                                handleStatusToggle(
                                  user.id,
                                  user.isActive !== false
                                )
                              }
                              className={`p-1 rounded ${
                                user.isActive !== false
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                user.isActive !== false
                                  ? "Devre Dışı Bırak"
                                  : "Aktifleştir"
                              }
                            >
                              {user.isActive !== false ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}

                        {canDeleteUser(user) && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Kullanıcıyı Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Kullanıcı bulunamadı
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Arama kriterlerinize uygun kullanıcı bulunamadı.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Yeni Kullanıcı Modal */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateUser}
            currentUserRole={currentUser?.role}
          />
        )}
      </div>
    </AdminProtectedWrapper>
  );
}

// Yeni Kullanıcı Oluşturma Modal'ı
function CreateUserModal({ onClose, onCreate, currentUserRole }) {
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    role: USER_ROLES.USER,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreate(formData);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Yeni Kullanıcı Oluştur
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İsim
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                {Object.entries(USER_ROLES).map(([key, value]) => {
                  if (ROLE_LEVELS[currentUserRole] > ROLE_LEVELS[value]) {
                    return (
                      <option key={value} value={value}>
                        {value === USER_ROLES.SUPER_ADMIN && "Süper Admin"}
                        {value === USER_ROLES.ADMIN && "Admin"}
                        {value === USER_ROLES.MODERATOR && "Moderatör"}
                        {value === USER_ROLES.USER && "Kullanıcı"}
                      </option>
                    );
                  }
                  return null;
                })}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Oluşturuluyor..." : "Oluştur"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
