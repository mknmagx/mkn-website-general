# MKN Group Admin Panel Kurulum Kılavuzu

## Genel Bakış

Bu admin panel sistemi, MKN Group web sitesinden gelen quote istekleri ve iletişim mesajlarını yönetmek için geliştirilmiştir.

## Özellikler

### 🔐 Güvenlik
- Firebase Authentication ile güvenli giriş
- Admin rolü tabanlı erişim kontrolü
- Şifre sıfırlama sistemi

### 📊 Dashboard
- Gerçek zamanlı istatistikler
- Quote ve iletişim mesajları özeti
- Hızlı erişim linkleri

### 📋 Quote İstekleri Yönetimi
- Tüm quote isteklerini görüntüleme
- Durum güncelleme (Yeni, İşlemde, Yanıtlandı, Kapatıldı)
- Öncelik seviyesi belirleme
- Detaylı quote bilgilerini inceleme
- Arama ve filtreleme

### 💬 İletişim Mesajları Yönetimi
- Tüm iletişim mesajlarını görüntüleme
- Durum güncelleme
- Hızlı email yanıtı gönderme
- Arama ve filtreleme

## Kurulum

### 1. Admin Kullanıcısı Oluşturma

#### Firebase Console'da:

1. **Firebase Console**'a gidin: https://console.firebase.google.com
2. Projenizi seçin
3. **Authentication** bölümüne gidin
4. **Users** sekmesine tıklayın
5. **Add user** butonuna tıklayın
6. Admin email ve şifre girin (örn: admin@mkngroup.com)
7. Kullanıcıyı oluşturun

#### Firestore'da Admin Rolü Ekleme:

1. **Firestore Database** bölümüne gidin
2. **Start collection** tıklayın
3. Collection ID: `admins`
4. Document ID: Yukarıda oluşturduğunuz kullanıcının UID'sini yazın
   - Firebase Authentication > Users'dan UID'yi kopyalayın
5. Field ekleyin:
   ```
   Field: role
   Type: string
   Value: admin
   ```
6. **Save** tıklayın

### 2. Firestore Güvenlik Kuralları

Firestore Rules'a aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin koleksiyonu - sadece authenticated kullanıcılar okuyabilir
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quote istekleri - admin kullanıcıları okuyup yazabilir
    match /quote-requests/{document} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
      allow create: if true; // Web sitesinden form gönderimi için
    }
    
    // İletişim mesajları - admin kullanıcıları okuyup yazabilir  
    match /contact-messages/{document} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
      allow create: if true; // Web sitesinden form gönderimi için
    }
  }
}
```

### 3. Erişim URL'leri

- **Admin Giriş**: `/admin/login`
- **Ana Dashboard**: `/admin/dashboard`
- **Quote İstekleri**: `/admin/quotes`
- **İletişim Mesajları**: `/admin/contacts`

## Kullanım

### Giriş Yapma

1. `/admin/login` adresine gidin
2. Admin email ve şifrenizi girin
3. **Giriş Yap** butonuna tıklayın

### Quote İstekleri Yönetimi

1. Sol menüden **Quote İstekleri**'ne tıklayın
2. Liste halinde tüm quote isteklerini görün
3. **Arama çubuğu** ile istediğiniz quote'u bulun
4. **Durum** dropdown'ından durumu güncelleyin
5. **Göz simgesi**'ne tıklayarak detayları görün

### İletişim Mesajları Yönetimi

1. Sol menüden **İletişim Mesajları**'na tıklayın
2. Liste halinde tüm mesajları görün
3. **Arama çubuğu** ile mesaj arayın
4. **Durum** dropdown'ından durumu güncelleyin
5. **Göz simgesi**'ne tıklayarak detayları görün
6. Detay modal'ında **Email Gönder** butonu ile hızlı yanıt

## Durum Açıklamaları

### Quote ve İletişim Durumları:
- **Yeni**: Henüz işlem görmemiş talepler
- **İşlemde**: Üzerinde çalışılmakta olan talepler
- **Yanıtlandı**: Müşteriye yanıt verilmiş talepler
- **Kapatıldı**: Tamamlanmış veya iptal edilmiş talepler

### Öncelik Seviyeleri:
- **Düşük**: Normal işlem sırası
- **Normal**: Standart öncelik
- **Yüksek**: Öncelikli işlem
- **Acil**: En yüksek öncelik

## Güvenlik Notları

- Admin şifrelerini güçlü ve karmaşık yapın
- Sadece güvenilir kişilere admin erişimi verin
- Düzenli olarak admin aktivitelerini kontrol edin
- Şüpheli aktivite durumunda şifreleri değiştirin

## Teknik Destek

Herhangi bir sorun yaşarsanız:
1. Tarayıcı konsolunu kontrol edin
2. Firebase Console'dan hata loglarını inceleyin
3. Firestore Rules'ın doğru ayarlandığından emin olun
4. Admin kullanıcısının doğru role sahip olduğunu kontrol edin

## Güncellemeler

Admin panel düzenli olarak güncellenmektedir. Yeni özellikler:
- ✅ Gerçek zamanlı bildirimler
- ✅ Gelişmiş filtreleme seçenekleri
- ✅ Email şablonları
- ✅ Raporlama sistemi

---

© 2024 MKN Group - Tüm hakları saklıdır.