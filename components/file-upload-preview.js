'use client';

import { useState } from 'react';
import { Upload, X, Eye, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Dosya Yükleme ve Önizleme Komponenti
 * Sözleşme belgelerini (proforma, evrak vb.) yüklemek için
 */
export default function FileUploadPreview({ 
  files = [], 
  onFilesChange, 
  maxFiles = 5,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  disabled = false 
}) {
  const { toast } = useToast();
  const [previewing, setPreviewing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Uyarı",
        description: `Maksimum ${maxFiles} dosya yükleyebilirsiniz`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const newFiles = selectedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: Date.now() + Math.random()
    }));

    onFilesChange([...files, ...newFiles]);
    setUploading(false);
    e.target.value = ''; // Reset input
  };

  const handleRemove = (fileId) => {
    const updated = files.filter(f => f.id !== fileId);
    onFilesChange(updated);
    
    // URL'yi temizle
    const file = files.find(f => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
  };

  const handlePreview = (file) => {
    setPreviewing(file);
  };

  const closePreview = () => {
    setPreviewing(null);
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
        disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400 bg-white cursor-pointer'
      }`}>
        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        <label 
          htmlFor="file-upload" 
          className={`flex flex-col items-center gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              Dosya yüklemek için tıklayın
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, Word, Resim (Max {maxFiles} dosya)
            </p>
          </div>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Yüklenen Dosyalar ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="text-gray-600">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(file.type.startsWith('image/') || file.type.includes('pdf')) && (
                    <button
                      type="button"
                      onClick={() => handlePreview(file)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Önizle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    disabled={disabled}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Kaldır"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewing && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={closePreview}
        >
          <div 
            className="relative bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewing.name}
              </h3>
              <button
                onClick={closePreview}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {previewing.type.startsWith('image/') ? (
                <img 
                  src={previewing.preview} 
                  alt={previewing.name}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : previewing.type.includes('pdf') ? (
                <iframe
                  src={previewing.preview || URL.createObjectURL(previewing.file)}
                  className="w-full h-[600px] rounded-lg border border-gray-200"
                  title={previewing.name}
                />
              ) : (
                <div className="text-center py-12">
                  <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Bu dosya tipi için önizleme desteklenmiyor
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
