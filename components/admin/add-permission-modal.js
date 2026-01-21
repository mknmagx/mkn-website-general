"use client";

import React, { useState } from "react";
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
import * as LucideIcons from "lucide-react";

export default function AddPermissionModal({
  isOpen,
  onClose,
  onPermissionAdded,
  existingPermissions = {},
  availableCategories = [],
  categoriesWithMetadata = [],
  selectedRole = null,
}) {
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      category: "general",
      customCategory: "",
      customCategoryLabel: "",
      customIcon: "",
      customColor: "",
      isNewCategory: false,
      addToCurrentRole: false,
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    category: "general",
    customCategory: "",
    customCategoryLabel: "",
    customIcon: "",
    customColor: "",
    isNewCategory: false,
    addToCurrentRole: false,
  });

  // Dinamik icon resolver fonksiyonu
  const getDynamicIcon = (iconName) => {
    if (!iconName) return LucideIcons.Key;

    const IconComponent = LucideIcons[iconName];

    if (IconComponent) {
      return IconComponent;
    } else {
      console.warn(`Icon bulunamadı: ${iconName}, Key icon kullanılıyor`);
      return LucideIcons.Key;
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const defaultCategories = [
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

  const allCategories = (() => {
    if (categoriesWithMetadata.length > 0) {
      const dynamicCategories = categoriesWithMetadata.map((cat) => ({
        value: cat.value,
        label: cat.label,
        icon: getDynamicIcon(cat.icon),
        color: cat.color,
      }));

      const existingValues = new Set(dynamicCategories.map((cat) => cat.value));
      const missingDefaults = defaultCategories.filter(
        (cat) => !existingValues.has(cat.value)
      );

      return [...dynamicCategories, ...missingDefaults];
    } else {
      return defaultCategories;
    }
  })();

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

    if (formData.isNewCategory) {
      if (!formData.customCategory.trim()) {
        newErrors.customCategory = "Kategori key gereklidir";
      } else if (formData.customCategory.trim().length < 2) {
        newErrors.customCategory = "Kategori key en az 2 karakter olmalıdır";
      } else if (
        !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.customCategory.trim())
      ) {
        newErrors.customCategory =
          "Kategori key sadece harf, rakam ve _ içerebilir";
      }

      // Kategori label kontrolü
      if (!formData.customCategoryLabel.trim()) {
        newErrors.customCategoryLabel = "Kategori adı gereklidir";
      } else if (formData.customCategoryLabel.trim().length < 2) {
        newErrors.customCategoryLabel =
          "Kategori adı en az 2 karakter olmalıdır";
      }

      // Icon kontrolü
      if (!formData.customIcon.trim()) {
        newErrors.customIcon = "Icon adı gereklidir";
      } else {
        // Icon'un Lucide'da var olup olmadığını kontrol et
        const IconComponent = LucideIcons[formData.customIcon.trim()];
        if (!IconComponent) {
          newErrors.customIcon = "Geçersiz Lucide icon adı";
        }
      }

      // Renk kontrolü
      if (!formData.customColor.trim()) {
        newErrors.customColor = "Renk seçimi gereklidir";
      }
    } else if (!formData.category) {
      newErrors.category = "Kategori seçimi gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Kategori label değiştiğinde key'i otomatik oluştur
    if (field === "customCategoryLabel" && formData.isNewCategory) {
      const autoKey = value
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "") // Özel karakterleri temizle
        .replace(/\s+/g, "_") // Boşlukları _ ile değiştir
        .replace(/^_+|_+$/g, ""); // Başta ve sondaki _'leri temizle

      setFormData((prev) => ({
        ...prev,
        [field]: value,
        customCategory: autoKey,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Kategori değiştiğinde key'i güncelle
    if (
      field === "category" ||
      field === "customCategory" ||
      field === "name" ||
      field === "isNewCategory"
    ) {
      const currentCategory =
        field === "isNewCategory" && value
          ? formData.customCategory
          : field === "category"
          ? value
          : field === "customCategory" && formData.isNewCategory
          ? value
          : formData.isNewCategory
          ? formData.customCategory
          : formData.category;

      const currentName = field === "name" ? value : formData.name;

      if (currentCategory && currentName) {
        const actionKey = currentName
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        const generatedKey = `${currentCategory}.${actionKey}`;
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
      const finalCategory = formData.isNewCategory
        ? formData.customCategory.trim()
        : formData.category;

      let categoryLabel = "";
      let icon = "";
      let color = "";
      if (!formData.isNewCategory) {
        const selectedCat = allCategories.find(
          (cat) => cat.value === finalCategory
        );
        if (selectedCat) {
          categoryLabel = selectedCat.label;
          icon =
            typeof selectedCat.icon === "string"
              ? selectedCat.icon
              : selectedCat.icon?.name || "";
          color = selectedCat.color;
        }
        const existingPerm = Object.values(existingPermissions).find(
          (p) =>
            p.category === finalCategory && p.categoryLabel && p.icon && p.color
        );
        if (existingPerm) {
          categoryLabel = existingPerm.categoryLabel;
          icon = existingPerm.icon;
          color = existingPerm.color;
        }
      } else {
        categoryLabel = formData.customCategoryLabel.trim();
        icon = formData.customIcon.trim();
        color = formData.customColor.trim();
      }

      const newPermission = {
        key: formData.key.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: finalCategory,
        createdAt: new Date(),
        isCustom: true,
        isNewCategory: formData.isNewCategory,
        categoryLabel,
        icon,
        color,
        addToCurrentRole: formData.addToCurrentRole,
      };

      await onPermissionAdded(newPermission);

      toast({
        title: "Başarılı",
        description: `Yeni permission ${
          formData.isNewCategory ? "ve kategori" : ""
        } başarıyla eklendi`,
      });

      resetForm();
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
    resetForm();
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

            {/* Kategori Türü Seçimi */}
            <div className="mb-4 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="categoryType"
                  checked={!formData.isNewCategory}
                  onChange={() => handleInputChange("isNewCategory", false)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Mevcut Kategori</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="categoryType"
                  checked={formData.isNewCategory}
                  onChange={() => handleInputChange("isNewCategory", true)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">
                  Yeni Kategori Oluştur
                </span>
              </label>
            </div>

            {formData.isNewCategory ? (
              /* Yeni Kategori Input */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Key *
                    </label>
                    <input
                      type="text"
                      value={formData.customCategory}
                      onChange={(e) =>
                        handleInputChange("customCategory", e.target.value)
                      }
                      placeholder="inventory, marketing, logistics"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.customCategory
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.customCategory && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.customCategory}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Teknik isim: küçük harf, rakam ve _
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.customCategoryLabel}
                      onChange={(e) =>
                        handleInputChange("customCategoryLabel", e.target.value)
                      }
                      placeholder="Envanter Yönetimi, Pazarlama, Lojistik"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.customCategoryLabel
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.customCategoryLabel && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.customCategoryLabel}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Görünen isim: kullanıcı dostu
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (Lucide)
                    </label>
                    <input
                      type="text"
                      value={formData.customIcon}
                      onChange={(e) =>
                        handleInputChange("customIcon", e.target.value)
                      }
                      placeholder="Icon adı (örn: Package, Truck, Store)"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.customIcon ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.customIcon && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.customIcon}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      <a
                        href="https://lucide.dev/icons/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Lucide icon listesi
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renk Sınıfı
                    </label>
                    <select
                      value={formData.customColor}
                      onChange={(e) =>
                        handleInputChange("customColor", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.customColor
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Renk seç...</option>
                      <option value="text-blue-600 bg-blue-50">Mavi</option>
                      <option value="text-green-600 bg-green-50">Yeşil</option>
                      <option value="text-purple-600 bg-purple-50">Mor</option>
                      <option value="text-orange-600 bg-orange-50">
                        Turuncu
                      </option>
                      <option value="text-teal-600 bg-teal-50">Teal</option>
                      <option value="text-pink-600 bg-pink-50">Pembe</option>
                      <option value="text-red-600 bg-red-50">Kırmızı</option>
                      <option value="text-indigo-600 bg-indigo-50">
                        İndigo
                      </option>
                      <option value="text-yellow-600 bg-yellow-50">Sarı</option>
                      <option value="text-gray-600 bg-gray-50">Gri</option>
                    </select>
                    {errors.customColor && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.customColor}
                      </div>
                    )}
                  </div>
                </div>

                {/* Icon Preview */}
                {(formData.customIcon || formData.customCategoryLabel) && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Önizleme:</span>
                    {formData.customIcon &&
                      React.createElement(getDynamicIcon(formData.customIcon), {
                        className: `h-5 w-5 ${
                          formData.customColor || "text-gray-600"
                        }`,
                      })}
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        formData.customColor || "text-gray-600 bg-gray-50"
                      }`}
                    >
                      {formData.customCategoryLabel ||
                        formData.customCategory ||
                        "Kategori"}
                    </span>
                    {formData.customCategory && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        key: {formData.customCategory}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Mevcut Kategoriler */
              <div className="grid grid-cols-2 gap-3">
                {allCategories.map((category) => {
                  const isSelected =
                    formData.category === category.value &&
                    !formData.isNewCategory;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        handleInputChange("category", category.value);
                        handleInputChange("isNewCategory", false);
                      }}
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
                          {React.createElement(category.icon, {
                            className: "h-4 w-4",
                          })}
                        </div>
                        <span className="text-sm font-medium">
                          {category.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {errors.category && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.category}
              </div>
            )}
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

          {/* Add to Current Role Option */}
          {selectedRole && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.addToCurrentRole}
                  onChange={(e) =>
                    handleInputChange("addToCurrentRole", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="font-medium text-blue-900">
                    Bu permission'ı "{selectedRole.name}" rolüne ekle
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    Permission oluşturulduktan sonra otomatik olarak seçili role
                    eklenir ve bu role sahip kullanıcılar senkronize edilir.
                  </p>
                </div>
              </label>
            </div>
          )}

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
