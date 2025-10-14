import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleImages, deleteImageFromCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');
    const productName = formData.get('productName');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Hiç görsel seçilmedi' },
        { status: 400 }
      );
    }

    if (!productName) {
      return NextResponse.json(
        { error: 'Ürün adı gerekli' },
        { status: 400 }
      );
    }

    // Dosya validasyonu
    const validFiles = files.filter(file => {
      return file.size > 0 && file.type.startsWith('image/');
    });

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli görsel dosyası bulunamadı' },
        { status: 400 }
      );
    }

    // Görselleri Cloudinary'e yükle
    const uploadResults = await uploadMultipleImages(validFiles, productName);
    
    // Sadece görsel isimlerini döndür (Firestore için)
    const imageNames = uploadResults.map(result => result.imageName);

    return NextResponse.json({
      success: true,
      images: imageNames,
      uploadDetails: uploadResults // Debug için
    });

  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Görsel yükleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { publicIds } = await request.json();

    if (!publicIds || !Array.isArray(publicIds)) {
      return NextResponse.json(
        { error: 'Public ID listesi gerekli' },
        { status: 400 }
      );
    }

    // Görselleri Cloudinary'den sil
    const deletePromises = publicIds.map(publicId => 
      deleteImageFromCloudinary(publicId)
    );
    
    const deleteResults = await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      results: deleteResults
    });

  } catch (error) {
    console.error('Görsel silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Görsel silme işlemi başarısız' },
      { status: 500 }
    );
  }
}