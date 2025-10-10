"use client";

import { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import {
  Plus,
  X,
  Key,
  Users,
  MessageSquare,
  FileText,
  Building2,
  Edit,
  BarChart3,
  Settings,
  AlertCircle,
  Save,
} from "lucide-react";

export default function AddPermissionModal({
  isOpen,
  onClose,
  onPermissionAdded,
  existingPermissions = {},
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    category: "users",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    {
      value: "users",
      label: "Kullanıcı Yönetimi",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      value: "contacts",
      label: "İletişim Yönetimi",
      icon: MessageSquare,
      color: "text-green-600 bg-green-50",
    },
    {
      value: "quotes",
      label: "Teklif Yönetimi",
      icon: FileText,
      color: "text-orange-600 bg-orange-50",
    },
    {
      value: "companies",
      label: "Şirket Yönetimi",
      icon: Building2,
      color: "text-purple-600 bg-purple-50",
    },
    {
      value: "content",
      label: "İçerik Yönetimi",
      icon: Edit,
      color: "text-pink-600 bg-pink-50",
    },
    {
      value: "blog",
      label: "Blog Yönetimi",
      icon: Edit,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      value: "analytics",
      label: "Analitik & Raporlama",
      icon: BarChart3,
      color: "text-blue-600 bg-blue-50",
    },
    {
      value: "system",
      label: "Sistem Yönetimi",
      icon: Settings,
      color: "text-red-600 bg-red-50",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.key.trim()) {
      newErrors.key = "Permission key gereklidir";
    } else if (
      !/^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.key)
    ) {
      newErrors.key = "Key format: category.action (örn: users.view)";
    } else if (existingPermissions[formData.key]) {
      newErrors.key = "Bu permission key zaten mevcut";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Permission adı gereklidir";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Permission adı en az 3 karakter olmalıdır";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Açıklama gereklidir";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Açıklama en az 10 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "category" || field === "name") {
      const category = field === "category" ? value : formData.category;
      const name = field === "name" ? value : formData.name;

      if (category && name) {
        const actionKey = name
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        const generatedKey = `${category}.${actionKey}`;
        setFormData((prev) => ({ ...prev, key: generatedKey }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Hata",
        description: "Lütfen formu doğru şekilde doldurun",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newPermission = {
        key: formData.key.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        createdAt: new Date(),
        isCustom: true, // Custom permission olarak işaretle
      };

      await onPermissionAdded(newPermission);

      toast({
        title: "Başarılı",
        description: "Yeni permission başarıyla eklendi",
      });

      setFormData({
        key: "",
        name: "",
        description: "",
        category: "users",
      });
      setErrors({});
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Permission eklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      category: "users",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Yeni Permission Ekle
              </h2>
              <p className="text-sm text-gray-600">
                Sisteme yeni bir yetki tanımı ekleyin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = formData.category === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      handleInputChange("category", category.value)
                    }
                    className={`p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1 rounded ${
                          isSelected ? category.color : "bg-gray-100"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {category.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permission Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Örn: Kullanıcıları Görüntüle"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Permission Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Key *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => handleInputChange("key", e.target.value)}
              placeholder="Örn: users.view"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm ${
                errors.key ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.key && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.key}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Format: category.action (otomatik oluşturulur)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Bu yetkinin ne için kullanıldığını açıklayın..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 karakter
            </p>
          </div>

          {/* Preview */}
          {formData.name && formData.key && formData.description && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Önizleme:
              </h4>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {formData.name}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.description}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mt-2">
                      {formData.key}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Permission Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
