import { v2 as cloudinary } from "cloudinary";

// Cloudinary yapılandırması
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Slug oluşturma fonksiyonu (Türkçe karakter desteği ile)
const createImageSlug = (productName, index = 0) => {
  const slug = productName
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return index > 0 ? `${slug}-${index + 1}` : slug;
};

// Görsel yükleme fonksiyonu
export const uploadImageToCloudinary = async (file, productName, index = 0) => {
  try {
    // Görsel ismini ürün ismine göre oluştur
    const imageName = createImageSlug(productName, index);

    // Buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "mkngroup", // Ana Cloudinary klasörü
            public_id: imageName, // Dosya adı
            overwrite: true, // Aynı isimde dosya varsa üzerine yaz
            quality: "auto:best", // Otomatik kalite optimizasyonu
            format: "webp", // WebP formatına çevir
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                publicId: result.public_id,
                url: result.secure_url,
                imageName: `${imageName}.webp`,
              });
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    throw new Error(`Görsel yükleme hatası: ${error.message}`);
  }
};

// Görsel silme fonksiyonu
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Görsel silme hatası: ${error.message}`);
  }
};

// Case dosyası yükleme fonksiyonu (PDF, Word, Excel, görsel vs. destekli)
export const uploadCaseFile = async (file, caseId, fileName = null) => {
  try {
    // Dosya tipini belirle
    const fileType = file.type || "";
    const isImage = fileType.startsWith("image/");
    
    // Orijinal dosya adını al veya parametre kullan
    const originalName = fileName || file.name || `file-${Date.now()}`;
    
    // Dosya adından uzantıyı ayır
    const lastDotIndex = originalName.lastIndexOf(".");
    const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex + 1) : "";
    
    // Slug oluştur (Türkçe karakter desteği)
    const slugName = baseName
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    // Unique ID ekle
    const uniqueId = Date.now().toString(36);
    const publicId = `${slugName}-${uniqueId}`;
    
    // Buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: `mkngroup/cases/${caseId}`,
        public_id: publicId,
        overwrite: true,
        resource_type: isImage ? "image" : "raw", // raw = PDF, Word, Excel vs.
      };
      
      // Görsel ise kalite optimizasyonu ekle (ama format değiştirme)
      if (isImage) {
        uploadOptions.quality = "auto:good";
      }

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
              fileName: originalName,
              fileType: fileType,
              fileSize: file.size,
              isImage: isImage,
              format: result.format || extension,
            });
          }
        })
        .end(buffer);
    });
  } catch (error) {
    throw new Error(`Dosya yükleme hatası: ${error.message}`);
  }
};

// Case dosyası silme fonksiyonu
export const deleteCaseFile = async (publicId, isImage = true) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: isImage ? "image" : "raw",
    });
    return result;
  } catch (error) {
    throw new Error(`Dosya silme hatası: ${error.message}`);
  }
};

// Çoklu görsel yükleme fonksiyonu
export const uploadMultipleImages = async (files, productName) => {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadImageToCloudinary(file, productName, index)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Çoklu görsel yükleme hatası: ${error.message}`);
  }
};

export default cloudinary;
