"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import AddPermissionModal from "../../../components/admin/add-permission-modal";
import { PermissionGuard } from "../../../components/admin-route-guard";
import {
  Shield,
  Users,
  Key,
  Trash2,
  Plus,
  Save,
  Lock,
  Route,
  Folder,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  getAllRoles,
  updateRolePermissions,
  updateRoleAllowedRoutes,
  getAllPermissions,
  createPermission,
  deletePermission,
  getDynamicCategories,
  createPermissionWithCategory,
} from "../../../lib/services/admin-permissions-service";
import { syncUsersWithRole } from "../../../lib/services/sync-service";

export default function PermissionsPage() {
  const {
    user: currentUser,
    userRole,
    permissions: userPermissions,
  } = useAdminAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoriesWithMetadata, setCategoriesWithMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [deletingPermissions, setDeletingPermissions] = useState(new Set());

  const hasPermission = (permission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }
    return userPermissions.includes(permission);
  };

  const canManagePermissions =
    hasPermission("users.manage_permissions") || hasPermission("system.manage");
  const canCreatePermissions =
    hasPermission("users.manage_permissions") || hasPermission("system.manage");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResult, permissionsResult, categoriesResult] =
        await Promise.all([
          getAllRoles(),
          getAllPermissions(),
          getDynamicCategories(),
        ]);

      if (rolesResult.success) {
        setRoles(rolesResult.data);
        if (rolesResult.data.length > 0) {
          setSelectedRole(rolesResult.data[0]);
          const initialPermissions = {};
          rolesResult.data[0].permissions.forEach((perm) => {
            initialPermissions[perm] = true;
          });
          setPermissions(initialPermissions);
        }
      }

      if (permissionsResult.success) {
        setAvailablePermissions(permissionsResult.data);
      } else {
        // Permissions could not be loaded - show toast
        toast({
          title: "Uyarı",
          description: "Permissions yüklenemedi: " + permissionsResult.error,
          variant: "destructive",
        });
        setAvailablePermissions({});
      }

      if (categoriesResult.success) {
        setAvailableCategories(categoriesResult.categories);
        setCategoriesWithMetadata(categoriesResult.data);
      } else {
        // Categories could not be loaded - show toast
        toast({
          title: "Uyarı",
          description: "Kategoriler yüklenemedi: " + categoriesResult.error,
          variant: "destructive",
        });
        setAvailableCategories([]);
        setCategoriesWithMetadata([]);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionKey) => {
    const currentValue = permissions[permissionKey] || false;
    const newValue = !currentValue;

    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: newValue,
    }));

    toast({
      title: newValue ? "Yetki Eklendi" : "Yetki Kaldırıldı",
      description: `${permissionKey} yetkisi ${
        newValue ? "eklendi" : "kaldırıldı"
      }`,
    });
  };

  const savePermissions = async () => {
    if (!selectedRole) {
      toast({
        title: "Hata",
        description: "Lütfen bir rol seçin.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const activePermissions = Object.keys(permissions).filter(
        (key) => permissions[key]
      );

      // 1. Role permissions'ları güncelle
      const result = await updateRolePermissions(
        selectedRole.id,
        activePermissions
      );

      if (result.success) {
        // 2. Bu role sahip tüm kullanıcıları senkronize et
        toast({
          title: "Senkronize Ediliyor...",
          description:
            "Role permissions güncellendi, kullanıcılar senkronize ediliyor...",
        });

        const syncResult = await syncUsersWithRole(
          selectedRole.id,
          activePermissions
        );

        if (syncResult.success) {
          toast({
            title: "Başarılı",
            description: `Yetkiler kaydedildi ve ${syncResult.updatedUsers} kullanıcı senkronize edildi.`,
          });
        } else {
          // Role güncellendi ama sync başarısız
          toast({
            title: "Kısmi Başarı",
            description:
              "Yetkiler kaydedildi ancak kullanıcı senkronizasyonunda hata oluştu: " +
              syncResult.error,
            variant: "destructive",
          });
        }

        await loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kaydetme hatası: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    const rolePermissions = {};
    role.permissions.forEach((perm) => {
      rolePermissions[perm] = true;
    });
    setPermissions(rolePermissions);
  };

  const handleAddPermission = async (permissionData) => {
    try {
      const result = permissionData.isNewCategory
        ? await createPermissionWithCategory(permissionData)
        : await createPermission(permissionData);

      if (result.success) {
        // Veriyi yeniden yükle
        await loadData();

        toast({
          title: "Başarılı",
          description: result.message,
        });

        // Eğer şu anda seçili bir rol varsa ve yeni permission'ı role'e eklemek istiyorsak
        if (selectedRole && permissionData.addToCurrentRole) {
          try {
            // Mevcut role permissions'ına yeni permission'ı ekle
            const updatedPermissions = [
              ...selectedRole.permissions,
              result.permissionKey,
            ];

            toast({
              title: "Role Güncelleniyor...",
              description: "Yeni permission seçili role'e ekleniyor...",
            });

            // Role'ü güncelle
            const roleUpdateResult = await updateRolePermissions(
              selectedRole.id,
              updatedPermissions
            );

            if (roleUpdateResult.success) {
              // Role sahip kullanıcıları senkronize et
              toast({
                title: "Kullanıcılar Senkronize Ediliyor...",
                description:
                  "Role permissions güncellendi, kullanıcılar senkronize ediliyor...",
              });

              const syncResult = await syncUsersWithRole(
                selectedRole.id,
                updatedPermissions
              );

              if (syncResult.success) {
                toast({
                  title: "Tamamen Başarılı",
                  description: `Permission eklendi, role güncellendi ve ${syncResult.updatedUsers} kullanıcı senkronize edildi.`,
                });

                // Local state'i güncelle
                const newPermissions = { ...permissions };
                newPermissions[result.permissionKey] = true;
                setPermissions(newPermissions);

                // Veriyi tekrar yükle
                await loadData();
              } else {
                toast({
                  title: "Kısmi Başarı",
                  description:
                    "Permission eklendi ve role güncellendi ancak kullanıcı senkronizasyonunda hata: " +
                    syncResult.error,
                  variant: "destructive",
                });
              }
            } else {
              toast({
                title: "Role Güncelleme Hatası",
                description:
                  "Permission eklendi ancak role güncellenemedi: " +
                  roleUpdateResult.error,
                variant: "destructive",
              });
            }
          } catch (syncError) {
            toast({
              title: "Senkronizasyon Hatası",
              description:
                "Permission eklendi ancak role senkronizasyonunda hata: " +
                syncError.message,
              variant: "destructive",
            });
          }
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Permission eklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeletePermission = async (permissionKey, permissionData) => {
    if (!canCreatePermissions) {
      toast({
        title: "Hata",
        description: "Permission silme yetkiniz bulunmuyor",
        variant: "destructive",
      });
      return;
    }

    // Custom permission değilse silmeyi engelle
    if (!permissionData.isCustom) {
      toast({
        title: "Hata",
        description: "Sistem permission'ları silinemez",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `"${permissionData.name}" permission'ını silmek istediğinizden emin misiniz?\n\nBu işlem:\n- Permission'ı tamamen silecek\n- Tüm rollerden kaldıracak\n- İlgili kullanıcılardan kaldıracak\n\nBu işlem geri alınamaz!`
    );

    if (!confirmDelete) return;

    setDeletingPermissions((prev) => new Set(prev).add(permissionKey));

    try {
      const result = await deletePermission(permissionKey);

      if (result.success) {
        // Verileri yeniden yükle
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
        description: "Permission silinirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingPermissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(permissionKey);
        return newSet;
      });
    }
  };

  const getDynamicIcon = (iconName) => {
    if (!iconName) return LucideIcons.Key;

    // Lucide icon'lardan dinamik olarak getir
    const IconComponent = LucideIcons[iconName];

    if (IconComponent) {
      return IconComponent;
    } else {
      console.warn(`Icon bulunamadı: ${iconName}, Key icon kullanılıyor`);
      return LucideIcons.Key;
    }
  };

  const getCategoryIcon = (category) => {
    // Önce metadata'dan bul
    const categoryMeta = categoriesWithMetadata.find(
      (cat) => cat.value === category
    );
    if (categoryMeta) {
      // Found category metadata
      return getDynamicIcon(categoryMeta.icon);
    }

    // Fallback için eski sistem
    const fallbackIcons = {
      users: "Users",
      contacts: "MessageSquare",
      quotes: "FileText",
      companies: "Building",
      content: "FileText",
      blog: "Edit",
      analytics: "BarChart",
      system: "Settings",
      packaging: "Package",
    };

    return getDynamicIcon(fallbackIcons[category] || "Key");
  };

  const getCategoryColor = (category) => {
    // Önce metadata'dan bul
    const categoryMeta = categoriesWithMetadata.find(
      (cat) => cat.value === category
    );
    if (categoryMeta) {
      return categoryMeta.color;
    }

    // Fallback için eski sistem
    switch (category) {
      case "users":
        return "text-blue-600 bg-blue-50";
      case "contacts":
        return "text-green-600 bg-green-50";
      case "quotes":
        return "text-orange-600 bg-orange-50";
      case "companies":
        return "text-purple-600 bg-purple-50";
      case "content":
        return "text-pink-600 bg-pink-50";
      case "blog":
        return "text-indigo-600 bg-indigo-50";
      case "analytics":
        return "text-indigo-600 bg-indigo-50";
      case "system":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const groupPermissionsByCategory = () => {
    const grouped = {};
    Object.entries(availablePermissions).forEach(([key, permission]) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push({ key, ...permission });
    });
    return grouped;
  };

  if (!canManagePermissions) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Yetkisiz Erişim
          </h2>
          <p className="text-red-600">
            Bu sayfayı görüntüleme yetkiniz bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="users.manage_permissions">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Yetki Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">
              Kullanıcı rollerini ve yetkilerini yönetin
            </p>
          </div>
          <div className="flex gap-3">
            {canCreatePermissions && (
              <button
                onClick={() => setShowAddPermissionModal(true)}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Permission Ekle
              </button>
            )}
            <button
              onClick={savePermissions}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Roller */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Roller ({roles.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => selectRole(role)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedRole?.id === role.id
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          role.isSystemRole
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {role.isSystemRole ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Key className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {role.userCount} kullanıcı
                        </div>
                        <div className="mt-2 flex gap-1">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRole(role);
                              setShowRoutesModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors cursor-pointer"
                          >
                            <Route className="h-3 w-3" />
                            Rotalar ({role.allowedRoutes?.length || 0})
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Yetkiler */}
          <div className="lg:col-span-3">
            {selectedRole ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedRole.isSystemRole
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {selectedRole.isSystemRole ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Key className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedRole.name}
                      </h2>
                      <p className="text-gray-600">
                        {selectedRole.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {Object.entries(groupPermissionsByCategory()).map(
                    ([category, categoryPermissions]) => (
                      <div key={category} className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className={`p-2 rounded-lg ${getCategoryColor(
                              category
                            )}`}
                          >
                            {React.createElement(getCategoryIcon(category), {
                              className: "h-4 w-4",
                            })}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {categoriesWithMetadata.find(
                              (cat) => cat.value === category
                            )?.label ||
                              category.charAt(0).toUpperCase() +
                                category.slice(1).replace(/_/g, " ")}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {categoryPermissions.map((permission) => {
                            const isActive =
                              permissions[permission.key] || false;
                            const isDeleting = deletingPermissions.has(
                              permission.key
                            );

                            return (
                              <div
                                key={permission.key}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900">
                                        {permission.name}
                                      </h4>
                                      {permission.isCustom && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                          Özel
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {permission.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        {permission.key}
                                      </span>
                                      {canCreatePermissions &&
                                        permission.isCustom && (
                                          <button
                                            onClick={() =>
                                              handleDeletePermission(
                                                permission.key,
                                                permission
                                              )
                                            }
                                            disabled={isDeleting}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                                          >
                                            {isDeleting ? (
                                              <>
                                                <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent"></div>
                                                Siliniyor
                                              </>
                                            ) : (
                                              <>
                                                <Trash2 className="h-3 w-3" />
                                                Sil
                                              </>
                                            )}
                                          </button>
                                        )}
                                    </div>
                                  </div>

                                  {/* Modern Toggle Switch */}
                                  <div className="ml-4 flex-shrink-0">
                                    <button
                                      onClick={() =>
                                        togglePermission(permission.key)
                                      }
                                      disabled={isDeleting}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                                        isActive
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg ${
                                          isActive
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                        }`}
                                      />
                                    </button>
                                    <div className="mt-1 text-center">
                                      <span
                                        className={`text-xs font-medium ${
                                          isActive
                                            ? "text-green-600"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {isActive ? "Aktif" : "Pasif"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Rol Seçin
                </h3>
                <p className="text-gray-600">
                  Yetkileri görüntülemek için sol taraftan bir rol seçin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Permission Modal */}
        <AddPermissionModal
          isOpen={showAddPermissionModal}
          onClose={() => setShowAddPermissionModal(false)}
          onPermissionAdded={handleAddPermission}
          existingPermissions={availablePermissions}
          availableCategories={availableCategories}
          categoriesWithMetadata={categoriesWithMetadata}
          selectedRole={selectedRole}
        />

        {/* Allowed Routes Modal */}
        <AllowedRoutesModal
          isOpen={showRoutesModal}
          onClose={() => setShowRoutesModal(false)}
          role={selectedRole}
          onRoutesUpdated={loadData}
        />
      </div>
    </PermissionGuard>
  );
}

// AllowedRoutesModal Component
function AllowedRoutesModal({ isOpen, onClose, role, onRoutesUpdated }) {
  const { toast } = useToast();
  const [routes, setRoutes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newRoute, setNewRoute] = useState("");

  useEffect(() => {
    if (role) {
      setRoutes(role.allowedRoutes || []);
    }
  }, [role]);

  const addRoute = () => {
    if (!newRoute.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir rota seçin.",
        variant: "destructive",
      });
      return;
    }

    if (routes.includes(newRoute)) {
      toast({
        title: "Hata",
        description: "Bu rota zaten ekli.",
        variant: "destructive",
      });
      return;
    }

    setRoutes((prev) => [...prev, newRoute]);
    setNewRoute("");

    toast({
      title: "Rota Eklendi",
      description: `${newRoute} rotası eklendi.`,
    });
  };

  const removeRoute = (routeToRemove) => {
    setRoutes((prev) => prev.filter((route) => route !== routeToRemove));

    toast({
      title: "Rota Kaldırıldı",
      description: `${routeToRemove} rotası kaldırıldı.`,
    });
  };

  const saveRoutes = async () => {
    if (!role) return;

    setSaving(true);
    try {
      const result = await updateRoleAllowedRoutes(role.id, routes);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Rotalar başarıyla güncellendi.",
        });
        onRoutesUpdated();
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rotalar kaydedilirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.name} - Erişim Rotaları
                </h3>
                <p className="text-sm text-gray-600">
                  Bu rolün erişebileceği admin sayfalarını yönetin
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Add New Route */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Yeni Rota Ekle</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                placeholder="Rota yazın... (örn: /admin/custom-page)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={addRoute}
                disabled={!newRoute.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Current Routes */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Mevcut Rotalar ({routes.length})
            </h4>
            {routes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Route className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz rota eklenmemiş</p>
              </div>
            ) : (
              <div className="space-y-2">
                {routes.map((route) => (
                  <div
                    key={route}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-green-600" />
                      <span className="font-mono text-sm text-gray-700">
                        {route}
                      </span>
                    </div>
                    <button
                      onClick={() => removeRoute(route)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Rotayı Kaldır"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={saveRoutes}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
