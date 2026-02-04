import { SEOHead } from "@/components/seo-head";

export const metadata = {
  title: "Kullanım Koşulları | MKN Group",
  description: "MKN Group web sitesi kullanım koşulları ve kuralları",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead
        title="Kullanım Koşulları | MKN Group"
        description="MKN Group web sitesi kullanım koşulları ve kuralları"
        canonical="https://www.mkngroup.com.tr/kullanim-kosullari"
      />

      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Kullanım Koşulları
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Bu kullanım koşulları, <strong>MKN GROUP</strong> ("Şirket",
                "biz", "bizim") tarafından işletilen{" "}
                <span className="font-medium">mkngroup.com.tr</span> web
                sitesinin kullanımını düzenler.
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                  <strong>Resmi Unvan:</strong> TONGZI BERTUG MULTINATIONAL MEDİKAL ÜRÜNLER OTOMOTİV SANAYİ VE DIŞ TİCARET LTD. ŞTİ.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-0">
                  MKN GROUP, yukarıda belirtilen şirketin tescilli ticari markasıdır.
                </p>
              </div>
            </div>

            <h2>1. Kabul ve Uyum</h2>
            <p>
              Bu web sitesine erişim sağlayarak veya bu siteyi kullanarak, bu
              kullanım koşullarını kabul ettiğinizi beyan edersiniz. Bu
              koşulları kabul etmiyorsanız, lütfen web sitesini kullanmayınız.
            </p>

            <h2>2. Hizmet Tanımı</h2>
            <p>
              <strong>MKN Group</strong>, kozmetik sektöründe kapsamlı çözümler
              sunan bir grup şirket olarak aşağıdaki hizmetleri sunmaktadır:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
                  Üretim Hizmetleri
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Kozmetik ve dermokozmetik ürünler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Gıda takviyesi üretimi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Temizlik ve bakım ürünleri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Fason üretim hizmetleri</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
                  Destek Hizmetleri
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Kozmetik ambalaj tedariki</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>E-ticaret operasyon yönetimi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Depo ve kargo hizmetleri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Pazarlama ve reklam desteği</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2>3. Kullanım Kuralları</h2>
            <p>
              Bu web sitesini kullanırken aşağıdaki kurallara uymanız
              gerekmektedir:
            </p>
            <ul>
              <li>
                Yasalara aykırı, zarar verici, tehditkar, kötüye kullanıcı,
                taciz edici içerik paylaşmamak
              </li>
              <li>Başkalarının fikri mülkiyet haklarını ihlal etmemek</li>
              <li>Spam, virüs veya zararlı kod içeren materyal göndermemek</li>
              <li>
                Sistemin güvenliğini tehlikeye atmaya yönelik eylemler
                gerçekleştirmemek
              </li>
              <li>
                Başka kullanıcıları taklit etmemek veya kimliğinizi gizlememek
              </li>
            </ul>

            <h2>4. Fikri Mülkiyet Hakları</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                Bu web sitesindeki tüm içerik, tasarım, logo, metin, grafik,
                fotoğraf ve diğer materyaller
                <strong> MKN Group</strong>'un mülkiyetindedir ve telif hakkı
                yasaları ile korunmaktadır. İzin alınmadan kopyalanması,
                çoğaltılması, dağıtılması yasaktır.
              </p>
            </div>

            <h2>5. Gizlilik</h2>
            <p>
              Kişisel verilerinizin işlenmesi konusunda detaylı bilgi için
              <a
                href="/gizlilik-politikasi"
                className="text-orange-600 hover:text-orange-700"
              >
                Gizlilik Politikamızı
              </a>{" "}
              inceleyiniz.
            </p>

            <h2>6. Sorumluluk Reddi</h2>
            <p>
              MKN Group, web sitesinde yer alan bilgilerin doğruluğu, güncelliği
              ve eksiksizliği konusunda garanti vermemektedir. Web sitesinin
              kullanımından doğabilecek herhangi bir zarar veya kayıptan sorumlu
              tutulamaz.
            </p>

            <h2>7. Hizmet Değişiklikleri</h2>
            <p>
              MKN Group, web sitesinde sunulan hizmetleri herhangi bir zamanda
              değiştirme, askıya alma veya sonlandırma hakkını saklı tutar. Bu
              değişiklikler önceden bildirilmeksizin yapılabilir.
            </p>

            <h2>8. Üçüncü Taraf Bağlantıları</h2>
            <p>
              Web sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir. Bu
              bağlantılar sadece kolaylık sağlamak amacıyla verilmiştir ve MKN
              Group bu sitelerin içeriğinden sorumlu değildir.
            </p>

            <h2>9. Hesap Güvenliği</h2>
            <p>
              Eğer web sitesinde bir hesap oluşturuyorsanız, hesap
              bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi güvenli
              tutmalı ve yetkisiz kullanım durumunda derhal bizimle iletişime
              geçmelisiniz.
            </p>

            <h2>10. Fesih</h2>
            <p>
              MKN Group, bu kullanım koşullarını ihlal eden kullanıcıların
              hesaplarını askıya alma veya sonlandırma hakkını saklı tutar.
              Kullanıcılar da istedikleri zaman hesaplarını kapatabilirler.
            </p>

            <h2>11. Değişiklikler</h2>
            <p>
              MKN Group, bu kullanım koşullarını herhangi bir zamanda değiştirme
              hakkını saklı tutar. Değişiklikler web sitesinde yayınlandığı anda
              yürürlüğe girer. Düzenli olarak bu sayfayı kontrol etmeniz
              önerilir.
            </p>

            <h2>12. Uygulanacak Hukuk</h2>
            <p>
              Bu kullanım koşulları Türkiye Cumhuriyeti yasalarına tabidir.
              Herhangi bir uyuşmazlık durumunda İstanbul mahkemeleri yetkilidir.
            </p>

            <h2>13. İletişim</h2>
            <p>
              Bu kullanım koşulları hakkında sorularınız varsa bizimle iletişime
              geçebilirsiniz:
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-8 mt-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MKN</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    MKN Group
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">
                    Üretimden Pazarlamaya
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    İletişim Bilgileri
                  </h4>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500">📧</span>
                    <span>info@mkngroup.com.tr</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500">📞</span>
                    <span>+90 531 494 25 94</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500">🌐</span>
                    <span>mkngroup.com.tr</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Adres
                  </h4>
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 mt-1">📍</span>
                    <span>
                      Akçaburgaz Mah, 3026 Sk, No:5
                      <br />
                      Esenyurt, İstanbul, Türkiye
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resmi Şirket Bilgisi */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white">MKN GROUP</strong>,{" "}
                <strong>TONGZI BERTUG MULTINATIONAL MEDİKAL ÜRÜNLER OTOMOTİV SANAYİ VE DIŞ TİCARET LTD. ŞTİ.</strong>'nin tescilli ticari markasıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
