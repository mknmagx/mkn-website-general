"use client";

import { useState, useEffect } from "react";
import {
  PermissionGuard,
  RoleGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import {
  getAllUsers,
  getUserStats,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  createUser,
  updateUser,
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
  Building2,
  Activity,
  TrendingUp,
  DollarSign,
  FileText,
} from "lucide-react";

export default function UsersPage() {
  const { user, permissions, userRole } = useAdminAuth();
  const { hasPermission } = usePermissions();
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    user: currentUser,
    permissions: currentUserPermissions,
    loading: authLoading,
  } = useAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && currentUserPermissions) {
      loadData();
    }
  }, [authLoading, currentUserPermissions]);

  const loadData = async () => {
    if (!currentUserPermissions) return;

    setLoading(true);
    try {
      const usersResult = await getAllUsers(currentUserPermissions);
      const statsResult = hasPermission("canViewAnalytics")
        ? await getUserStats(currentUserPermissions)
        : null;

      if (usersResult.success) {
        setUsers(usersResult.users);
      } else {
        throw new Error(usersResult.error);
      }

      if (statsResult && statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Hata",
        description:
          error.message || "Kullanıcı verileri yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const result = await updateUserRole(
        userId,
        newRole,
        permissions,
        userRole
      );
      if (result.success) {
        await loadData();
        toast({
          title: "Başarılı",
          description: result.message,
        });
      } else {
        throw new Error(result.error);
      }
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

  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser(editingUser.id, userData, currentUser?.role);
      await loadData();
      setShowEditModal(false);
      setEditingUser(null);
      toast({
        title: "Başarılı",
        description: "Kullanıcı bilgileri güncellendi.",
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-600">
            Sistem kullanıcılarını ve rollerini yönetin
          </p>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Toplam Kullanıcı
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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

      {/* Şirket/Bölüm Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Bölüm Dağılımı
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ambalaj</span>
              <span className="text-sm font-medium text-gray-900">
                {users.filter((u) => u.company?.division === "ambalaj").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">E-ticaret</span>
              <span className="text-sm font-medium text-gray-900">
                {
                  users.filter((u) => u.company?.division === "ecommerce")
                    .length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fason</span>
              <span className="text-sm font-medium text-gray-900">
                {users.filter((u) => u.company?.division === "fason").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Son Aktivite
          </h3>
          <div className="space-y-3">
            {users
              .filter((u) => u.lastLoginAt)
              .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
              .slice(0, 5)
              .map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600 truncate">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR")
                      : "-"}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Performans Özeti
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ortalama Performans</span>
              <span className="text-sm font-medium text-gray-900">
                {users.length > 0
                  ? (
                      users.reduce(
                        (acc, u) =>
                          acc + (u.performance?.customerSatisfaction || 0),
                        0
                      ) / users.length || 0
                    ).toFixed(1)
                  : "0"}
                /5
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Toplam Satış</span>
              <span className="text-sm font-medium text-gray-900">
                ₺
                {users
                  .reduce(
                    (acc, u) => acc + (u.performance?.salesAchieved || 0),
                    0
                  )
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Sertifikalı Kullanıcı
              </span>
              <span className="text-sm font-medium text-gray-900">
                {users.filter((u) => u.achievements?.length > 0).length}
              </span>
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
                  Şirket/Bölüm
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
                    <div className="text-sm text-gray-900">
                      {user.company?.name || "MKN Group"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.company?.division || "ambalaj"} •{" "}
                      {user.company?.position || "specialist"}
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
                      {/* Görüntüle */}
                      <button
                        onClick={() => {
                          setViewingUser(user);
                          setShowViewModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Kullanıcı Detayları"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {canEditUser(user) && (
                        <>
                          {/* Düzenle */}
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Kullanıcıyı Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* Rol Değiştir */}
                          <div className="relative">
                            <select
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                              title="Rol Değiştir"
                            >
                              {Object.entries(USER_ROLES).map(
                                ([key, value]) => {
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
                          </div>

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

      {/* Kullanıcı Görüntüleme Modal */}
      {showViewModal && viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => {
            setShowViewModal(false);
            setViewingUser(null);
          }}
        />
      )}

      {/* Kullanıcı Düzenleme Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onUpdate={handleUpdateUser}
          currentUserRole={currentUser?.role}
        />
      )}
    </div>
  );
}

// Yeni Kullanıcı Oluşturma Modal'ı
function CreateUserModal({ onClose, onCreate, currentUserRole }) {
  const [formData, setFormData] = useState({
    // Temel Bilgiler
    email: "",
    displayName: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: USER_ROLES.USER,

    // Şirket Bilgileri
    company: {
      name: "MKN Group",
      division: "ambalaj",
      position: "specialist",
      employeeId: "",
      startDate: new Date().toISOString().split("T")[0],
      branch: "istanbul-merkez",
    },

    // Performans Hedefleri
    performance: {
      salesTarget: 50000,
      customerSatisfaction: 4.0,
    },

    // Tercihler
    preferences: {
      language: "tr",
      theme: "light",
      timezone: "Europe/Istanbul",
    },
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // displayName'i otomatik oluştur eğer boşsa
      const processedData = {
        ...formData,
        displayName:
          formData.displayName ||
          `${formData.firstName} ${formData.lastName}`.trim(),
        // Boş alanları temizle
        company: {
          ...formData.company,
          employeeId:
            formData.company.employeeId ||
            `MKN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        },
      };

      await onCreate(processedData);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Yeni Kullanıcı Oluştur
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("basic")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Temel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "company"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Şirket Bilgileri
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "performance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Performans & Hedefler
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "preferences"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Tercihler
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Temel Bilgiler Tab */}
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Adresi *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@mkngroup.com.tr"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+90 555 123 45 67"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
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
                              {value === USER_ROLES.SUPER_ADMIN &&
                                "Süper Admin"}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görünen Ad
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Boş bırakılırsa ad ve soyad birleştirilir
                    </p>
                  </div>
                </div>
              )}

              {/* Şirket Bilgileri Tab */}
              {activeTab === "company" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket Adı
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bölüm *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.division || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            division: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="ambalaj">Ambalaj</option>
                      <option value="ecommerce">E-ticaret</option>
                      <option value="fason">Fason Üretim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pozisyon
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.position || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            position: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="intern">Stajyer</option>
                      <option value="specialist">Uzman</option>
                      <option value="senior">Kıdemli Uzman</option>
                      <option value="manager">Müdür</option>
                      <option value="director">Genel Müdür</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çalışan ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MKN-2024-001"
                      value={formData.company?.employeeId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            employeeId: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşe Başlama Tarihi
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.startDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            startDate: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şube
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.branch || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            branch: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="istanbul-merkez">İstanbul Merkez</option>
                      <option value="istanbul-anadolu">İstanbul Anadolu</option>
                      <option value="ankara">Ankara</option>
                      <option value="izmir">İzmir</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Performans Tab */}
              {activeTab === "performance" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aylık Satış Hedefi (₺)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50000"
                      value={formData.performance?.salesTarget || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          performance: {
                            ...formData.performance,
                            salesTarget: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hedef Müşteri Memnuniyeti (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="4.0"
                      value={formData.performance?.customerSatisfaction || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          performance: {
                            ...formData.performance,
                            customerSatisfaction:
                              parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Tercihler Tab */}
              {activeTab === "preferences" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dil
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.preferences?.language || "tr"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            language: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tema
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.preferences?.theme || "light"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            theme: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="light">Açık</option>
                      <option value="dark">Koyu</option>
                      <option value="auto">Otomatik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saat Dilimi
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={
                        formData.preferences?.timezone || "Europe/Istanbul"
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            timezone: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="Europe/Istanbul">İstanbul</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {activeTab === "basic" && "1/4 - Temel kullanıcı bilgileri"}
            {activeTab === "company" && "2/4 - Şirket ve pozisyon bilgileri"}
            {activeTab === "performance" && "3/4 - Performans hedefleri"}
            {activeTab === "preferences" && "4/4 - Kullanıcı tercihleri"}
          </div>

          <div className="flex gap-3">
            {activeTab !== "basic" && (
              <button
                type="button"
                onClick={() => {
                  const tabs = [
                    "basic",
                    "company",
                    "performance",
                    "preferences",
                  ];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Geri
              </button>
            )}

            {activeTab !== "preferences" ? (
              <button
                type="button"
                onClick={() => {
                  const tabs = [
                    "basic",
                    "company",
                    "performance",
                    "preferences",
                  ];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1)
                    setActiveTab(tabs[currentIndex + 1]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                İleri
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Kullanıcı Oluştur
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Kullanıcı Görüntüleme Modal'ı
function ViewUserModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.displayName ||
                  `${user.firstName} ${user.lastName}` ||
                  "Kullanıcı Detayları"}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("basic")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Temel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "company"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Şirket Bilgileri
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "performance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Performans
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "system"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Sistem Bilgileri
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Temel Bilgiler Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.firstName || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.lastName || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.phoneNumber || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === USER_ROLES.SUPER_ADMIN
                        ? "text-purple-600 bg-purple-100"
                        : user.role === USER_ROLES.ADMIN
                        ? "text-red-600 bg-red-100"
                        : user.role === USER_ROLES.MODERATOR
                        ? "text-orange-600 bg-orange-100"
                        : "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {user.role === USER_ROLES.SUPER_ADMIN && "Süper Admin"}
                    {user.role === USER_ROLES.ADMIN && "Admin"}
                    {user.role === USER_ROLES.MODERATOR && "Moderatör"}
                    {user.role === USER_ROLES.USER && "Kullanıcı"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive !== false
                        ? "text-green-800 bg-green-100"
                        : "text-red-800 bg-red-100"
                    }`}
                  >
                    {user.isActive !== false ? "Aktif" : "Devre Dışı"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kayıt Tarihi
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Son Giriş
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR")
                      : "Hiç"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Şirket Bilgileri Tab */}
          {activeTab === "company" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.company?.name || "MKN Group"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bölüm
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {user.company?.division || "ambalaj"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pozisyon
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {user.company?.position || "specialist"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Çalışan ID
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.company?.employeeId || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşe Başlama
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.company?.startDate
                      ? new Date(user.company.startDate).toLocaleDateString(
                          "tr-TR"
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şube
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.company?.branch || "istanbul-merkez"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Performans Tab */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">
                        Satış Hedefi
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        ₺{(user.performance?.salesTarget || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">
                        Gerçekleşen
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ₺
                        {(
                          user.performance?.salesAchieved || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">
                        Memnuniyet
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {(user.performance?.customerSatisfaction || 0).toFixed(
                          1
                        )}
                        /5
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-900">
                        Teklif Sayısı
                      </p>
                      <p className="text-lg font-bold text-yellow-600">
                        {user.performance?.quotesCreated || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {user.achievements && user.achievements.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Başarılar & Sertifikalar
                  </h4>
                  <div className="space-y-2">
                    {user.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Crown className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {achievement.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {achievement.date} • {achievement.issuer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sistem Bilgileri Tab */}
          {activeTab === "system" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dil Tercihi
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.preferences?.language === "tr" ? "Türkçe" : "English"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tema
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {user.preferences?.theme || "light"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saat Dilimi
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.preferences?.timezone || "Europe/Istanbul"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Son Güncelleme
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString("tr-TR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Çevrimiçi Durumu
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isOnline
                        ? "text-green-800 bg-green-100"
                        : "text-gray-800 bg-gray-100"
                    }`}
                  >
                    {user.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// Kullanıcı Düzenleme Modal'ı
function EditUserModal({ user, onClose, onUpdate, currentUserRole }) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phoneNumber: user.phoneNumber || "",
    role: user.role,
    company: {
      name: user.company?.name || "MKN Group",
      division: user.company?.division || "ambalaj",
      position: user.company?.position || "specialist",
      employeeId: user.company?.employeeId || "",
      startDate: user.company?.startDate || "",
      branch: user.company?.branch || "istanbul-merkez",
    },
    performance: {
      salesTarget: user.performance?.salesTarget || 0,
      customerSatisfaction: user.performance?.customerSatisfaction || 0,
    },
    preferences: {
      language: user.preferences?.language || "tr",
      theme: user.preferences?.theme || "light",
      timezone: user.preferences?.timezone || "Europe/Istanbul",
    },
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(formData);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Kullanıcı Düzenle: {user.displayName || user.email}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("basic")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Temel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "company"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Şirket Bilgileri
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "performance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Performans
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Temel Bilgiler Tab */}
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Adresi
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      value={user.email}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email adresi değiştirilemez
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              {value === USER_ROLES.SUPER_ADMIN &&
                                "Süper Admin"}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görünen Ad
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Şirket Bilgileri Tab */}
              {activeTab === "company" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bölüm
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.division || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            division: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="ambalaj">Ambalaj</option>
                      <option value="ecommerce">E-ticaret</option>
                      <option value="fason">Fason Üretim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pozisyon
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.position || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            position: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="intern">Stajyer</option>
                      <option value="specialist">Uzman</option>
                      <option value="senior">Kıdemli Uzman</option>
                      <option value="manager">Müdür</option>
                      <option value="director">Genel Müdür</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çalışan ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.employeeId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            employeeId: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşe Başlama Tarihi
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.company?.startDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            startDate: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Performans Tab */}
              {activeTab === "performance" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aylık Satış Hedefi (₺)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.performance?.salesTarget || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          performance: {
                            ...formData.performance,
                            salesTarget: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Müşteri Memnuniyeti (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.performance?.customerSatisfaction || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          performance: {
                            ...formData.performance,
                            customerSatisfaction:
                              parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Güncelleniyor...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Güncelle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
