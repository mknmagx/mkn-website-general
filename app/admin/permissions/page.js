"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  Shield,
  Users,
  Settings,
  Key,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  Lock,
  MessageSquare,
  Building2,
  BarChart3,
  FileText,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import {
  getAllRoles,
  updateRolePermissions,
  getAllPermissions,
  DETAILED_PERMISSIONS,
  PERMISSION_CATEGORIES,
  updateExistingRolesWithBlogPermissions,
  addBlogPermissionsToCollection,
} from "../../../lib/services/admin-permissions-service";

export default function PermissionsPage() {
  const { user: currentUser, userRole } = useAdminAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingBlogPermissions, setUpdatingBlogPermissions] = useState(false);

  // Yetki kontrolü
  const canManagePermissions =
    userRole?.name === "super_admin" ||
    userRole?.id === "super_admin" ||
    userRole?.name === "admin" ||
    userRole?.id === "admin" ||
    currentUser?.email === "mkn.magx@gmail.com";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        getAllRoles(),
        getAllPermissions()
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
        console.log("Firestore'dan alınan yetkiler:", permissionsResult.data);
        console.log("Blog yetkileri:", Object.keys(permissionsResult.data).filter(k => k.startsWith('blog.')));
        setAvailablePermissions(permissionsResult.data);
      } else {
        // Firestore'dan alınamadıysa, DETAILED_PERMISSIONS'ı kullan
        console.warn("Firestore'dan yetkiler alınamadı, DETAILED_PERMISSIONS kullanılıyor");
        console.log("DETAILED_PERMISSIONS blog yetkileri:", Object.keys(DETAILED_PERMISSIONS).filter(k => k.startsWith('blog.')));
        setAvailablePermissions(DETAILED_PERMISSIONS);
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

      const result = await updateRolePermissions(
        selectedRole.id,
        activePermissions
      );

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Yetkiler kaydedildi.",
        });
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

  const updateBlogPermissions = async () => {
    setUpdatingBlogPermissions(true);
    try {
      // Önce permissions koleksiyonuna blog yetkilerini ekle
      const permissionsResult = await addBlogPermissionsToCollection();
      if (!permissionsResult.success) {
        throw new Error("Permissions koleksiyonu güncellenemedi: " + permissionsResult.error);
      }
      
      // Sonra rollere blog yetkilerini ekle
      const rolesResult = await updateExistingRolesWithBlogPermissions();
      if (!rolesResult.success) {
        throw new Error("Roller güncellenemedi: " + rolesResult.error);
      }
      
      toast({
        title: "Başarılı",
        description: "Blog yetkileri başarıyla eklendi ve rollere atandı.",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Blog yetkileri güncellenirken hata: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingBlogPermissions(false);
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'users': return <Users className="h-4 w-4" />;
      case 'contacts': return <MessageSquare className="h-4 w-4" />;
      case 'quotes': return <FileText className="h-4 w-4" />;
      case 'companies': return <Building2 className="h-4 w-4" />;
      case 'content': return <Edit className="h-4 w-4" />;
      case 'blog': return <BookOpen className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'users': return 'text-blue-600 bg-blue-50';
      case 'contacts': return 'text-green-600 bg-green-50';
      case 'quotes': return 'text-orange-600 bg-orange-50';
      case 'companies': return 'text-purple-600 bg-purple-50';
      case 'content': return 'text-pink-600 bg-pink-50';
      case 'blog': return 'text-cyan-600 bg-cyan-50';
      case 'analytics': return 'text-indigo-600 bg-indigo-50';
      case 'system': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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
          <button
            onClick={updateBlogPermissions}
            disabled={updatingBlogPermissions}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
          >
            {updatingBlogPermissions ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Güncelleniyor...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                Blog Yetkileri Ekle
              </>
            )}
          </button>
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
                    <div className={`p-2 rounded-lg ${
                      role.isSystemRole 
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}>
                      {role.isSystemRole ? <Lock className="h-4 w-4" /> : <Key className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {role.userCount} kullanıcı
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
                  <div className={`p-2 rounded-lg ${
                    selectedRole.isSystemRole 
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {selectedRole.isSystemRole ? <Lock className="h-5 w-5" /> : <Key className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedRole.name}
                    </h2>
                    <p className="text-gray-600">{selectedRole.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
                  <div key={category} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                        {getCategoryIcon(category)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {category === 'users' && 'Kullanıcı Yönetimi'}
                        {category === 'contacts' && 'İletişim Yönetimi'}
                        {category === 'quotes' && 'Teklif Yönetimi'}
                        {category === 'companies' && 'Şirket Yönetimi'}
                        {category === 'content' && 'İçerik Yönetimi'}
                        {category === 'blog' && 'Blog Yönetimi'}
                        {category === 'analytics' && 'Analitik & Raporlama'}
                        {category === 'system' && 'Sistem Yönetimi'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {categoryPermissions.map((permission) => {
                        const isActive = permissions[permission.key] || false;

                        return (
                          <div
                            key={permission.key}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {permission.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                  {permission.description}
                                </p>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  {permission.key}
                                </span>
                              </div>

                              {/* Modern Toggle Switch */}
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  onClick={() => togglePermission(permission.key)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    isActive ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg ${
                                      isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                <div className="mt-1 text-center">
                                  <span className={`text-xs font-medium ${
                                    isActive ? 'text-green-600' : 'text-gray-500'
                                  }`}>
                                    {isActive ? 'Aktif' : 'Pasif'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
    </div>
  );
}