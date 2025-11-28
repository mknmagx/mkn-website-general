import { SEOHead } from "@/components/seo-head";

export const metadata = {
  title: "İade ve Değişim Politikası | MKN Group",
  description: "MKN Group ürün ve hizmetleri için iade, değişim ve iptali koşulları",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead
        title="İade ve Değişim Politikası | MKN Group"
        description="MKN Group ürün ve hizmetleri için iade, değişim ve iptali koşulları"
        canonical="https://www.mkngroup.com.tr/iade-politikasi"
      />

      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              İade ve Değişim Politikası
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                <strong>MKN Group</strong> olarak, müşteri memnuniyeti bizim
                için önceliklidir. Bu iade ve değişim politikası, ambalaj ürün
                satışları ve diğer hizmet satışları için geçerli koşulları
                içermektedir. Hem müşterilerimizin hem de şirketimizin
                haklarını korumak amacıyla hazırlanmıştır.
              </p>
            </div>

            <h2>1. Genel Prensipler</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                MKN Group, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
                ilgili yönetmeliklere tam uyum sağlamaktadır. İade ve değişim
                koşulları, ürün ve hizmet türlerine göre farklılık
                göstermektedir.
              </p>
            </div>

            <h2>2. Kozmetik Ambalaj Ürünleri İadesi</h2>
            
            <h3>2.1 İade Koşulları</h3>
            <p>Ambalaj ürünlerinin iadesi aşağıdaki koşullarda kabul edilir:</p>
            <ul>
              <li>
                <strong>Ürün hasarlı veya hatalı ise:</strong> Teslimat sırasında
                hasarlı veya kusurlu ürünler, teslimattan itibaren 48 saat
                içinde fotoğraflı olarak bildirilmelidir.
              </li>
              <li>
                <strong>Yanlış ürün gönderimi:</strong> Siparişe uygun olmayan
                ürün teslimatı durumunda, 48 saat içinde bildirim yapılmalıdır.
              </li>
              <li>
                <strong>Miktar eksikliği:</strong> Sipariş miktarından az ürün
                teslimatı durumunda, teslimat fişi ile birlikte 48 saat içinde
                bildirim gereklidir.
              </li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 my-6">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>⚠️</span> Önemli Bilgi
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                Ambalaj ürünlerinde, müşteri kaynaklı hata (yanlış ürün seçimi,
                fikir değişikliği vb.) durumlarında iade kabul edilmez. Sipariş
                öncesinde numune talebinde bulunmanız ve ürünleri detaylı
                incelemeniz önerilir.
              </p>
            </div>

            <h3>2.2 İade Edilemeyen Ürünler</h3>
            <p>Aşağıdaki durumlardaki ürünlerin iadesi kabul edilmez:</p>
            <ul>
              <li>Özel üretim veya kişiselleştirilmiş ambalaj ürünleri</li>
              <li>Müşteri onayı ile üretilen özel baskılı ürünler</li>
              <li>Ambalajı açılmış veya kullanılmış ürünler</li>
              <li>İade süresi (48 saat) geçmiş ürünler</li>
              <li>Müşteri hatasıyla hasar görmüş ürünler</li>
              <li>Hijyen koşulları nedeniyle geri dönüşü uygun olmayan ürünler</li>
            </ul>

            <h3>2.3 İade Prosedürü</h3>
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="text-2xl">1️⃣</span> Bildirim
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Teslimat tarihinden itibaren 48 saat içinde iletişim
                  kanallarımızdan biriyle iade talebinizi bildirin. Ürün
                  fotoğrafları ve sipariş bilgilerini paylaşın.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
                  <span className="text-2xl">2️⃣</span> Onay
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  İade talebiniz incelendikten sonra 2 iş günü içinde tarafınıza
                  geri dönüş yapılır. İade onayı alındıktan sonra ürün geri
                  gönderim talimatları paylaşılır.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <span className="text-2xl">3️⃣</span> Kargo
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Onaylanan iadeler için kargo ücreti MKN Group tarafından
                  karşılanır. Ürünler orijinal ambalajında ve fatura ile birlikte
                  gönderilmelidir.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <span className="text-2xl">4️⃣</span> İşlem
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  İade edilen ürün tarafımıza ulaştıktan sonra kontrol edilir.
                  Uygun bulunması durumunda 5 iş günü içinde ödeme iadesi veya
                  ürün değişimi gerçekleştirilir.
                </p>
              </div>
            </div>

            <h2>3. Fason Üretim Hizmetleri İptali</h2>

            <h3>3.1 İptal Koşulları</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-400">
                  Üretim Öncesi İptal
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Üretim başlamadan önce yapılan iptal talepleri kabul edilir.
                  Ancak aşağıdaki masraflar müşteriye yansıtılır:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Formülasyon geliştirme ve AR-GE çalışmaları ücreti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Sipariş edilen hammadde maliyeti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Özel kalıp veya alet giderleri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Proje yönetimi ve planlama maliyeti (toplam tutarın %10'u)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-400">
                  Üretim Başladıktan Sonra
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-0">
                  Üretim süreci başladıktan sonra yapılan iptal talepleri kabul
                  edilmez. Üretilen ürünler için ödeme yükümlülüğü devam eder.
                  Ancak force majeure (doğal afet, salgın, savaş vb.) gibi
                  öngörülemeyen durumlar değerlendirmeye alınır.
                </p>
              </div>
            </div>

            <h3>3.2 Üretim Hataları</h3>
            <p>
              MKN Group kaynaklı üretim hataları durumunda tüm sorumluluk
              şirketimize aittir:
            </p>
            <ul>
              <li>
                <strong>Formül hataları:</strong> Onaylanan formülden sapma
                durumunda ürün yeniden üretilir.
              </li>
              <li>
                <strong>Üretim kusurları:</strong> Kalite standartlarına uymayan
                ürünler için yeniden üretim veya tam iade yapılır.
              </li>
              <li>
                <strong>Ambalajlama hataları:</strong> Hatalı etiketleme veya
                paketleme durumunda düzeltme veya yeniden üretim yapılır.
              </li>
              <li>
                <strong>Miktar eksiklikleri:</strong> Sipariş edilen miktardan
                eksik üretim durumunda eksik miktar tamamlanır veya ücret iadesi
                yapılır.
              </li>
            </ul>

            <h2>4. E-ticaret ve Pazarlama Hizmetleri İptali</h2>

            <h3>4.1 Aylık Paket Hizmetleri</h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                E-ticaret operasyon yönetimi, pazarlama ve reklam hizmetleri
                aylık paket bazlı sunulmaktadır:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>
                    <strong>İlk 3 ay:</strong> Minimum taahhüt süresi olup bu
                    süre içinde iptal kabul edilmez.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>
                    <strong>3. aydan sonra:</strong> 30 gün önceden yazılı
                    bildirim ile iptal edilebilir.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>
                    <strong>İptal sonrası:</strong> O ay için alınan ödeme iade
                    edilmez, hizmet ayın sonuna kadar devam eder.
                  </span>
                </li>
              </ul>
            </div>

            <h3>4.2 Proje Bazlı Hizmetler</h3>
            <p>
              Tasarım, marka kimliği geliştirme gibi proje bazlı hizmetlerde:
            </p>
            <ul>
              <li>
                Proje başlamadan önce yapılan iptallerde %50 kesinti ile iade
                yapılır.
              </li>
              <li>
                Proje başladıktan sonra tamamlanan aşama oranında ücret
                tahakkuk eder.
              </li>
              <li>
                Tamamlanan aşamalar için iade yapılmaz, kalan tutar iade edilir.
              </li>
              <li>
                Müşteri onayı alınan teslimler için iade talep edilemez.
              </li>
            </ul>

            <h2>5. Ödeme İadesi</h2>

            <h3>5.1 İade Yöntemleri</h3>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-teal-700 dark:text-teal-400">
                  💳 Kredi Kartı
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Kredi kartı ile yapılan ödemelerde iade, aynı kart üzerinden
                  gerçekleştirilir. Banka işlem süresine göre 5-10 iş günü içinde
                  hesabınıza yansır.
                </p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-teal-700 dark:text-teal-400">
                  🏦 Havale/EFT
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Havale/EFT ile yapılan ödemelerde iade, belirtilen banka
                  hesabına yapılır. İşlem süresi 5 iş günüdür.
                </p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-teal-700 dark:text-teal-400">
                  🔄 Değişim
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Ürün değişimi tercih edilirse, yeni ürün fiyat farkı var ise
                  ek ödeme veya iade gerçekleştirilir.
                </p>
              </div>
            </div>

            <h3>5.2 İade Süresi</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                İade talebinin onaylanması ve ürünün tarafımıza ulaşmasından
                sonra, ödeme iadesi <strong>5 iş günü</strong> içinde
                gerçekleştirilir. Banka işlem süreleri bu süreye dahil değildir.
              </p>
            </div>

            <h2>6. Kargo ve Nakliye</h2>

            <h3>6.1 İade Kargo Ücreti</h3>
            <ul>
              <li>
                <strong>MKN Group kaynaklı hatalar:</strong> Kargo ücreti
                şirketimiz tarafından karşılanır.
              </li>
              <li>
                <strong>Hasarlı/kusurlu ürün:</strong> Kargo ücreti şirketimiz
                tarafından karşılanır.
              </li>
              <li>
                <strong>Müşteri kaynaklı iptaller:</strong> Kargo ücreti
                müşteriye aittir (geçerli olduğu durumlarda).
              </li>
            </ul>

            <h3>6.2 Kargo Sigorta ve Sorumluluk</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Tüm gönderimlerimiz kargo sigortası ile yapılmaktadır. Kargo
                şirketi kaynaklı hasarlar için:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Teslimat anında hasar tespit edilirse tutanak tutulmalıdır.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Hasar fotoğrafları ile birlikte 24 saat içinde bildirim
                    yapılmalıdır.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Kargo şirketi ile hasar tazminat süreci başlatılır.
                  </span>
                </li>
              </ul>
            </div>

            <h2>7. Garanti ve Kalite Güvencesi</h2>

            <h3>7.1 Ürün Garantisi</h3>
            <p>MKN Group tarafından satılan tüm ürünler için:</p>
            <ul>
              <li>
                <strong>Üretim garantisi:</strong> Fason üretim ürünlerinde
                formülasyon ve üretim kalitesi 12 ay garanti kapsamındadır.
              </li>
              <li>
                <strong>Ambalaj garantisi:</strong> Ambalaj ürünlerinde üretici
                firma garanti koşulları geçerlidir (genellikle 6-12 ay).
              </li>
              <li>
                <strong>Kullanım ömrü:</strong> Ürün son kullanma tarihi içinde
                kalite standartları garanti edilir.
              </li>
            </ul>

            <h3>7.2 Garanti Kapsamı Dışı Durumlar</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Aşağıdaki durumlarda garanti kapsamı dışındadır:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Hatalı depolama koşulları (uygunsuz sıcaklık, nem, ışık)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Son kullanma tarihi geçmiş ürünler</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Kullanım talimatlarına uygun olmayan kullanım</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Müşteri kaynaklı fiziksel hasarlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Yetkisiz kişiler tarafından yapılan değişiklikler</span>
                </li>
              </ul>
            </div>

            <h2>8. Müşteri Hakları ve Sorumlulukları</h2>

            <h3>8.1 Müşteri Hakları</h3>
            <ul>
              <li>Sipariş öncesi detaylı ürün bilgisi alma hakkı</li>
              <li>Numune talep etme ve test etme hakkı</li>
              <li>Kalite kontrol raporu talep etme hakkı</li>
              <li>Üretim sürecini takip etme hakkı (fason üretimde)</li>
              <li>Zamanında teslimat hakkı</li>
              <li>Şikâyet ve talepleri için yanıt alma hakkı</li>
            </ul>

            <h3>8.2 Müşteri Sorumlulukları</h3>
            <ul>
              <li>Doğru ve eksiksiz sipariş bilgisi vermek</li>
              <li>Ödeme yükümlülüklerini zamanında yerine getirmek</li>
              <li>Ürünleri uygun koşullarda depolamak</li>
              <li>İade prosedürlerine uymak</li>
              <li>Hasar durumlarını zamanında bildirmek</li>
              <li>Sözleşme şartlarına uymak</li>
            </ul>

            <h2>9. İletişim ve Şikâyet Yönetimi</h2>

            <h3>9.1 İletişim Kanalları</h3>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8 my-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MKN</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    İade ve Destek Ekibi
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    Size yardımcı olmak için buradayız
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Müşteri Hizmetleri
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-purple-500">📧</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          E-posta
                        </div>
                        <div className="font-medium">info@mkngroup.com.tr</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-purple-500">📞</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Telefon
                        </div>
                        <div className="font-medium">+90 531 494 25 94</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-purple-500">⏰</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Çalışma Saatleri
                        </div>
                        <div className="font-medium">Hafta içi 09:00 - 18:00</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Destek Süreçleri
                  </h4>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>
                          <strong>Yanıt süresi:</strong> 24 saat içinde
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>
                          <strong>İade onayı:</strong> 2 iş günü
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>
                          <strong>Ödeme iadesi:</strong> 5 iş günü
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>
                          <strong>Şikâyet çözüm:</strong> 7 iş günü
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h3>9.2 Tüketici Hakem Heyeti</h3>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Şirketimizle çözülemeyen uyuşmazlıklarda tüketiciler aşağıdaki
                yollara başvurabilir:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>
                    İlgili İl veya İlçe Tüketici Hakem Heyetine başvuru
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Tüketici Mahkemelerine dava açma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>
                    Değer limitleri: 2025 yılı için güncel parasal limitler
                    geçerlidir
                  </span>
                </li>
              </ul>
            </div>

            <h2>10. Özel Durumlar ve İstisnalar</h2>

            <h3>10.1 Force Majeure (Mücbir Sebep)</h3>
            <p>
              Doğal afet, savaş, terör, salgın hastalık, grev, hükümet kararları
              gibi öngörülemeyen ve kontrolümüz dışındaki durumlarda yükümlülükler
              askıya alınabilir veya iptal edilebilir. Bu durumda taraflar karşılıklı
              görüşerek çözüm yolu belirler.
            </p>

            <h3>10.2 Toplu Siparişler</h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                50.000 TL ve üzeri toplu siparişlerde özel iade koşulları
                geçerlidir. Sipariş öncesi detaylı sözleşme hazırlanır ve
                karşılıklı imzalanır. Bu sözleşmedeki özel koşullar bu genel
                politikadan öncelikli olarak uygulanır.
              </p>
            </div>

            <h3>10.3 İhracat Siparişleri</h3>
            <p>
              Yurtdışına yapılan satışlarda uluslararası ticaret kuralları ve
              hedef ülke mevzuatı geçerlidir. Gümrük, vergi ve nakliye masrafları
              iade hesaplamalarında dikkate alınır.
            </p>

            <h2>11. Yasal Çerçeve ve Uygulanacak Hukuk</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Bu iade politikası aşağıdaki yasal düzenlemelere tabidir:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span>6502 sayılı Tüketicinin Korunması Hakkında Kanun</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span>Mesafeli Sözleşmeler Yönetmeliği</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span>6098 sayılı Türk Borçlar Kanunu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span>İlgili diğer mevzuat ve yönetmelikler</span>
                </li>
              </ul>
            </div>

            <h2>12. Politika Güncellemeleri</h2>
            <p>
              MKN Group, bu iade politikasını yasal değişiklikler, operasyonel
              gereksinimler veya hizmet iyileştirmeleri doğrultusunda güncelleme
              hakkını saklı tutar. Güncellemeler web sitesinde yayınlandığı tarihte
              yürürlüğe girer. Önemli değişiklikler müşterilere e-posta ile
              bildirilir.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>✅</span> MKN Group Kalite Taahhüdü
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                Müşteri memnuniyeti odaklı çalışma prensibimiz gereği, her
                durumda adil ve dengeli çözümler üretmeye çalışıyoruz. Ürün ve
                hizmet kalitemizin yanı sıra satış sonrası desteğimizle de
                güvenilir iş ortağınız olmayı hedefliyoruz. Sorularınız ve
                talepleriniz için lütfen bizimle iletişime geçmekten
                çekinmeyin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
