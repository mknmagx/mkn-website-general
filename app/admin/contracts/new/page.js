'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '../../../../components/admin-route-guard';
import { 
  FileText, 
  ArrowLeft, 
  Save,
  Building2,
  FileSignature,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ContractService } from '../../../../lib/services/contract-service';
import { 
  CONTRACT_TEMPLATES, 
  getAllContractTypes,
  getContractTypeLabel 
} from '../../../../lib/contract-templates';
import { useCompanies } from '../../../../hooks/use-company';
import FileUploadPreview from '../../../../components/file-upload-preview';
import { useToast } from '../../../../hooks/use-toast';

export default function NewContractPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { companies, loading: companiesLoading } = useCompanies();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});
  const [hasManufacturer, setHasManufacturer] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const contractTypes = getAllContractTypes();

  useEffect(() => {
    const generateContractNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `CNT-${year}${month}-${random}`;
    };
    setContractNumber(generateContractNumber());
  }, []);

  useEffect(() => {
    if (selectedType) {
      const template = CONTRACT_TEMPLATES[selectedType];
      if (template && template.fields) {
        const initialFields = {};
        template.fields.forEach(field => {
          initialFields[field.name] = field.default || '';
        });
        setFields(initialFields);
      }
    }
  }, [selectedType]);

  // Müşteri seçildiğinde field'ları doldur
  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company) {
        setFields(prev => ({
          ...prev,
          musteri_firma: company.name || '',
          musteri_adres: company.address || '',
          musteri_yetkili: company.contactPerson || '',
          musteri_telefon: company.contactPhone || company.phone || '',
          musteri_email: company.contactEmail || company.email || '',
          musteri_vergi_dairesi: company.taxOffice || '',
          musteri_vergi_no: company.taxNumber || ''
        }));
      }
    }
  }, [selectedCompany, companies]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedType) {
      newErrors.selectedType = 'Contract type is required';
    }

    if (!selectedCompany) {
      newErrors.selectedCompany = 'Company is required';
    }

    if (!contractNumber.trim()) {
      newErrors.contractNumber = 'Contract number is required';
    }

    if (selectedType) {
      const template = CONTRACT_TEMPLATES[selectedType];
      if (template && template.fields) {
        template.fields.forEach(field => {
          // Üretici alanlarını sadece hasManufacturer true ise kontrol et
          if (field.name.startsWith('uretici_')) {
            if (hasManufacturer && field.required && !fields[field.name]) {
              newErrors[field.name] = `${field.label} is required`;
            }
          } else if (field.required && !fields[field.name]) {
            newErrors[field.name] = `${field.label} is required`;
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm gerekli alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const company = companies.find(c => c.id === selectedCompany);
      const template = CONTRACT_TEMPLATES[selectedType];

      const contractData = {
        contractNumber,
        contractType: selectedType,
        title: template.title,
        content: template.content,
        companyId: selectedCompany,
        companyInfo: {
          companyName: company.companyName || company.name || '',
          address: company.address || '',
          contactPerson: company.contactPerson || '',
          contactPosition: company.contactPosition || '',
          phone: company.phone || '',
          email: company.email || '',
          taxOffice: company.taxOffice || '',
          taxNumber: company.taxNumber || ''
        },
        fields: fields,
        hasManufacturer: hasManufacturer,
        files: attachedFiles, // Dosyaları ekle
        status: 'draft',
        notes: []
      };

      const result = await ContractService.createContract(contractData);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Sözleşme başarıyla oluşturuldu",
        });
        router.push(`/admin/contracts/${result.id}/edit`);
      } else {
        toast({
          title: "Hata",
          description: result.error || "Sözleşme oluşturulamadı",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sözleşme oluşturulurken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const renderField = (field) => {
    const value = fields[field.name] || '';
    const error = errors[field.name];

    // Üretici field'larını sadece hasManufacturer true ise göster
    if (field.name.startsWith('uretici_') && !hasManufacturer) {
      return null;
    }

    // Conditional field kontrolü
    if (field.conditionalOn && !fields[field.conditionalOn]) {
      return null;
    }

    switch (field.type) {
      case 'checkbox':
        return (
          <div key={field.name} className="mb-4 col-span-full">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={value === true || value === 'true'}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {field.description}
                  </p>
                )}
              </div>
            </label>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1 ml-8">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.readonly && <span className="ml-2 text-xs text-blue-600">(Sabit)</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={3}
              readOnly={field.readonly}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${field.readonly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder={field.label}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seçin...</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={field.label}
            />
            {field.description && (
              <p className="mt-1 text-xs text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.readonly && <span className="ml-2 text-xs text-blue-600">(Sabit)</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              readOnly={field.readonly}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${field.readonly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder={field.label}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        );
    }
  };

  const template = selectedType ? CONTRACT_TEMPLATES[selectedType] : null;

  return (
    <PermissionGuard requiredPermission="contracts.create">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileSignature className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Sözleşme Oluştur</h1>
              <p className="text-sm text-gray-500 mt-1">Müşteri ile yeni sözleşme hazırlayın</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Genel Bilgiler Kartı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Genel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sözleşme No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.contractNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="CNT-202411-0001"
                />
                {errors.contractNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.contractNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sözleşme Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.selectedType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sözleşme tipi seçin...</option>
                  {contractTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.selectedType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.selectedType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* MKNGROUP Bilgileri Kartı */}
          {template && template.fields && template.fields.some(f => f.name.startsWith('mkngroup_')) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">Bizim Bilgiler (MKNGROUP)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.fields
                  .filter(field => field.name.startsWith('mkngroup_'))
                  .map(field => renderField(field))}
              </div>
            </div>
          )}

          {/* Müşteri Firma Kartı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Müşteri Firma
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma Seç <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                disabled={companiesLoading}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.selectedCompany ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Firma seçin...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} - {company.contactPerson || 'N/A'}
                  </option>
                ))}
              </select>
              {errors.selectedCompany && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.selectedCompany}
                </p>
              )}
            </div>

            {/* Müşteri Bilgileri - Düzenlenebilir */}
            {template && template.fields && selectedCompany && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Müşteri Bilgileri</h3>
                  <p className="text-xs text-gray-500">Bilgileri düzenleyebilirsiniz</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.fields
                    .filter(field => field.name.startsWith('musteri_'))
                    .map(field => renderField(field))}
                </div>
              </div>
            )}
          </div>

          {/* Üretici Bilgileri Kartı */}
          {template && template.fields && template.fields.some(f => f.name.startsWith('uretici_')) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Üretici Bilgileri</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ayrı bir üretici tesisi ile mi çalışılacak?</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasManufacturer}
                    onChange={(e) => setHasManufacturer(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              {!hasManufacturer ? (
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-1">Üretim: MKNGROUP</p>
                  <p className="text-xs">Üretim süreci doğrudan MKNGROUP tarafından yönetilecektir.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {template.fields
                    .filter(field => field.name.startsWith('uretici_'))
                    .map(field => renderField(field))}
                </div>
              )}
            </div>
          )}

          {/* Sözleşme Detayları Kartı */}
          {template && template.fields && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Sözleşme Detayları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.fields
                  .filter(field => 
                    !field.name.startsWith('musteri_') && 
                    !field.name.startsWith('uretici_') && 
                    !field.name.startsWith('mkngroup_')
                  )
                  .map(field => renderField(field))}
              </div>
            </div>
          )}

          {/* Ekli Belgeler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Ekli Belgeler (Proforma, Evrak vb.)
            </h3>
            <FileUploadPreview 
              files={attachedFiles}
              onFilesChange={setAttachedFiles}
              maxFiles={5}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-3">
              * Yüklenen dosyalar sözleşme PDF'inin sonuna eklenecektir
            </p>
          </div>

          {/* Kaydet Butonu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Düzenle'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
}
