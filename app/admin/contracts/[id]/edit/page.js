"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionGuard, usePermissions } from "../../../../../components/admin-route-guard";
import {
  FileText,
  ArrowLeft,
  Save,
  Download,
  Eye,
  Edit2,
  Plus,
  Trash2,
  Building2,
  Calendar,
  MessageSquare,
  AlertCircle,
  Factory,
  X,
  Copy,
  Check,
} from "lucide-react";
import { ContractService } from "../../../../../lib/services/contract-service";
import {
  getContractTypeLabel,
  CONTRACT_TEMPLATES,
} from "../../../../../lib/contract-templates";
import ContractPDFExport from "../../../../../components/contract-pdf-export";
import FileUploadPreview from "../../../../../components/file-upload-preview";
import { useToast } from "../../../../../hooks/use-toast";

export default function EditContractPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [newNote, setNewNote] = useState("");
  const [fieldEditMode, setFieldEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [editingCard, setEditingCard] = useState(null); // 'customer', 'manufacturer', 'contract', 'mkngroup', null
  const [hasManufacturer, setHasManufacturer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [mknGroupInfo, setMknGroupInfo] = useState({
    companyName:
      "MKNGROUP (TONGZİ BERTUG MULTİNATİONAL MEDİKAL ÜRÜNLER OTOMOTİV SANAYİ VE DIŞ TİCARET LİMİTED ŞİRKETİ)",
    address: "Yakuplu Mah. Dereboyu Cad. No: 4/1 Beylikdüzü / İSTANBUL",
    contactPerson: "Mahammad Nadirov",
    contactPosition: "Firma Sahibi",
    phone: "+90 531 494 25 94",
    email: "info@mkngroup.com.tr",
    taxOffice: "Beylikdüzü Vergi Dairesi",
    taxNumber: "0123456789012345",
    mersisNo: "0123456789012345",
  });

  useEffect(() => {
    if (params.id) {
      loadContract();
    }
  }, [params.id]);

  useEffect(() => {
    if (contract?.mknGroupInfo) {
      setMknGroupInfo(contract.mknGroupInfo);
    }
  }, [contract]);

  const loadContract = async () => {
    setLoading(true);
    try {
      const result = await ContractService.getContract(params.id);
      if (result.success) {
        setContract(result.contract);
        setEditedContent(result.contract.content);
        setEditedFields(result.contract.fields || {});
        setHasManufacturer(result.contract.hasManufacturer || false);
      } else {
        toast({
          title: "Hata",
          description: "Sözleşme bulunamadı",
          variant: "destructive",
        });
        router.push("/admin/contracts");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sözleşme yüklenirken hata oluştu",
        variant: "destructive",
      });
      router.push("/admin/contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await ContractService.updateContract(params.id, {
        content: editedContent,
        updatedAt: new Date(),
      });

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Sözleşme kaydedildi",
        });
        setEditMode(false);
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Sözleşme kaydedilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sözleşme kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldsSave = async (cardType) => {
    setSaving(true);
    try {
      const updateData = {
        updatedAt: new Date(),
      };

      if (cardType === "mkngroup") {
        updateData.mknGroupInfo = mknGroupInfo;
      } else {
        updateData.fields = editedFields;
      }

      const result = await ContractService.updateContract(
        params.id,
        updateData
      );

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Bilgiler güncellendi",
        });
        setEditingCard(null);
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Bilgiler güncellenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bilgiler güncellenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManufacturerToggle = async (enabled) => {
    try {
      const result = await ContractService.updateContract(params.id, {
        hasManufacturer: enabled,
        updatedAt: new Date(),
      });

      if (result.success) {
        setHasManufacturer(enabled);
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Üretici ayarı değiştirilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Üretici ayarı değiştirilirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleCopyContent = async () => {
    try {
      const textContent = getProcessedContent().replace(/<br\/>/g, "\n");
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Metin kopyalanamadı",
        variant: "destructive",
      });
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setEditedFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const result = await ContractService.updateContractStatus(
        params.id,
        newStatus
      );
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Durum güncellendi",
        });
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Durum güncellenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const result = await ContractService.addContractNote(params.id, newNote);
      if (result.success) {
        setNewNote("");
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Not eklenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Not eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleSaveAttachments = async () => {
    if (attachedFiles.length === 0) return;

    setSaving(true);
    try {
      const result = await ContractService.updateContract(params.id, {
        files: attachedFiles,
      });

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Dosyalar yüklendi",
        });
        setAttachedFiles([]);
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Dosyalar yüklenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dosyalar yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttachment = async (attachmentUrl) => {
    if (!confirm("Bu dosyayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setSaving(true);
    try {
      const result = await ContractService.deleteAttachment(
        params.id,
        attachmentUrl
      );

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Dosya silindi",
        });
        loadContract();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Dosya silinemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dosya silinirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getProcessedContent = () => {
    if (!contract) return "";

    let content = contract.content;

    // Replace MKNGROUP variables
    const mknInfo = contract.mknGroupInfo || mknGroupInfo;
    content = content.replace(
      /\{\{mkngroup_firma\}\}/g,
      mknInfo.companyName || ""
    );
    content = content.replace(/\{\{mkngroup_adres\}\}/g, mknInfo.address || "");
    content = content.replace(
      /\{\{mkngroup_yetkili\}\}/g,
      mknInfo.contactPerson || ""
    );
    content = content.replace(
      /\{\{mkngroup_pozisyon\}\}/g,
      mknInfo.contactPosition || ""
    );
    content = content.replace(/\{\{mkngroup_telefon\}\}/g, mknInfo.phone || "");
    content = content.replace(/\{\{mkngroup_email\}\}/g, mknInfo.email || "");
    content = content.replace(
      /\{\{mkngroup_vergi_dairesi\}\}/g,
      mknInfo.taxOffice || ""
    );
    content = content.replace(
      /\{\{mkngroup_vergi_no\}\}/g,
      mknInfo.taxNumber || ""
    );
    content = content.replace(
      /\{\{mkngroup_mersis_no\}\}/g,
      mknInfo.mersisNo || ""
    );

    // Replace company variables
    if (contract.companyInfo) {
      content = content.replace(
        /\{\{MUSTERI_FIRMA\}\}/g,
        contract.companyInfo.companyName || ""
      );
      content = content.replace(
        /\{\{MUSTERI_ADRES\}\}/g,
        contract.companyInfo.address || ""
      );
      content = content.replace(
        /\{\{MUSTERI_YETKILI\}\}/g,
        contract.companyInfo.contactPerson || ""
      );
      content = content.replace(
        /\{\{MUSTERI_TEL\}\}/g,
        contract.companyInfo.phone || ""
      );
      content = content.replace(
        /\{\{MUSTERI_EPOSTA\}\}/g,
        contract.companyInfo.email || ""
      );
      content = content.replace(
        /\{\{MUSTERI_VERGI_DAIRESI\}\}/g,
        contract.companyInfo.taxOffice || ""
      );
      content = content.replace(
        /\{\{MUSTERI_VERGI_NO\}\}/g,
        contract.companyInfo.taxNumber || ""
      );
    }

    // Replace custom fields
    if (contract.fields) {
      Object.keys(contract.fields).forEach((key) => {
        const value = contract.fields[key];
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        content = content.replace(regex, value);
      });
    }

    // Conditional sections işle ({{field_name}} ... {{/field_name}} formatı)
    const conditionalRegex = /\{\{(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    content = content.replace(
      conditionalRegex,
      (match, fieldName, sectionContent) => {
        // Field değerini kontrol et
        const fieldValue = contract.fields?.[fieldName];
        // Eğer field true, "true", 1 veya boş olmayan bir değerse içeriği göster
        if (
          fieldValue === true ||
          fieldValue === "true" ||
          fieldValue === 1 ||
          (fieldValue && fieldValue !== "false" && fieldValue !== "0")
        ) {
          return sectionContent;
        }
        // Aksi halde içeriği kaldır
        return "";
      }
    );

    // Üretim tesisi - hasManufacturer false ise MKNGROUP olarak göster
    if (!contract.hasManufacturer) {
      content = content.replace(
        /\{\{uretim_tesisi\}\}/g,
        "MKNGROUP (Tongzi Bertug LTD) bünyesindeki anlaşmalı tesisler"
      );
      content = content.replace(
        /\{\{uretici_adres\}\}/g,
        "Yakuplu Mah. Dereboyu Cad. No: 4/1 Beylikdüzü / İSTANBUL"
      );
      content = content.replace(/\{\{uretici_yetkili\}\}/g, "MKNGROUP Yetkili");
      content = content.replace(
        /\{\{uretici_email\}\}/g,
        "info@mkngroup.com.tr"
      );
    }

    // Replace contract number
    content = content.replace(
      /\{\{SOZLESME_NO\}\}/g,
      contract.contractNumber || ""
    );

    // Process signature section for HTML display
    const signatureRegex =
      /\[SIGNATURE_SECTION\]([\s\S]*?)\[\/SIGNATURE_SECTION\]/g;
    content = content.replace(signatureRegex, (match, sectionContent) => {
      // MKN GROUP bilgileri
      const mknCompanyName = mknGroupInfo?.companyName ||
        "MKNGROUP (TONGZİ BERTUG MULTİNATİONAL MEDİKAL ÜRÜNLER OTOMOTİV SANAYİ VE DIŞ TİCARET LİMİTED ŞİRKETİ)";
      const mknAuthorizedPerson = mknGroupInfo?.contactPerson || "Mahammad Nadirov";
      const mknTitle = mknGroupInfo?.contactPosition || "Firma Sahibi";

      // Müşteri bilgileri
      const customerCompanyName =
        contract?.companyInfo?.companyName ||
        editedFields?.musteri_firma ||
        "MÜŞTERİ FİRMASI";
      const customerAuthorizedPerson =
        contract?.companyInfo?.contactPerson ||
        editedFields?.musteri_yetkili ||
        "";
      const customerTitle =
        contract?.companyInfo?.contactPosition ||
        editedFields?.musteri_pozisyon ||
        "Şirket Sahibi";

      return `
<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 80px; padding-top: 40px;">
  <div style="width: 45%; text-align: left;">
    <div style="font-weight: 600; font-size: 12px; margin-bottom: 15px; text-transform: uppercase; color: #333; letter-spacing: 0.3px;">${mknCompanyName}</div>
    <div style="height: 80px; border-bottom: 1px solid #333; margin-bottom: 10px;"></div>
    <div style="margin-top: 10px;">
      <div style="font-size: 12px; font-weight: 600; color: #000; margin-bottom: 3px;">${mknAuthorizedPerson}</div>
      <div style="font-size: 11px; color: #666;">${mknTitle}</div>
    </div>
  </div>
  <div style="width: 45%; text-align: right;">
    <div style="font-weight: 600; font-size: 12px; margin-bottom: 15px; text-transform: uppercase; color: #333; letter-spacing: 0.3px;">${customerCompanyName}</div>
    <div style="height: 80px; border-bottom: 1px solid #333; margin-bottom: 10px;"></div>
    <div style="margin-top: 10px;">
      <div style="font-size: 12px; font-weight: 600; color: #000; margin-bottom: 3px;">${customerAuthorizedPerson}</div>
      <div style="font-size: 11px; color: #666;">${customerTitle}</div>
    </div>
  </div>
</div>
`;
    });

    return content;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleString("tr-TR");
  };

  const renderField = (field, cardType) => {
    const value = editedFields[field.name] || "";
    const isEditing = editingCard === cardType;

    if (field.readonly && !isEditing) {
      return null; // Readonly alanları edit modda gösterme
    }

    // Conditional field kontrolü
    if (field.conditionalOn && !editedFields[field.conditionalOn]) {
      return null;
    }

    switch (field.type) {
      case "checkbox":
        return (
          <div key={field.name} className="mb-3 col-span-full">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={value === true || value === "true"}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.checked)
                  }
                  disabled={!isEditing}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
                {field.description && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {field.description}
                  </p>
                )}
              </div>
            </label>
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.readonly && (
                <span className="ml-2 text-xs text-blue-600">(Sabit)</span>
              )}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={field.readonly || !isEditing}
              rows={3}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                field.readonly || !isEditing
                  ? "bg-gray-50 cursor-not-allowed text-gray-700"
                  : "border-gray-300"
              }`}
            />
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                !isEditing
                  ? "bg-gray-50 cursor-not-allowed text-gray-700"
                  : "border-gray-300"
              }`}
            />
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={!isEditing}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                !isEditing
                  ? "bg-gray-50 cursor-not-allowed text-gray-700"
                  : "border-gray-300"
              }`}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.readonly && (
                <span className="ml-2 text-xs text-blue-600">(Sabit)</span>
              )}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={field.readonly || !isEditing}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                field.readonly || !isEditing
                  ? "bg-gray-50 cursor-not-allowed text-gray-700"
                  : "border-gray-300"
              }`}
            />
          </div>
        );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        label: "Taslak",
        color: "bg-gray-100 text-gray-700 border-gray-300",
      },
      active: {
        label: "Aktif",
        color: "bg-green-100 text-green-700 border-green-300",
      },
      completed: {
        label: "Tamamlandı",
        color: "bg-blue-100 text-blue-700 border-blue-300",
      },
      cancelled: {
        label: "İptal",
        color: "bg-red-100 text-red-700 border-red-300",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sözleşme yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-semibold">
            Sözleşme bulunamadı
          </p>
          <button
            onClick={() => router.push("/admin/contracts")}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Sözleşmelere dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="contracts.edit">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/contracts")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Sözleşmelere Dön
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                {contract.contractNumber}
              </h1>
              <p className="text-gray-600 mt-2">
                {getContractTypeLabel(contract.contractType)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(contract.status)}
              <ContractPDFExport
                contract={contract}
                onLoadingStart={() =>
                  toast({
                    title: "PDF Hazırlanıyor",
                    description: "Sözleşme PDF'i oluşturuluyor...",
                  })
                }
                onLoadingEnd={() =>
                  toast({
                    title: "Başarılı",
                    description: "PDF başarıyla indirildi",
                  })
                }
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 hover:shadow-lg transition-all">
                  <Download className="h-5 w-5" />
                  PDF İndir
                </button>
              </ContractPDFExport>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sözleşme İçeriği
                </h2>
                <div className="flex items-center gap-2">
                  {!editMode && (
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      title="Metni Kopyala"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">
                            Kopyalandı
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="text-sm">Kopyala</span>
                        </>
                      )}
                    </button>
                  )}
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Düzenle
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditedContent(contract.content);
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editMode ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={30}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              ) : (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: getProcessedContent().replace(/\n/g, "<br/>"),
                  }}
                />
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Notlar
              </h2>

              <div className="space-y-4 mb-4">
                {contract.notes && contract.notes.length > 0 ? (
                  contract.notes.map((note, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <p className="text-sm text-gray-900 mb-2">{note.text}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(note.createdAt)} - {note.createdBy}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Henüz not yok</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder="Not ekle..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Durum Yönetimi
              </h2>
              <div className="space-y-2">
                {[
                  { value: "draft", label: "Taslak" },
                  { value: "active", label: "Aktif" },
                  { value: "completed", label: "Tamamlandı" },
                  { value: "cancelled", label: "İptal" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleStatusChange(value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-left transition-all ${
                      contract.status === value
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* MKNGROUP Bilgileri */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Bizim Taraf (MKNGROUP)
                </h2>
                {editingCard !== "mkngroup" ? (
                  <button
                    onClick={() => setEditingCard("mkngroup")}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCard(null);
                        setMknGroupInfo(contract.mknGroupInfo || mknGroupInfo);
                      }}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="İptal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFieldsSave("mkngroup")}
                      disabled={saving}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Kaydet"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Firma Adı
                  </label>
                  <input
                    type="text"
                    value={mknGroupInfo.companyName}
                    onChange={(e) =>
                      setMknGroupInfo({
                        ...mknGroupInfo,
                        companyName: e.target.value,
                      })
                    }
                    readOnly={editingCard !== "mkngroup"}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      editingCard !== "mkngroup"
                        ? "bg-gray-50 cursor-not-allowed text-gray-700"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Adres
                  </label>
                  <textarea
                    value={mknGroupInfo.address}
                    onChange={(e) =>
                      setMknGroupInfo({
                        ...mknGroupInfo,
                        address: e.target.value,
                      })
                    }
                    readOnly={editingCard !== "mkngroup"}
                    rows={2}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      editingCard !== "mkngroup"
                        ? "bg-gray-50 cursor-not-allowed text-gray-700"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Yetkili Kişi
                    </label>
                    <input
                      type="text"
                      value={mknGroupInfo.contactPerson}
                      onChange={(e) =>
                        setMknGroupInfo({
                          ...mknGroupInfo,
                          contactPerson: e.target.value,
                        })
                      }
                      readOnly={editingCard !== "mkngroup"}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        editingCard !== "mkngroup"
                          ? "bg-gray-50 cursor-not-allowed text-gray-700"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Pozisyon
                    </label>
                    <input
                      type="text"
                      value={mknGroupInfo.contactPosition}
                      onChange={(e) =>
                        setMknGroupInfo({
                          ...mknGroupInfo,
                          contactPosition: e.target.value,
                        })
                      }
                      readOnly={editingCard !== "mkngroup"}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        editingCard !== "mkngroup"
                          ? "bg-gray-50 cursor-not-allowed text-gray-700"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={mknGroupInfo.phone}
                    onChange={(e) =>
                      setMknGroupInfo({
                        ...mknGroupInfo,
                        phone: e.target.value,
                      })
                    }
                    readOnly={editingCard !== "mkngroup"}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      editingCard !== "mkngroup"
                        ? "bg-gray-50 cursor-not-allowed text-gray-700"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={mknGroupInfo.email}
                    onChange={(e) =>
                      setMknGroupInfo({
                        ...mknGroupInfo,
                        email: e.target.value,
                      })
                    }
                    readOnly={editingCard !== "mkngroup"}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      editingCard !== "mkngroup"
                        ? "bg-gray-50 cursor-not-allowed text-gray-700"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Vergi Dairesi
                    </label>
                    <input
                      type="text"
                      value={mknGroupInfo.taxOffice}
                      onChange={(e) =>
                        setMknGroupInfo({
                          ...mknGroupInfo,
                          taxOffice: e.target.value,
                        })
                      }
                      readOnly={editingCard !== "mkngroup"}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        editingCard !== "mkngroup"
                          ? "bg-gray-50 cursor-not-allowed text-gray-700"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Vergi No
                    </label>
                    <input
                      type="text"
                      value={mknGroupInfo.taxNumber}
                      onChange={(e) =>
                        setMknGroupInfo({
                          ...mknGroupInfo,
                          taxNumber: e.target.value,
                        })
                      }
                      readOnly={editingCard !== "mkngroup"}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        editingCard !== "mkngroup"
                          ? "bg-gray-50 cursor-not-allowed text-gray-700"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    MERSİS No
                  </label>
                  <input
                    type="text"
                    value={mknGroupInfo.mersisNo}
                    onChange={(e) =>
                      setMknGroupInfo({
                        ...mknGroupInfo,
                        mersisNo: e.target.value,
                      })
                    }
                    readOnly={editingCard !== "mkngroup"}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      editingCard !== "mkngroup"
                        ? "bg-gray-50 cursor-not-allowed text-gray-700"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Müşteri Bilgileri
                </h2>
                {editingCard !== "customer" ? (
                  <button
                    onClick={() => setEditingCard("customer")}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCard(null);
                        setEditedFields(contract.fields || {});
                      }}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="İptal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFieldsSave("customer")}
                      disabled={saving}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Kaydet"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {contract.contractType &&
                CONTRACT_TEMPLATES[contract.contractType]?.fields && (
                  <div className="space-y-2">
                    {CONTRACT_TEMPLATES[contract.contractType].fields
                      .filter((field) => field.name.startsWith("musteri_"))
                      .map((field) => renderField(field, "customer"))}
                  </div>
                )}
              {contract.companyInfo && (
                <div className="space-y-2 text-sm mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-gray-600 text-xs">Firma:</span>
                    <p className="font-medium text-gray-900">
                      {contract.companyInfo.companyName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Yetkili:</span>
                    <p className="text-gray-900">
                      {contract.companyInfo.contactPerson}
                    </p>
                  </div>
                  {contract.companyInfo.contactPosition && (
                    <div>
                      <span className="text-gray-600 text-xs">Pozisyon:</span>
                      <p className="text-gray-900">
                        {contract.companyInfo.contactPosition}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 text-xs">Telefon:</span>
                    <p className="text-gray-900">
                      {contract.companyInfo.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">E-posta:</span>
                    <p className="text-gray-900 break-all">
                      {contract.companyInfo.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Manufacturer Info */}
            {contract.contractType &&
              CONTRACT_TEMPLATES[contract.contractType]?.fields?.some((f) =>
                f.name.startsWith("uretici_")
              ) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Factory className="h-4 w-4 text-purple-600" />
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Üretici Bilgileri
                        </h2>
                        <p className="text-xs text-gray-500">
                          Ayrı üretici tesisi var mı?
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasManufacturer}
                        onChange={(e) =>
                          handleManufacturerToggle(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  {hasManufacturer ? (
                    <>
                      <div className="flex items-center justify-end mb-3">
                        {editingCard !== "manufacturer" ? (
                          <button
                            onClick={() => setEditingCard("manufacturer")}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCard(null);
                                setEditedFields(contract.fields || {});
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="İptal"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleFieldsSave("manufacturer")}
                              disabled={saving}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Kaydet"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {CONTRACT_TEMPLATES[contract.contractType].fields
                          .filter((field) => field.name.startsWith("uretici_"))
                          .map((field) => renderField(field, "manufacturer"))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900 mb-1">
                        Üretim: MKNGROUP
                      </p>
                      <p className="text-xs">
                        Üretim süreci doğrudan MKNGROUP tarafından
                        yönetilecektir.
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Contract Details */}
            {contract.contractType &&
              CONTRACT_TEMPLATES[contract.contractType]?.fields?.some(
                (f) =>
                  !f.name.startsWith("musteri_") &&
                  !f.name.startsWith("uretici_") &&
                  !f.name.startsWith("mkngroup_")
              ) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Sözleşme Detayları
                    </h2>
                    {editingCard !== "contract" ? (
                      <button
                        onClick={() => setEditingCard("contract")}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCard(null);
                            setEditedFields(contract.fields || {});
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="İptal"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFieldsSave("contract")}
                          disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Kaydet"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {CONTRACT_TEMPLATES[contract.contractType].fields
                      .filter(
                        (field) =>
                          !field.name.startsWith("musteri_") &&
                          !field.name.startsWith("uretici_") &&
                          !field.name.startsWith("mkngroup_")
                      )
                      .map((field) => renderField(field, "contract"))}
                  </div>
                </div>
              )}

            {/* Ekli Belgeler */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Ekli Belgeler
                </h2>
                {attachedFiles.length > 0 && (
                  <button
                    onClick={handleSaveAttachments}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3 w-3" />
                    Kaydet
                  </button>
                )}
              </div>
              <FileUploadPreview
                files={attachedFiles}
                onFilesChange={setAttachedFiles}
                maxFiles={5}
                disabled={saving}
              />
              {contract.attachments && contract.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Mevcut Dosyalar:
                  </p>
                  <div className="space-y-2">
                    {contract.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              attachment.uploadedAt?.seconds * 1000
                            ).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <Eye className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteAttachment(attachment.url)
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contract Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Sistem Bilgileri
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 text-xs">Oluşturulma:</span>
                  <p className="text-gray-900 text-xs">
                    {formatDate(contract.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Son Güncelleme:</span>
                  <p className="text-gray-900 text-xs">
                    {formatDate(contract.updatedAt)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs">Oluşturan:</span>
                  <p className="text-gray-900 text-xs">
                    {contract.createdBy || "Sistem"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
}
