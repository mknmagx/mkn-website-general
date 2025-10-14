"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import {
  getUserById,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  USER_ROLES,
} from "../../../../lib/services/admin-user-service";
import { ROLE_LEVELS } from "../../../../lib/services/admin-permissions-service";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  Save,
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  AlertTriangle,
  Edit,
} from "lucide-react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: USER_ROLES.USER,
    isActive: true,
  });

  const { user: currentUser } = useAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
      setFormData({
        displayName: userData.displayName || "",
        email: userData.email || "",
        role: userData.role || USER_ROLES.USER,
        isActive: userData.isActive !== false,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcı bilgileri yüklenirken hata oluştu.",
        variant: "destructive",
      });
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(userId, formData, currentUser?.role);
      await loadUser();
      setIsEditing(false);
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
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      await toggleUserStatus(userId, !user.isActive, currentUser?.role);
      await loadUser();
      toast({
        title: "Başarılı",
        description: `Kullanıcı ${
          !user.isActive ? "aktifleştirildi" : "devre dışı bırakıldı"
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

  const handleDelete = async () => {
    if (
      !confirm(
        "Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId, currentUser?.role);
      toast({
        title: "Başarılı",
        description: "Kullanıcı silindi.",
      });
      router.push("/admin/users");
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const canEdit = () => {
    if (!currentUser?.role || !user?.role) return false;
    return ROLE_LEVELS[currentUser.role] > ROLE_LEVELS[user.role];
  };

  const canDelete = () => {
    if (!currentUser?.role || !user?.role) return false;
    if (user.role === USER_ROLES.SUPER_ADMIN) return false;
    return ROLE_LEVELS[currentUser.role] > ROLE_LEVELS[user.role];
  };

  if (loading) {
    return (
      <PermissionGuard requiredPermission="users.view">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PermissionGuard>
    );
  }

  if (!user) {
    return (
      <PermissionGuard requiredPermission="users.view">
        <div className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Kullanıcı Bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Aradığınız kullanıcı bulunamadı veya erişim yetkiniz yok.
            </p>
            <Link
              href="/admin/users"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kullanıcı Listesine Dön
            </Link>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="users.view">
      <div className="p-6">
        {/* Başlık ve Navigasyon */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/users"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {user.displayName || "İsimsiz Kullanıcı"}
                {user.role === USER_ROLES.SUPER_ADMIN && (
                  <Crown className="h-6 w-6 text-yellow-500" />
                )}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Durum ve İşlem Butonları */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(
                  user.role
                )}`}
              >
                {getRoleDisplayName(user.role)}
              </span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.isActive !== false
                    ? "text-green-800 bg-green-100"
                    : "text-red-800 bg-red-100"
                }`}
              >
                {user.isActive !== false ? "Aktif" : "Devre Dışı"}
              </span>
            </div>

            {canEdit() && (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Düzenle
                    </button>
                    <button
                      onClick={handleStatusToggle}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        user.isActive !== false
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.isActive !== false ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {user.isActive !== false
                        ? "Devre Dışı Bırak"
                        : "Aktifleştir"}
                    </button>
                    {canDelete() && (
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          displayName: user.displayName || "",
                          email: user.email || "",
                          role: user.role || USER_ROLES.USER,
                          isActive: user.isActive !== false,
                        });
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Bilgiler */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Kullanıcı Bilgileri
                </h2>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İsim
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
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
                        {Object.entries(USER_ROLES)
                          .map(([key, value]) => {
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
                          })
                          .filter(Boolean)}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Aktif kullanıcı
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          İsim
                        </p>
                        <p className="text-gray-900">
                          {user.displayName || "Belirtilmemiş"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Email
                        </p>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rol</p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Yan Panel - İstatistikler */}
          <div className="space-y-6">
            {/* Tarih Bilgileri */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Tarih Bilgileri
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Kayıt Tarihi
                    </p>
                    <p className="text-sm text-gray-900">
                      {user.createdAt
                        ? user.createdAt.toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Belirtilmemiş"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Son Giriş
                    </p>
                    <p className="text-sm text-gray-900">
                      {user.lastLoginAt
                        ? user.lastLoginAt.toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Hiç giriş yapmamış"}
                    </p>
                  </div>
                </div>

                {user.updatedAt && (
                  <div className="flex items-center gap-3">
                    <Edit className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Son Güncelleme
                      </p>
                      <p className="text-sm text-gray-900">
                        {user.updatedAt.toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hızlı İşlemler */}
            {canEdit() && !isEditing && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Hızlı İşlemler
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    onClick={handleStatusToggle}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                      user.isActive !== false
                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {user.isActive !== false ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {user.isActive !== false
                      ? "Devre Dışı Bırak"
                      : "Aktifleştir"}
                  </button>

                  {canDelete() && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Kullanıcıyı Sil
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
