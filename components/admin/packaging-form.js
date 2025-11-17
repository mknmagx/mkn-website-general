"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  packagingService,
  categoryService,
} from "@/lib/services/packaging-service";
import { createProductSlug } from "@/utils/slugify-tr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Upload, Save, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PackagingForm({ productId, onSuccess }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(!!productId);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    description: "",
    inStock: true,
    specifications: {
      size: "",
      debit: "",
      lockType: "",
      material: "",
    },
    colors: [""],
    images: [],
    customFields: {},
    business: {
      minOrderQuantity: "",
      leadTime: "",
      price: "",
      currency: "TRY",
      availability: "in-stock",
      priceRanges: [
        {
          minQuantity: 50,
          maxQuantity: 500,
          price: "",
          currency: "TRY",
        },
        {
          minQuantity: 500,
          maxQuantity: 2000,
          price: "",
          currency: "TRY",
        },
        {
          minQuantity: 2000,
          maxQuantity: 5000,
          price: "",
          currency: "TRY",
        },
      ],
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [""],
      slug: "",
    },
  });

  // Load categories and product data if editing
  useEffect(() => {
    loadInitialData();
  }, [productId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);

      // Load product data if editing
      if (productId) {
        const productData = await packagingService.getProductById(productId);
        setFormData({
          name: productData.name || "",
          code: productData.code || "",
          category: productData.category || "",
          description: productData.description || "",
          inStock: productData.inStock ?? true,
          specifications: {
            size: productData.specifications?.size || "",
            debit: productData.specifications?.debit || "",
            lockType: productData.specifications?.lockType || "",
            material: productData.specifications?.material || "",
            ...productData.specifications, // Mevcut tüm specifications'ları koru
          },
          colors:
            Array.isArray(productData.colors) && productData.colors.length > 0
              ? [...productData.colors]
              : [""],
          images: Array.isArray(productData.images)
            ? [...productData.images]
            : [],
          customFields: productData.customFields
            ? { ...productData.customFields }
            : {},
          business: {
            minOrderQuantity: productData.business?.minOrderQuantity || "",
            leadTime: productData.business?.leadTime || "",
            price: productData.business?.price || "",
            currency: productData.business?.currency || "TRY",
            availability: productData.business?.availability || "in-stock",
            priceRanges:
              Array.isArray(productData.business?.priceRanges) &&
              productData.business.priceRanges.length > 0
                ? [...productData.business.priceRanges]
                : [
                    {
                      minQuantity: 50,
                      maxQuantity: 500,
                      price: "",
                      currency: "TRY",
                    },
                    {
                      minQuantity: 500,
                      maxQuantity: 2000,
                      price: "",
                      currency: "TRY",
                    },
                    {
                      minQuantity: 2000,
                      maxQuantity: 5000,
                      price: "",
                      currency: "TRY",
                    },
                  ],
            ...productData.business, // Mevcut tüm business field'larını koru
          },
          seo: {
            metaTitle: productData.seo?.metaTitle || "",
            metaDescription: productData.seo?.metaDescription || "",
            keywords:
              Array.isArray(productData.seo?.keywords) &&
              productData.seo.keywords.length > 0
                ? [...productData.seo.keywords]
                : [""],
            slug: productData.seo?.slug || "",
            ...productData.seo, // Mevcut tüm seo field'larını koru
          },
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Ürün adı değiştiğinde seçili dosyaları temizle
    if (field === "name" && selectedFiles.length > 0) {
      setSelectedFiles([]);
      setImagePreview([]);
    }
  };

  const handleSpecificationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }));
  };

  const handleBusinessChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value,
      },
    }));
  };

  const handlePriceRangeChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        priceRanges: prev.business.priceRanges.map((range, i) =>
          i === index ? { ...range, [field]: value } : range
        ),
      },
    }));
  };

  const addPriceRange = () => {
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        priceRanges: [
          ...prev.business.priceRanges,
          {
            minQuantity: "",
            maxQuantity: "",
            price: "",
            currency: formData.business.currency,
          },
        ],
      },
    }));
  };

  const removePriceRange = (index) => {
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        priceRanges: prev.business.priceRanges.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSeoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  };

  // Auto-generate slug when name, size, or code changes
  const generateSlug = () => {
    const tempProduct = {
      name: formData.name,
      code: formData.code,
      specifications: { size: formData.specifications.size },
    };
    return createProductSlug(tempProduct);
  };

  // Auto-update slug when relevant fields change
  useEffect(() => {
    if (formData.name || formData.code || formData.specifications.size) {
      const newSlug = generateSlug();
      if (newSlug !== formData.seo.slug) {
        handleSeoChange("slug", newSlug);
      }
    }
  }, [formData.name, formData.code, formData.specifications.size]);

  // Handle array fields (colors, images, seo.keywords)
  const handleArrayFieldAdd = (field) => {
    if (field === "seo.keywords") {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, ""],
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], ""],
      }));
    }
  };

  const handleArrayFieldRemove = (field, index) => {
    if (field === "seo.keywords") {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: prev.seo.keywords.filter((_, i) => i !== index),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    if (field === "seo.keywords") {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: prev.seo.keywords.map((item, i) =>
            i === index ? value : item
          ),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].map((item, i) => (i === index ? value : item)),
      }));
    }
  };

  // Görsel dosyası seçme
  const handleFileSelect = (e) => {
    // Eski önizlemeleri temizle
    imagePreview.forEach((url) => URL.revokeObjectURL(url));

    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Önizleme için URL'ler oluştur
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  // Component unmount olduğunda URL'leri temizle
  useEffect(() => {
    return () => {
      imagePreview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreview]);

  // Görsel kaldırma
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Seçili dosyayı kaldırma
  const removeSelectedFile = (index) => {
    // URL'i temizle
    URL.revokeObjectURL(imagePreview[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "Ürün adı zorunludur",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.code.trim()) {
      toast({
        title: "Hata",
        description: "Ürün kodu zorunludur",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Hata",
        description: "Kategori seçimi zorunludur",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Clean up empty array fields (görsel isimleri henüz boş bırak)
      const cleanedData = {
        ...formData,
        colors: formData.colors.filter((color) => color.trim()),
        images: [], // Başlangıçta boş, görseller yüklendikten sonra güncellenecek
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.filter((keyword) => keyword.trim()),
        },
      };

      let currentProductId = null;
      let isNewProduct = false;

      // 1. Önce ürünü kaydet (görseller olmadan)
      if (isEditing) {
        await packagingService.updateProduct(productId, cleanedData);
        currentProductId = productId;
      } else {
        const newProduct = await packagingService.createProduct(cleanedData);
        currentProductId = newProduct.id;
        isNewProduct = true;
      }

      // 2. Eğer seçili görseller varsa, bunları Cloudinary'e yükle
      if (selectedFiles.length > 0) {
        toast({
          title: "Görseller yükleniyor...",
          description: `${selectedFiles.length} görsel Cloudinary'e yükleniyor`,
        });

        try {
          const formDataToSend = new FormData();
          selectedFiles.forEach((file) => {
            formDataToSend.append("images", file);
          });
          formDataToSend.append("productName", formData.name);

          const response = await fetch("/api/upload-images", {
            method: "POST",
            body: formDataToSend,
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Görsel yükleme başarısız");
          }

          // 3. Ürünü görsel isimleri ile güncelle
          const updatedData = {
            ...cleanedData,
            images: result.images,
          };

          await packagingService.updateProduct(currentProductId, updatedData);

          toast({
            title: "Başarılı",
            description: `Ürün ve ${result.images.length} görsel başarıyla ${
              isNewProduct ? "oluşturuldu" : "güncellendi"
            }`,
          });
        } catch (imageError) {
          // Görsel yükleme başarısız olsa bile ürün kaydedildi
          toast({
            title: "Kısmi Başarı",
            description: `Ürün kaydedildi ancak görseller yüklenemedi: ${imageError.message}`,
            variant: "destructive",
          });
        }
      } else {
        // Görsel yoksa sadece ürün kaydedildi mesajı
        toast({
          title: "Başarılı",
          description: `Ürün başarıyla ${
            isNewProduct ? "oluşturuldu" : "güncellendi"
          }`,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/packaging");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Ürün Düzenle" : "Yeni Ürün"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Mevcut ürün bilgilerini düzenleyin"
              : "Yeni ambalaj ürünü ekleyin"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Ürünün temel bilgilerini girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Örn: Disk Top Kapak - Alüminyum Altın/Beyaz"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Ürün Kodu *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="Örn: MG-702 AL"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Ürün açıklaması..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) =>
                  handleInputChange("inStock", checked)
                }
              />
              <Label htmlFor="inStock">Stokta mevcut</Label>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Teknik Özellikler</CardTitle>
            <CardDescription>Ürünün teknik detaylarını girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Boyut</Label>
                <Input
                  id="size"
                  value={formData.specifications.size}
                  onChange={(e) =>
                    handleSpecificationChange("size", e.target.value)
                  }
                  placeholder="Örn: 24/410"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debit">Debi</Label>
                <Input
                  id="debit"
                  value={formData.specifications.debit}
                  onChange={(e) =>
                    handleSpecificationChange("debit", e.target.value)
                  }
                  placeholder="Örn: 0.8-0.10 ml/T"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lockType">Kilit Tipi</Label>
                <Input
                  id="lockType"
                  value={formData.specifications.lockType}
                  onChange={(e) =>
                    handleSpecificationChange("lockType", e.target.value)
                  }
                  placeholder="Örn: Clip lock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Malzeme</Label>
                <Input
                  id="material"
                  value={formData.specifications.material}
                  onChange={(e) =>
                    handleSpecificationChange("material", e.target.value)
                  }
                  placeholder="Örn: Alüminyum"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Renkler</CardTitle>
            <CardDescription>
              Ürünün mevcut renk seçeneklerini ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.colors.map((color, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={color}
                  onChange={(e) =>
                    handleArrayFieldChange("colors", index, e.target.value)
                  }
                  placeholder={`Renk ${index + 1}`}
                  className="flex-1"
                />
                {formData.colors.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleArrayFieldRemove("colors", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleArrayFieldAdd("colors")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Renk Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Görseller</CardTitle>
            <CardDescription>
              Görsel dosyalarını seçin. Ürün kaydedilirken otomatik olarak
              Cloudinary'e yüklenecek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dosya Seçme */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Görsel Dosyalarını Seç</Label>
              <Input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Seçtiğiniz görseller form kaydedilirken otomatik yüklenecek
              </p>
            </div>

            {/* Seçili Dosyaların Önizlemesi */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Seçili Görseller ({selectedFiles.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Önizleme ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeSelectedFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {selectedFiles[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  💡 Bu görseller "Kaydet" butonuna bastığınızda otomatik
                  yüklenecek
                </div>
              </div>
            )}

            {/* Yüklenmiş Görseller */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>Yüklenmiş Görseller ({formData.images.length})</Label>
                <div className="space-y-2">
                  {formData.images.map((imageName, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded bg-green-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{imageName}</div>
                        <div className="text-xs text-green-600">
                          ✓ Cloudinary'de başarıyla yüklendi
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.images.length === 0 && selectedFiles.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-2 text-sm text-muted-foreground">
                  Henüz görsel seçilmedi
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Görseller form kaydedilirken otomatik yüklenecek
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>İş Bilgileri</CardTitle>
            <CardDescription>
              Ticari bilgiler ve fiyat aralıkları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Müsaitlik Durumu</Label>
                <Select
                  value={formData.business.availability}
                  onValueChange={(value) =>
                    handleBusinessChange("availability", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müsaitlik durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">Stokta Mevcut</SelectItem>
                    <SelectItem value="out-of-stock">Stok Dışı</SelectItem>
                    <SelectItem value="pre-order">Ön Sipariş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  value={formData.business.currency}
                  onValueChange={(value) =>
                    handleBusinessChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fiyat Aralıkları */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Fiyat Aralıkları
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPriceRange}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aralık Ekle
                </Button>
              </div>

              <div className="space-y-3">
                {formData.business.priceRanges.map((range, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs">Min Adet</Label>
                      <Input
                        type="number"
                        value={range.minQuantity}
                        onChange={(e) =>
                          handlePriceRangeChange(
                            index,
                            "minQuantity",
                            parseInt(e.target.value) || ""
                          )
                        }
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Adet</Label>
                      <Input
                        type="number"
                        value={range.maxQuantity}
                        onChange={(e) =>
                          handlePriceRangeChange(
                            index,
                            "maxQuantity",
                            parseInt(e.target.value) || ""
                          )
                        }
                        placeholder="500"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fiyat</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={range.price}
                        onChange={(e) =>
                          handlePriceRangeChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || ""
                          )
                        }
                        placeholder="1.50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Para Birimi</Label>
                      <Select
                        value={range.currency}
                        onValueChange={(value) =>
                          handlePriceRangeChange(index, "currency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      {formData.business.priceRanges.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removePriceRange(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Ipucu:</strong> 5000+ adet için "Bizimle İletişim"
                  mesajı otomatik gösterilir. En yüksek aralığın üstündeki
                  siparişler için teklif talep edilir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderQuantity">Min. Sipariş Adedi</Label>
                <Input
                  id="minOrderQuantity"
                  type="number"
                  value={formData.business.minOrderQuantity}
                  onChange={(e) =>
                    handleBusinessChange("minOrderQuantity", e.target.value)
                  }
                  placeholder="Örn: 1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTime">Teslim Süresi (gün)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formData.business.leadTime}
                  onChange={(e) =>
                    handleBusinessChange("leadTime", e.target.value)
                  }
                  placeholder="Örn: 15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Temel Fiyat (birim)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.business.price}
                  onChange={(e) =>
                    handleBusinessChange("price", e.target.value)
                  }
                  placeholder="Örn: 1.50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Information */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Bilgileri</CardTitle>
            <CardDescription>
              Arama motoru optimizasyonu için gerekli bilgiler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Input
                id="metaTitle"
                value={formData.seo.metaTitle}
                onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
                placeholder="Örn: Disk Top Kapak - Alüminyum Altın/Beyaz | MKN Group"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seo.metaTitle.length}/60 karakter (önerilen: 50-60
                karakter)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Textarea
                id="metaDescription"
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  handleSeoChange("metaDescription", e.target.value)
                }
                placeholder="Örn: Disk top kapak için ideal alüminyum ürün. Yüksek kalite ve dayanıklılık..."
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seo.metaDescription.length}/160 karakter (önerilen:
                120-160 karakter)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug (Otomatik Oluşturulan)</Label>
              <Input
                id="slug"
                value={formData.seo.slug}
                onChange={(e) => handleSeoChange("slug", e.target.value)}
                placeholder="Otomatik oluşturulacak..."
              />
              <p className="text-xs text-muted-foreground">
                İsim, boyut ve kod bilgilerine göre otomatik oluşturulur.
                İsterseniz manuel değiştirebilirsiniz.
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label>Anahtar Kelimeler</Label>
              <div className="space-y-2">
                {formData.seo.keywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={keyword}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "seo.keywords",
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Anahtar kelime ${index + 1}`}
                    />
                    {formData.seo.keywords.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleArrayFieldRemove("seo.keywords", index)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleArrayFieldAdd("seo.keywords")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Anahtar Kelime Ekle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {selectedFiles.length > 0
                  ? "Kaydediliyor ve Görseller Yükleniyor..."
                  : "Kaydediliyor..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Güncelle" : "Kaydet"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
